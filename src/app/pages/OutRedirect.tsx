import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function OutRedirect() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [target, setTarget] = useState<string | null>(null);

  const utm = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const out: Record<string, string> = {};
    params.forEach((v, k) => {
      if (k.startsWith("utm_")) out[k] = v;
    });
    return out;
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!id) return;
      try {
        const { data, error } = await supabase.functions.invoke("out_redirect", {
          body: {
            id,
            path: location.pathname + location.search,
            referrer: typeof document !== "undefined" ? document.referrer : undefined,
            utm,
          },
        });
        if (error) throw error;
        const url = (data as any)?.url as string | undefined;
        if (!url) throw new Error("URL invalid");
        if (!cancelled) {
          setTarget(url);
          // Use replace to avoid keeping intermediate page in history
          window.location.replace(url);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "Eroare la redirecționare");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [id, location.pathname, location.search, utm]);

  return (
    <>
      <Helmet>
        <title>Redirecționare ofertă</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="canonical" href="/out" />
      </Helmet>
      <section className="py-16">
        <Container>
          <h1 className="text-2xl font-semibold mb-3">Mergem către ofertă…</h1>
          <p className="text-muted-foreground mb-6">
            Te redirecționăm către partenerul nostru. Acesta poate fi un link afiliat.
          </p>
          {loading && <p>Se încarcă…</p>}
          {error && (
            <div className="space-y-4">
              <p className="text-destructive">A apărut o eroare: {error}</p>
              {target ? (
                <Button asChild>
                  <a href={target} rel="noopener noreferrer">Continuă către ofertă</a>
                </Button>
              ) : (
                <Button onClick={() => window.location.reload()}>Reîncearcă</Button>
              )}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
