import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DateTimePicker } from "@/components/DateTimePicker";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";

const CountdownSchema = z.object({
  title: z.string().min(3, "Minim 3 caractere"),
  when: z.date({ required_error: "Selectează data" }),
  location: z.string().optional(),
}).refine((v) => v.when.getTime() > Date.now(), {
  message: "Data trebuie să fie în viitor",
  path: ["when"],
});

type CountdownForm = z.infer<typeof CountdownSchema>;

export default function CreateCountdown() {
  const form = useForm<CountdownForm>({
    resolver: zodResolver(CountdownSchema),
    defaultValues: {
      title: "",
      when: new Date(Date.now() + 24*60*60*1000),
      location: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const onSubmit = async (data: CountdownForm) => {
    if (!user) {
      toast({ 
        title: "Autentificare necesară", 
        description: "Trebuie să fii logat pentru a crea un countdown.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: result, error } = await supabase.functions.invoke('create_countdown', {
        body: {
          title: data.title,
          target_date: data.when.toISOString(),
          city: data.location || '',
          privacy: 'public',
          theme: 'default'
        }
      });

      if (error) throw error;

      toast({ 
        title: "Countdown creat!", 
        description: `${data.title} a fost creat cu succes.`
      });

      // Navigate to the created countdown
      if (result?.slug) {
        navigate(`/countdown/${result.slug}`);
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error creating countdown:', error);
      toast({ 
        title: "Eroare", 
        description: error.message || "Nu am putut crea countdown-ul.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title="Creează countdown" path="/creeaza" />
      <Container className="py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[--cz-ink] mb-4">Creează un countdown</h1>
            <p className="text-lg text-[--cz-ink-muted]">
              Creează un countdown personalizat pentru orice eveniment important
            </p>
          </div>

          <div className="bg-[--cz-surface] border border-[--cz-border] rounded-2xl p-8 shadow-lg">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[--cz-ink] font-semibold">Titlul evenimentului</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: BAC 2025 – Română, Nunta mea, Concert favorit" 
                          {...field} 
                          className="h-12 text-lg"
                        />
                      </FormControl>
                      <FormDescription className="text-[--cz-ink-muted]">
                        Numele clar al evenimentului pentru care vrei să creezi countdown
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="when"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[--cz-ink] font-semibold">Data și ora evenimentului</FormLabel>
                      <FormControl>
                        <DateTimePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormDescription className="text-[--cz-ink-muted]">
                        Selectează data și ora exactă a evenimentului
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[--cz-ink] font-semibold">Locația (opțional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ex: București, Cluj-Napoca, Arena Națională" 
                          {...field} 
                          className="h-12"
                        />
                      </FormControl>
                      <FormDescription className="text-[--cz-ink-muted]">
                        Unde va avea loc evenimentul
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="flex-1 h-12 text-lg font-semibold"
                  >
                    {submitting ? "Se creează..." : "Creează countdown"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => form.reset()}
                    className="h-12 px-8"
                    disabled={submitting}
                  >
                    Resetează
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          <div className="mt-6 text-center text-sm text-[--cz-ink-muted]">
            Countdown-ul tău va fi public și va putea fi văzut de alți utilizatori
          </div>
        </div>
      </Container>
    </>
  );
}