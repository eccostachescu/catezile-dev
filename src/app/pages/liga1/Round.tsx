import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import MatchCard from "@/components/sport/MatchCard";
import { supabase } from "@/integrations/supabase/client";
import { routes } from "@/app/routes";

export default function Liga1RoundPage() {
  const { nr } = useParams();
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: league } = await supabase
        .from("league")
        .select("id")
        .eq("slug", "liga-1")
        .maybeSingle();
      if (!league?.id || !nr) { setMatches([]); return; }
      const { data } = await supabase
        .from("match")
        .select("id, home, away, kickoff_at, tv_channels, is_derby, status, score, round_number")
        .eq("league_id", league.id)
        .eq("round_number", Number(nr))
        .order("kickoff_at", { ascending: true });
      setMatches(data || []);
    })();
  }, [nr]);

  return (
    <main>
      <SEO title={`Etapa ${nr} — SuperLiga`} description={`Programul meciurilor din Etapa ${nr} din SuperLiga.`} path={routes.liga1Round(nr || '')} />
      <Container className="py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Etapa {nr}</h1>
          <Link to={routes.liga1()} className="text-sm text-muted-foreground hover:underline">Înapoi la hub</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {matches.map((m:any) => (
            <MatchCard key={m.id} m={m} />
          ))}
        </div>
        {!matches.length && <div className="text-muted-foreground">Nu am găsit meciuri pentru această etapă.</div>}
      </Container>
    </main>
  );
}
