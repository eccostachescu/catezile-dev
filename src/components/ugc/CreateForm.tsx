import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DateTimePicker } from "@/components/DateTimePicker";
import { toast } from "@/hooks/use-toast";
import PreviewCard from "./PreviewCard";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const schema = z.object({
  title: z.string().min(4, "Minim 4 caractere").max(80, "Maxim 80 caractere"),
  target: z.date({ required_error: "Selectează data și ora" }),
  city: z.string().min(2, "Minim 2 caractere").max(64, "Maxim 64 caractere").optional().or(z.literal("")),
  privacy: z.enum(["PUBLIC", "UNLISTED"]).default("PUBLIC"),
  theme: z.enum(["T1", "T2", "T3"]).default("T2"),
  honeypot: z.string().max(0).optional(),
  tos: z.literal(true, { errorMap: () => ({ message: "Trebuie să accepți termenii" }) }),
});

type FormValues = z.infer<typeof schema>;

export default function CreateForm({ onSuccess }: { onSuccess: (v: { id: string; slug?: string }) => void }) {
  const { user, signInWithEmail } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const startRef = useRef<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [autoResubmit, setAutoResubmit] = useState<any>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      target: new Date(Date.now() + 24 * 60 * 60 * 1000),
      city: "",
      privacy: "PUBLIC",
      theme: "T2",
      honeypot: "",
      tos: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    const id = setTimeout(() => setCanSubmit(true), 5000);
    return () => clearTimeout(id);
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

  const handleSubmit = async (values: FormValues) => {
    if (!canSubmit) {
      toast({ title: "Așteaptă puțin", description: "Te rugăm să aștepți câteva secunde înainte de submit." });
      return;
    }
    if (!user) {
      setLoginOpen(true);
      setAutoResubmit(values);
      return;
    }
    try {
      setSubmitting(true);
      const { data, error } = await supabase.functions.invoke('create_countdown', {
        body: {
          title: values.title,
          target_at: values.target.toISOString(),
          privacy: values.privacy,
          city: values.city || undefined,
          theme: values.theme,
          honeypot: values.honeypot,
        },
      });
      if (error) throw error;
      onSuccess(data as any);
      toast({ title: 'Creat', description: 'Countdown-ul tău a fost creat și așteaptă aprobare.' });
    } catch (e: any) {
      const msg = e?.message ?? e?.error ?? 'Eroare';
      toast({ title: 'Eroare', description: String(msg) });
    } finally {
      setSubmitting(false);
    }
  };

  const onLogin = async () => {
    if (!email) { toast({ title: 'Email necesar' }); return; }
    await signInWithEmail(email);
  };

  const values = form.watch();
  const target = values.target ?? null;

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titlu</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Admitere UMF 2025" {...field} />
                </FormControl>
                <FormDescription>Numele clar al evenimentului (4–80 caractere).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="target"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data și ora</FormLabel>
                <FormControl>
                  <DateTimePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Oraș (opțional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: București" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4">
            <PreviewCard title={values.title} targetAt={target} city={values.city || undefined} />
          </div>

          <input type="text" className="hidden" tabIndex={-1} autoComplete="off" {...form.register('honeypot')} />

          <FormField
            control={form.control}
            name="tos"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <input id="tos" type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4" />
                  <FormLabel htmlFor="tos">Accept <a href="/legal/terms" className="underline">Termenii</a></FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button type="submit" disabled={!canSubmit || submitting}>{submitting ? 'Se trimite…' : 'Creează countdown'}</Button>
            <Button type="button" variant="outline" onClick={() => form.reset()}>Resetează</Button>
          </div>
        </form>
      </Form>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autentificare necesară</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Introdu emailul pentru a primi un link magic.</p>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplu@domeniu.ro" />
            <Button onClick={onLogin}>Trimite linkul magic</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
