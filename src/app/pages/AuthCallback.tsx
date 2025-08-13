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
        // Check if we have tokens in the URL hash (magic link flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        let authResult;
        if (accessToken && refreshToken) {
          // Handle hash-based tokens from magic link
          authResult = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else {
          // Handle code-based flow (OAuth)
          authResult = await supabase.auth.exchangeCodeForSession(window.location.href);
        }
        
        if (authResult.error) throw authResult.error;
        
        const redirect = sp.get("redirect") || routes.account();
        toast({ title: "Bun venit!", description: "Autentificare reușită." });
        navigate(redirect, { replace: true });
      } catch (e: any) {
        console.error('Auth callback error:', e);
        toast({ title: "Eroare la autentificare", description: e?.message || "Încearcă din nou." });
        navigate(routes.authLogin(), { replace: true });
      }
    }
    run();
  }, []);

  return <main className="container mx-auto px-4 py-10"><p>Se finalizează autentificarea...</p></main>;
}
