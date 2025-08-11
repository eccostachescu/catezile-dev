import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DateTimePicker } from "@/components/DateTimePicker";
import { toast } from "@/components/ui/use-toast";

const CountdownSchema = z.object({
  title: z.string().min(3, "Minim 3 caractere"),
  when: z.date({ required_error: "Selectează data" }),
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
    },
  });

  const onSubmit = (data: CountdownForm) => {
    toast({ title: "Preview countdown", description: `${data.title} → ${data.when.toISOString()}` });
  };

  return (
    <>
      <SEO title="Creează countdown" path="/creeaza" />
      <Container className="py-8">
        <h1 className="text-3xl font-semibold mb-6">Creează un countdown</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 max-w-xl">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titlu</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: BAC 2025 – Română" {...field} />
                  </FormControl>
                  <FormDescription>Numele clar al evenimentului.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="when"
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

            <div className="flex gap-2">
              <Button type="submit">Generează</Button>
              <Button type="button" variant="outline" onClick={() => form.reset()}>Resetează</Button>
            </div>
          </form>
        </Form>
      </Container>
    </>
  );
}
