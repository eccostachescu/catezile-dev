import { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { routes } from "@/lib/routes";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function AuthLogin() {
  const { signInWithEmail, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sp] = useSearchParams();
  const redirect = sp.get("redirect") || routes.account();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signInWithEmail(email);
  };

  const signInWithGoogle = async () => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({ 
        provider: "google", 
        options: { redirectTo } 
      });
      
      if (error) {
        console.error('Google auth error:', error);
        toast({ title: "Eroare", description: "Nu s-a putut conecta cu Google. Încearcă din nou." });
      }
    } catch (err) {
      console.error('Unexpected Google auth error:', err);
      toast({ title: "Eroare", description: "A apărut o eroare neașteptată. Încearcă din nou." });
    }
  };

  return (
    <main className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-semibold mb-2">Autentificare</h1>
      <p className="text-sm text-muted-foreground mb-6">Prin continuare, ești de acord cu <Link to={routes.legalTerms()} className="underline">Termenii</Link> și <Link to={routes.legalPrivacy()} className="underline">Politica de confidențialitate</Link>.</p>

      <form onSubmit={onSubmit} className="space-y-3" aria-label="Login cu magic link">
        <label htmlFor="email" className="text-sm">Email</label>
        <Input id="email" type="email" required placeholder="email@exemplu.ro" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <Button type="submit" disabled={loading}>Trimite link de login</Button>
      </form>

      <div className="my-6 flex items-center gap-3"><span className="h-px flex-1 bg-border" /><span className="text-xs text-muted-foreground">sau</span><span className="h-px flex-1 bg-border" /></div>

      <Button variant="outline" onClick={signInWithGoogle} aria-label="Autentificare cu Google">Continuă cu Google</Button>

      <p className="mt-6 text-xs text-muted-foreground">După autentificare vei fi redirecționat către: <span className="font-medium">{redirect}</span></p>
    </main>
  );
}
