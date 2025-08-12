import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Helmet } from "react-helmet-async";
import { sportsEventJsonLd } from "@/seo/jsonld";
import Breadcrumbs from "@/components/Breadcrumbs";
import { routes } from "@/lib/routes";
import { useLocation, useParams } from "react-router-dom";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useMemo, useState } from "react";
import { loadMatch } from "@/ssg/loader";
import MatchHero from "@/components/sport/MatchHero";
import TVChips from "@/components/sport/TVChips";
import DisclaimerNote from "@/components/sport/DisclaimerNote";
import Scoreboard from "@/components/sport/Scoreboard";
import LivePill from "@/components/sport/LivePill";
import SportAnswerBox from "@/components/sport/AnswerBox";
import TicketCTA from "@/components/event/TicketCTA";
import ActionsBar from "@/components/event/ActionsBar";
import { supabase } from "@/integrations/supabase/client";
import { buildOgUrl } from "@/seo/og";

export default function Match() {
  const { pathname } = useLocation();
  const { matchId } = useParams();
  const initial = getInitialData<any>();
  const [data, setData] = useState<any>(initial);
  const [loaded, setLoaded] = useState(!!initial);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try { if (!initial && matchId) { const d = await loadMatch(matchId); if (!cancelled) setData(d as any); } } catch {}
      if (!cancelled) setLoaded(true);
    }
    if (!initial) run();
    return () => { cancelled = true; };
  }, [initial, matchId]);

  // Live poll (lite)
  useEffect(() => {
    if (!data?.id) return;
    if (data.status !== 'LIVE') return;
    let cancelled = false;
    const t = setInterval(async () => {
      try {
        const { data: lite } = await supabase.functions.invoke('match_lite', { body: { id: data.id } });
        if (!cancelled && lite) setData((prev: any) => ({ ...prev, status: lite.status ?? prev.status, score: lite.score ?? prev.score }));
      } catch {}
    }, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, [data?.id, data?.status]);

  const noindex = typeof window !== 'undefined' && !initial && !loaded;
  const tv = data?.tv_channels ?? [];
  const title = data ? `${data.home} vs ${data.away}` : 'Meci';
  const when = data ? new Date(data.kickoff_at) : new Date();
  const og = data?.id ? buildOgUrl({ type: 'match', id: data.id, theme: data?.is_derby ? 'T3' : 'T2' }) : undefined;

  return (
    <>
      <SEO kind="match" id={data?.id} slug={data?.slug || data?.id} title={data?.seo_title || title} description={data?.seo_description || undefined} h1={data?.seo_h1 || title} path={pathname} noindex={noindex} imageUrl={og} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(sportsEventJsonLd({ name: title, homeTeam: data?.home, awayTeam: data?.away, startDate: when }))}</script>
      </Helmet>
      <Container className="py-8">
        <Breadcrumbs items={[{ label: "Acasă", href: routes.home() }, { label: "Sport", href: routes.sport() }, { label: title }]} />
        <MatchHero title={title} derby={!!data?.is_derby} />
        <div className="flex items-center gap-3 mb-2">
          <TVChips channels={tv} />
          {data?.status === 'LIVE' && <LivePill minute={data?.score?.elapsed || data?.score?.minute} />}
        </div>
        <SportAnswerBox data={{ homeTeam: data?.home, awayTeam: data?.away, startDate: when, channels: tv }} />
        <p className="text-sm text-muted-foreground mb-4">
          {Intl.DateTimeFormat('ro-RO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Bucharest' }).format(when)}
          {data?.stadium || data?.city ? ` • ${[data?.stadium, data?.city].filter(Boolean).join(', ')}` : ''}
        </p>
        <Scoreboard status={data?.status} score={data?.score} />
        <DisclaimerNote />
        {!!(data?.offers?.length) && (
          <div className="mt-4"><TicketCTA offers={data.offers} /></div>
        )}
        <div className="mt-4"><ActionsBar title={title} start={when} /></div>
      </Container>
    </>
  );
}
