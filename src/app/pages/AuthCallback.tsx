import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/lib/routes";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  useEffect(() => {
    async function run() {
      try {
        // Handles both OAuth and Magic Link (PKCE) flows
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) throw error;
        const redirect = sp.get("redirect") || routes.account();
        toast({ title: "Bun venit!", description: "Autentificare reușită." });
        navigate(redirect, { replace: true });
      } catch (e: any) {
        toast({ title: "Eroare la autentificare", description: e?.message || "Încearcă din nou." });
        navigate(routes.authLogin(), { replace: true });
      }
    }
    run();
  }, []);

  return <main className="container mx-auto px-4 py-10"><p>Se finalizează autentificarea...</p></main>;
}
