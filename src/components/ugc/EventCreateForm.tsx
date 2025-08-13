import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DateTimePicker } from "@/components/DateTimePicker";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const schema = z.object({
  title: z.string().min(4, "Minim 4 caractere").max(100, "Maxim 100 caractere"),
  subtitle: z.string().max(200, "Maxim 200 caractere").optional().or(z.literal("")),
  description: z.string().max(1000, "Maxim 1000 caractere").optional().or(z.literal("")),
  starts_at: z.date({ required_error: "Selectează data și ora de început" }),
  ends_at: z.date().optional(),
  city: z.string().max(64, "Maxim 64 caractere").optional().or(z.literal("")),
  venue: z.string().max(100, "Maxim 100 caractere").optional().or(z.literal("")),
  category_id: z.string().optional(),
  official_url: z.string().url("URL invalid").optional().or(z.literal("")),
  image_url: z.string().url("URL invalid").optional().or(z.literal("")),
  honeypot: z.string().max(0).optional(),
  tos: z.literal(true, { errorMap: () => ({ message: "Trebuie să accepți termenii" }) }),
});

type FormValues = z.infer<typeof schema>;

interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

export default function EventCreateForm({ onSuccess }: { onSuccess: (v: { id: string }) => void }) {
  const { user, signInWithEmail } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [autoResubmit, setAutoResubmit] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      subtitle: "",
      description: "",
      starts_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      city: "",
      venue: "",
      official_url: "",
      image_url: "",
      honeypot: "",
      tos: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // If user logs in while dialog open, retry submit
  useEffect(() => {
    if (user && autoResubmit) {
      (async () => {
        setLoginOpen(false);
        await handleSubmit(autoResubmit);
        setAutoResubmit(null);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadCategories = async () => {
    const { data } = await supabase.from('event_category').select('*').order('name');
    setCategories(data || []);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!user) {
      setLoginOpen(true);
      setAutoResubmit(values);
      return;
    }

    try {
      setSubmitting(true);
      const { data, error } = await supabase.functions.invoke('events_submit', {
        body: {
          title: values.title,
          subtitle: values.subtitle || undefined,
          description: values.description || undefined,
          starts_at: values.starts_at.toISOString(),
          ends_at: values.ends_at?.toISOString(),
          city: values.city || undefined,
          venue: values.venue || undefined,
          category_id: values.category_id || undefined,
          official_url: values.official_url || undefined,
          image_url: values.image_url || undefined,
          honeypot: values.honeypot,
        },
      });
      
      if (error) throw error;
      onSuccess(data as any);
      toast({ 
        title: 'Trimis pentru moderare', 
        description: 'Evenimentul tău a fost trimis și va fi revizuit de echipa noastră.' 
      });
    } catch (e: any) {
      const msg = e?.message ?? e?.error ?? 'Eroare';
      toast({ title: 'Eroare', description: String(msg), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const onLogin = async () => {
    if (!email) { 
      toast({ title: 'Email necesar' }); 
      return; 
    }
    await signInWithEmail(email);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titlu eveniment *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Concert Coldplay București 2025" {...field} />
                </FormControl>
                <FormDescription>Numele clear al evenimentului (4–100 caractere).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtitlu (opțional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Turneul mondial Music of the Spheres" {...field} />
                </FormControl>
                <FormDescription>Informații suplimentare despre eveniment.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descriere (opțional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descriere detaliată a evenimentului..." 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>Descriere detaliată (maxim 1000 caractere).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="starts_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data și ora de început *</FormLabel>
                  <FormControl>
                    <DateTimePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ends_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data și ora de sfârșit (opțional)</FormLabel>
                  <FormControl>
                    <DateTimePicker value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Oraș</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: București" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Locația</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Arena Națională" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categorie</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="official_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site oficial (opțional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://eveniment.ro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagine (URL, opțional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...form.register('honeypot')} />

          <FormField
            control={form.control}
            name="tos"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <input 
                    id="tos" 
                    type="checkbox" 
                    checked={field.value} 
                    onChange={field.onChange} 
                    className="h-4 w-4" 
                  />
                  <FormLabel htmlFor="tos">
                    Accept <a href="/legal/terms" className="underline">Termenii și condițiile</a>
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Se trimite…' : 'Trimite evenimentul'}
            </Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Resetează
            </Button>
          </div>
        </form>
      </Form>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autentificare necesară</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Introdu emailul pentru a primi un link magic și a putea trimite evenimentul.
            </p>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplu@domeniu.ro" 
            />
            <Button onClick={onLogin}>Trimite linkul magic</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}