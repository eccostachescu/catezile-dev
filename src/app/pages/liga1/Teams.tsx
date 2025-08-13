import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/app/routes";

export default function Liga1TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("team")
        .select("slug,name,short_name,city,website,colors")
        .eq("active", true)
        .order("name", { ascending: true });
      setTeams(data || []);
    })();
  }, []);

  return (
    <main>
      <SEO
        title="Echipe SuperLiga — listă și program"
        description="Toate echipele din SuperLiga: informații rapide și programul meciurilor."
        path={routes.liga1Teams()}
      />
      <Container className="py-6">
        <h1 className="text-2xl font-bold mb-4">Echipe SuperLiga</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map((t) => (
            <Link key={t.slug} to={routes.liga1Team(t.slug)} className="rounded-md border p-3 hover:bg-muted/40 transition">
              <div className="font-semibold">{t.name}</div>
              {t.city && <div className="text-sm text-muted-foreground">{t.city}</div>}
            </Link>
          ))}
          {!teams.length && <div className="text-muted-foreground">Momentan nu avem echipe.</div>}
        </div>
      </Container>
    </main>
  );
}
