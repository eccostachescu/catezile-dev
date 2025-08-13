import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

import { toast } from "@/components/ui/use-toast";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function check() {
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase.rpc('is_admin');
      setIsAdmin(!!data);
    }
    // Defer to avoid doing work synchronously in auth change
    setTimeout(check, 0);
  }, [user]);

  const signInWithEmail = async (email: string) => {
    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { 
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true 
        },
      });
      
      if (error) {
        console.error('Auth error:', error);
        toast({ 
          title: "Eroare la autentificare", 
          description: error.message === "For security purposes, you can only request this once every 60 seconds" 
            ? "Pentru securitate, poți solicita un link doar o dată pe minut"
            : error.message 
        });
      } else {
        toast({ title: "Verifică emailul", description: "Ți-am trimis un link magic pentru autentificare." });
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      toast({ title: "Eroare", description: "A apărut o eroare neașteptată. Încearcă din nou." });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = useMemo(() => ({ user, session, loading, isAdmin, signInWithEmail, signOut }), [user, session, loading, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
