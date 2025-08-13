import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { supabase } from "@/integrations/supabase/client";
import { TableLive } from "@/components/liga1/TableLive";
import MatchCard from "@/components/sport/MatchCard";
import SportAnswerBox from "@/components/sport/AnswerBox";
import { track } from "@/lib/analytics";
import { Link } from "react-router-dom";
import { routes } from "@/app/routes";

export default function Liga1Overview() {
  const [loading, setLoading] = useState(true);
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [seasonId, setSeasonId] = useState<string | null>(null);
  const [table, setTable] = useState<any[]>([]);
  const [today, setToday] = useState<any[]>([]);
  const [nextRound, setNextRound] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // League id
        const { data: league } = await supabase
          .from("league")
          .select("id")
          .eq("slug", "liga-1")
          .maybeSingle();
        if (!league?.id) { setLoading(false); return; }
        setLeagueId(league.id);

        // Current season
        const { data: season } = await supabase
          .from("season")
          .select("id, phase")
          .eq("league_id", league.id)
          .eq("is_current", true)
          .maybeSingle();
        if (!season?.id) { setLoading(false); return; }
        setSeasonId(season.id);

        // Live table preferred
        const { data: live } = await supabase
          .from("standings_live")
          .select("team_name, points, played, wins, draws, losses, gf, ga")
          .eq("season_id", season.id);
        if (live && live.length) {
          setTable(live);
        } else {
          const { data: staticRows } = await supabase
            .from("standings_regular")
            .select("team_name, points, played, wins, draws, losses, gf, ga")
            .eq("season_id", season.id);
          setTable(staticRows || []);
        }

        // Today in SuperLiga (Europe/Bucharest day window)
        const now = new Date();
        const start = new Date(now);
        start.setHours(0,0,0,0);
        const end = new Date(now);
        end.setHours(23,59,59,999);
        const { data: todayMatches } = await supabase
          .from("match")
          .select("id, slug, home, away, kickoff_at, tv_channels, is_derby, status, score")
          .eq("league_id", league.id)
          .gte("kickoff_at", start.toISOString())
          .lte("kickoff_at", end.toISOString())
          .order("kickoff_at", { ascending: true });
        setToday(todayMatches || []);

        // Next round: pick first upcoming match with round_number
        const { data: upcoming } = await supabase
          .from("match")
          .select("id, slug, home, away, kickoff_at, tv_channels, is_derby, status, score, round_number")
          .eq("league_id", league.id)
          .gt("kickoff_at", new Date().toISOString())
          .order("kickoff_at", { ascending: true })
          .limit(1);
        const rn = upcoming?.[0]?.round_number;
        if (rn != null) {
          const { data: roundMatches } = await supabase
            .from("match")
            .select("id, slug, home, away, kickoff_at, tv_channels, is_derby, status, score, round_number")
            .eq("league_id", league.id)
            .eq("round_number", rn)
            .order("kickoff_at", { ascending: true });
          setNextRound(roundMatches || []);
        } else {
          setNextRound([]);
        }

        track('liga1_view', { season_id: season.id });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sortedTable = useMemo(() => {
    const rows = [...(table || [])];
    rows.sort((a,b) => (b.points - a.points) || ((b.gf - b.ga) - (a.gf - a.ga)) || (b.gf - a.gf));
    return rows;
  }, [table]);

  const nextRoundNumber = useMemo(() => nextRound?.[0]?.round_number ?? null, [nextRound]);

  return (
    <>
      <SEO
        title="Liga 1 — Program, Clasament LIVE și Rezultate"
        description="SuperLiga: program pe etape, meciuri TV, clasament live și rezultate actualizate."
        path="/liga-1"
      />
      <Container className="py-6">
        <header className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Liga 1 — SuperLiga</h1>
            <p className="text-muted-foreground">Program, Clasament LIVE și Rezultate</p>
          </div>
          <Link to={routes.liga1Teams()} className="text-sm text-muted-foreground hover:underline">Echipe</Link>
        </header>

        {/* Answer box (a11y) */}
        {sortedTable.length > 0 && (
          <div className="mb-4">
            <SportAnswerBox data={{}} />
          </div>
        )}

        {/* Clasament LIVE */}
        <section className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Clasament LIVE</h2>
          <TableLive rows={sortedTable} loading={loading} />
          <p className="text-xs text-muted-foreground mt-2">Notă: Dacă nu există meciuri live, se afișează clasamentul ultimelor rezultate finale.</p>
        </section>

        {/* Următoarea etapă */}
        {!!nextRound.length && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Următoarea etapă</h2>
              {nextRoundNumber != null && (
                <Link to={routes.liga1Round(nextRoundNumber)} className="text-sm text-muted-foreground hover:underline">
                  Vezi etapa {nextRoundNumber}
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nextRound.map((m:any) => (
                <MatchCard key={m.id} m={m} />
              ))}
            </div>
          </section>
        )}

        {/* Azi în SuperLiga */}
        {!!today.length && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Azi în SuperLiga</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {today.map((m:any) => (
                <MatchCard key={m.id} m={m} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
