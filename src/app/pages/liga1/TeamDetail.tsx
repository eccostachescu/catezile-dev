import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MatchCard from "@/components/sport/MatchCard";

export default function Liga1TeamDetailPage() {
  const { slug } = useParams();
  const [team, setTeam] = useState<any | null>(null);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (!slug) return;
      const { data: t } = await supabase
        .from("team")
        .select("id,slug,name,city,website")
        .eq("slug", slug)
        .maybeSingle();
      setTeam(t || null);
      if (t?.id) {
        const { data: ms } = await supabase
          .from("match")
          .select("id, home, away, kickoff_at, tv_channels, is_derby, status, score")
          .or(`home_id.eq.${t.id},away_id.eq.${t.id}`)
          .gte("kickoff_at", new Date().toISOString())
          .order("kickoff_at", { ascending: true })
          .limit(50);
        setMatches(ms || []);
      }
    })();
  }, [slug]);

  const title = team ? `Program ${team.name} — SuperLiga` : "Echipa — SuperLiga";
  const desc = team ? `Meciurile ${team.name}: program TV și rezultate actualizate.` : "Detalii echipă SuperLiga.";

  return (
    <main>
      <SEO title={title} description={desc} path={`/liga-1/echipe/${slug || ''}`} />
      <Container className="py-6">
        <h1 className="text-2xl font-bold mb-4">{team?.name || "Echipă"}</h1>
        <div className="grid gap-3">
          {matches.map((m) => (
            <MatchCard key={m.id} m={m} />
          ))}
          {!matches.length && <div className="text-muted-foreground">Nu sunt meciuri viitoare programate.</div>}
        </div>
      </Container>
    </main>
  );
}
