import React from "react";
import { SEO } from "@/seo/SEO";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useState, useMemo } from "react";
import Container from "@/components/Container";
import BFHero from "@/components/bf/BFHero";
import { loadBFHub } from "@/ssg/bf";
import OfferCard from "@/components/bf/OfferCard";
import MerchantGrid from "@/components/bf/MerchantGrid";
import CategoryPills from "@/components/bf/CategoryPills";
import BFAdRail from "@/components/bf/BFAdRail";
import { track } from "@/lib/analytics";

export default function BlackFriday() {
  const initial = getInitialData<any>();
  const [data, setData] = useState<any | null>(initial || null);

  useEffect(() => {
    let cancelled = false;
    if (!data) {
      loadBFHub().then((d)=>{ if(!cancelled) setData(d); }).catch(()=>{});
    }
    return () => { cancelled = true; };
  }, []);

  useEffect(()=>{ track('bf_hub_view'); }, []);

  const jsonLd = useMemo(()=>{
    if (!data?.offers?.length) return null;
    const base = (typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro');
    const items = data.offers.slice(0,10).map((o:any, i:number)=>({
      "@type": "ListItem",
      position: i+1,
      url: base + (o.href || '#'),
      name: o.title,
    }));
    return { "@context":"https://schema.org", "@type":"ItemList", itemListElement: items };
  }, [data]);

  return (
    <>
      <SEO kind="bf" merchant="generic" title={`Black Friday România ${new Date().getFullYear()} — Oferte și Magazine`} description={`Vezi cele mai bune oferte de Black Friday ${new Date().getFullYear()}: eMAG, Altex, PC Garage, Fashion și multe altele. Countdown, ghiduri, alerte.`} path="/black-friday" />
      <Container>
        <BFHero bfDate={data?.bfDate || null} live={false} />
        <CategoryPills items={data?.categories || []} />
        <MerchantGrid items={data?.merchants || []} />
        <section className="py-6">
          <h2 className="text-xl font-semibold mb-3">Top Oferte</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {(data?.offers || []).map((o:any)=> <OfferCard key={o.id} offer={o} />)}
          </div>
        </section>
        <BFAdRail />
      </Container>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </>
  );
}
