import { useState } from "react";
import Container from "@/components/Container";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/Button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export default function NewsletterCta() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast({ title: 'Email invalid', description: 'Te rugăm să introduci un email valid.' });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('newsletter_subscriber').insert({ email });
    setLoading(false);
    if (error) {
      toast({ title: 'Eroare', description: error.message });
    } else {
      (window as any).plausible?.('subscribe');
      toast({ title: 'Gata!', description: 'Îți trimitem noutățile esențiale.' });
      setEmail("");
    }
  }

  return (
    <section className="py-10">
      <Container>
        <div className="mx-auto max-w-2xl rounded-xl border bg-card p-6 text-center shadow-sm">
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">Abonează-te la noutăți</h2>
          <p className="text-sm text-muted-foreground mb-4">Primești un rezumat scurt cu evenimentele esențiale.</p>
          <form onSubmit={onSubmit} className="flex gap-2">
            <Input aria-label="Email" placeholder="email@exemplu.ro" value={email} onChange={(e)=>setEmail(e.target.value)} className="flex-1" />
            <Button disabled={loading} type="submit">Abonează-mă</Button>
          </form>
        </div>
      </Container>
    </section>
  );
}
