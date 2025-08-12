import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useMemo, useState } from "react";
import { getInitialData } from "@/ssg/serialize";
import { loadSportList } from "@/ssg/loader";
import Filters from "@/components/sport/Filters";
import DayGroup from "@/components/sport/DayGroup";
import SportAdRail from "@/components/sport/SportAdRail";
import { track } from "@/lib/analytics";

export default function Sport() {
  const initial = getInitialData<{ days: any[]; filters: { teams: string[]; tv: string[] } }>();
  const [data, setData] = useState(initial);
  const [loaded, setLoaded] = useState(!!initial);

  const [tab, setTab] = useState<'today'|'tomorrow'|'weekend'|'all'>('today');
  const [team, setTeam] = useState<string | null>(null);
  const [tv, setTv] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        if (!initial) {
          const res = await loadSportList({ days: 14 });
          if (!cancelled) setData(res as any);
        }
      } catch {}
      if (!cancelled) setLoaded(true);
    }
    if (!initial) run();
    return () => { cancelled = true; };
  }, [initial]);

  const filteredDays = useMemo(() => {
    if (!data) return [] as any[];
    const now = new Date();
    const tz = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest' });
    const todayKey = tz.format(now);
    const tomorrowKey = tz.format(new Date(now.getTime() + 24*60*60*1000));
    const inWeekend = (iso: string) => {
      const d = new Date(iso);
      const w = new Intl.DateTimeFormat('en', { weekday: 'short', timeZone: 'Europe/Bucharest' }).format(d);
      return w === 'Sat' || w === 'Sun';
    };

    let days = data.days as any[];
    if (tab === 'today') days = days.filter((d: any) => d.date === todayKey);
    else if (tab === 'tomorrow') days = days.filter((d: any) => d.date === tomorrowKey);
    else if (tab === 'weekend') days = days.filter((d: any) => inWeekend(d.date));

    const matchesFilter = (m: any) => {
      const teamOk = team ? (m.home === team || m.away === team) : true;
      const tvOk = tv.length ? (m.tv_channels || []).some((c: string) => tv.includes(c)) : true;
      return teamOk && tvOk;
    };

    return days.map((g: any) => ({ ...g, matches: g.matches.filter(matchesFilter) })).filter((g: any) => g.matches.length > 0);
  }, [data, tab, team, tv]);

  return (
    <>
      <SEO kind="category" title="Meciuri Liga 1 — Program TV" description="Programul meciurilor din SuperLiga: orele, canalele TV și scorurile LIVE." path="/sport" />
      <Container className="py-6">
        <h1 className="text-2xl font-semibold mb-3">Sport</h1>
        <Filters
          tabs={{ value: tab, onChange: setTab }}
          team={{ value: team, onChange: (t) => { setTeam(t); track('team_filter_apply', { team: t }); } , options: data?.filters.teams || [] }}
          tv={{ value: tv, onChange: (v) => { setTv(v); track('tv_filter_change', { tv: v }); }, options: data?.filters.tv || [] }}
          onReset={() => { setTab('today'); setTeam(null); setTv([]); }}
        />

        {!loaded ? (
          <div className="space-y-6">
            {/* Skeletons */}
            <div className="h-8 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
            <div className="h-8 bg-muted rounded" />
            <div className="h-40 bg-muted rounded" />
          </div>
        ) : filteredDays.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Niciun meci în perioada selectată. <button className="underline underline-offset-4" onClick={() => setTab('all')}>Vezi Toate</button>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredDays.map((g: any, idx: number) => (
              <div key={g.date}>
                <DayGroup dateKey={g.date} matches={g.matches} onMatchClick={(id) => track('match_card_click', { id })} />
                {idx === 0 && <SportAdRail position="mid" />}
              </div>
            ))}
            <SportAdRail position="end" />
          </div>
        )}
      </Container>
    </>
  );
}
