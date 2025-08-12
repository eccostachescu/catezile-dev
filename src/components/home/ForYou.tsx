import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { routes } from "@/app/routes";
import { track } from "@/lib/analytics";

export default function ForYou() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [continueItem, setContinueItem] = useState<{ url: string; title?: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const ok = !!data.session?.user;
      setLoggedIn(ok);
      if (ok) {
        supabase.from('reminder').select('id,entity_type,entity_id,next_fire_at,channel,status').gte('next_fire_at', new Date().toISOString()).order('next_fire_at', { ascending: true }).limit(3).then(({ data })=>{
          if (mounted) setReminders(data || []);
        });
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const ok = !!session?.user;
      setLoggedIn(ok);
    });
    try {
      const rv = JSON.parse(localStorage.getItem('recentViews') || 'null');
      if (rv && Array.isArray(rv) && rv.length > 0) setContinueItem(rv[0]);
    } catch {}
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
            <a href={routes.authLogin(routes.home())} className="inline-flex h-10 items-center rounded-md border px-4" onClick={()=>track('foryou_login_cta')}>Autentifică‑te</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="rounded-md border p-3">
              <div className="font-medium mb-2">Remindere programate</div>
              {reminders.length===0 && <div className="text-sm text-muted-foreground">Nu ai remindere viitoare.</div>}
              <ul className="space-y-2">
                {reminders.map((r)=> (
                  <li key={r.id} className="text-sm flex items-center justify-between">
                    <span>{label(r.entity_type)} • {new Date(r.next_fire_at).toLocaleString('ro-RO')}</span>
                    <a className="underline underline-offset-4" href={`/account#reminders`}>Editează</a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border p-3">
              <div className="font-medium mb-2">Continuă de unde ai rămas</div>
              {continueItem ? (
                <a href={continueItem.url} className="text-sm underline underline-offset-4">{continueItem.title || continueItem.url}</a>
              ) : (
                <div className="text-sm text-muted-foreground">Nimic recent încă.</div>
              )}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

function label(kind: string) {
  if (kind==='match') return 'Meci';
  if (kind==='movie') return 'Film';
  if (kind==='event') return 'Eveniment';
  return 'Item';
}
