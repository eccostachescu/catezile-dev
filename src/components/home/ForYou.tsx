import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { routes } from "@/app/routes";

export default function ForYou() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setLoggedIn(!!data.session?.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(!!session?.user);
    });
    return () => { sub.subscription.unsubscribe(); mounted = false; };
  }, []);

  return (
    <section className="py-6" aria-labelledby="foryou-title">
      <Container>
        <h2 id="foryou-title" className="text-xl font-semibold mb-3">Pentru tine</h2>
        {!loggedIn ? (
          <div className="rounded-md border p-4">
            <div className="font-medium mb-1">Primește remindere pe e‑mail</div>
            <p className="text-sm text-muted-foreground mb-3">Autentifică‑te pentru a urmări echipe și evenimente și a primi remindere.</p>
            <a href={routes.authLogin(routes.home())} className="inline-flex h-10 items-center rounded-md border px-4">Autentifică‑te</a>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Personalizare ușoară va apărea aici (follow‑uri, remindere, continue). </div>
        )}
      </Container>
    </section>
  );
}
