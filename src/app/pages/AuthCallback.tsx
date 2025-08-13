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
        console.log('AuthCallback: Processing authentication...');
        console.log('Current URL:', window.location.href);
        
        // Check if we have tokens in the URL hash (magic link flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        // Check if we have a code in the query params (OAuth flow)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        let authResult;
        if (accessToken && refreshToken) {
          console.log('AuthCallback: Processing hash-based tokens (magic link)');
          // Handle hash-based tokens from magic link
          authResult = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } else if (code) {
          console.log('AuthCallback: Processing code-based flow (OAuth)');
          // Handle code-based flow (OAuth)
          authResult = await supabase.auth.exchangeCodeForSession(window.location.href);
        } else {
          throw new Error('No authentication tokens or code found in URL');
        }
        
        if (authResult.error) {
          console.error('Auth error:', authResult.error);
          throw authResult.error;
        }
        
        console.log('AuthCallback: Authentication successful');
        
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
  }, [navigate, sp]);

  return <main className="container mx-auto px-4 py-10"><p>Se finalizează autentificarea...</p></main>;
}
