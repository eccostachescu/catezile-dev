import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { getInitialData } from "@/ssg/serialize";
import { loadHome } from "@/ssg/loader";
import { useEffect, useMemo, useState } from "react";
import HomeHero from "@/components/home/HomeHero";
import TrendingRail from "@/components/home/TrendingRail";
import TodayGrid from "@/components/home/TodayGrid";
import TVNow from "@/components/home/TVNow";
import UpcomingStrip from "@/components/home/UpcomingStrip";
import ForYou from "@/components/home/ForYou";
import ExploreLinks from "@/components/home/ExploreLinks";
import HomeAdRail from "@/components/home/HomeAdRail";

export default function Home() {
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
      <TrendingRail items={homeData?.trending || []} />
      <TodayGrid items={homeData?.today || []} />
      <TVNow items={homeData?.tv_now || []} />

      <UpcomingStrip title="Sport săptămâna asta" items={homeData?.upcoming?.sport || []} kind="sport" />
      <HomeAdRail />
      <UpcomingStrip title="Filme luna aceasta" items={homeData?.upcoming?.movies || []} kind="movies" />
      <UpcomingStrip title="Evenimente în curând" items={homeData?.upcoming?.events || []} kind="events" />

      <ForYou />
      <ExploreLinks discovery={homeData?.discovery || { tags: [], teams: [], tv: [] }} />

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
