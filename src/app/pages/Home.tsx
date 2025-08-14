import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { getInitialData } from "@/ssg/serialize";
import { loadHome } from "@/ssg/loader";
import { useEffect, useMemo, useState } from "react";
import HomeHero from "@/components/home/HomeHero";
import TrendingRail from "@/components/home/TrendingRail";
import PopularSection from "@/components/home/PopularSection";
import TVNow from "@/components/home/TVNow";
import UpcomingStrip from "@/components/home/UpcomingStrip";
import ForYou from "@/components/home/ForYou";
import ExploreLinks from "@/components/home/ExploreLinks";
import HomeAdRail from "@/components/home/HomeAdRail";
import BFTopOffers from "@/components/home/BFTopOffers";
import { useAuthTokenHandler } from "@/hooks/useAuthTokenHandler";

export default function Home() {
  // Handle auth tokens if present in URL hash
  useAuthTokenHandler();
  
  const data = getInitialData<any>();
  const initialHome = data && (data as any).home;
  const [homeData, setHomeData] = useState<any | null>(initialHome || null);

  useEffect(() => {
    let cancelled = false;
    if (!homeData) {
      loadHome().then((d) => { if (!cancelled) setHomeData(d); }).catch(() => {});
    }
    return () => { cancelled = true; };
  }, []);

  const jsonLd = useMemo(() => {
    if (!homeData?.trending?.length) return null;
    const base = (typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro');
    const items = homeData.trending.slice(0, 6).map((it: any, i: number) => ({
      "@type": "ListItem",
      position: i + 1,
      url: hrefFor(base, it),
      name: it.title,
    }));
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: items,
    };
  }, [homeData]);

  return (
    <>
      <SEO
        kind="home"
        title="Câte zile până la… | Meciuri, Filme, Sărbători în România"
        description="Calendar actualizat zilnic: program TV Liga 1, premiere la cinema și pe Netflix/Prime, sărbători și examene. Remindere pe e‑mail, fără spam."
        path="/"
      />

      {homeData?.hero && <HomeHero hero={homeData.hero} />}
      {(() => {
        const defaultOrder = ['bf','trending','popular','tvnow','upcoming','foryou','explore','ads'] as const;
        const order = (homeData?.sections_order && Array.isArray(homeData.sections_order) ? homeData.sections_order : defaultOrder) as string[];
        return order.map((k, idx) => {
          if (k === 'bf') return <BFTopOffers key={`sec-${idx}-bf`} items={homeData?.bf_top_offers || []} />;
          if (k === 'trending') return <TrendingRail key={`sec-${idx}-tr`} items={homeData?.trending || []} />;
          if (k === 'popular') return <PopularSection key={`sec-${idx}-pop`} />;
          if (k === 'tvnow') return <TVNow key={`sec-${idx}-tv`} items={homeData?.tv_now || []} />;
          if (k === 'upcoming') return (
            <>
              {/* ancoră pentru linkul "Vezi toate" din Trending */}
              {idx === order.indexOf('upcoming') && <div id="in-curand" />}
              <UpcomingStrip key={`sec-${idx}-us`} title="Sport săptămâna asta" items={homeData?.upcoming?.sport || []} kind="sport" />
              <HomeAdRail />
              <UpcomingStrip key={`sec-${idx}-um`} title="Filme luna aceasta" items={homeData?.upcoming?.movies || []} kind="movies" />
              <UpcomingStrip key={`sec-${idx}-ue`} title="Evenimente în curând" items={homeData?.upcoming?.events || []} kind="events" />
            </>
          );
          if (k === 'foryou') return <ForYou key={`sec-${idx}-fy`} />;
          if (k === 'explore') return <ExploreLinks key={`sec-${idx}-ex`} discovery={homeData?.discovery || { tags: [], teams: [], tv: [] }} />;
          if (k === 'ads') return <HomeAdRail key={`sec-${idx}-ad`} />;
          return null;
        });
      })()}


      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
    </>
  );
}

function hrefFor(base: string, it: any) {
  if (it.kind === 'match') return `${base}/sport/${it.slug || it.id}`;
  if (it.kind === 'movie') return `${base}/filme/${it.slug || it.id}`;
  if (it.kind === 'event') return `${base}/evenimente/${it.slug}`;
  return base;
}
