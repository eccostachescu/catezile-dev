import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/lib/routes";

export function useAuthTokenHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function handleAuthTokens() {
      try {
        // Check if we have tokens in the URL hash (magic link flow)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        if (accessToken && refreshToken && (type === 'magiclink' || type === 'signup')) {
          console.log('Found auth tokens in URL, processing...');
          
          // Set the session with the tokens
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) {
            console.error('Error setting session:', error);
            throw error;
          }
          
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          
          // Get redirect parameter or default to account
          const redirect = searchParams.get("redirect") || routes.account();
          
          toast({ title: "Bun venit!", description: "Autentificare reușită." });
          navigate(redirect, { replace: true });
        }
      } catch (e: any) {
        console.error('Auth token handling error:', e);
        // Clear the hash from URL even on error
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        
        toast({ 
          title: "Eroare la autentificare", 
          description: e?.message || "Încearcă din nou." 
        });
        navigate(routes.authLogin(), { replace: true });
      }
    }
    
    // Only run if we have auth tokens in the hash
    if (window.location.hash.includes('access_token')) {
      handleAuthTokens();
    }
  }, [navigate, searchParams]);
}