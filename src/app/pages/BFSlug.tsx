import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { loadBFHub, loadBFMerchant, loadBFCategory } from "@/ssg/bf";
import BFHero from "@/components/bf/BFHero";
import OfferCard from "@/components/bf/OfferCard";
import MerchantGrid from "@/components/bf/MerchantGrid";
import CategoryPills from "@/components/bf/CategoryPills";
import { track } from "@/lib/analytics";

export default function BFSlug() {
  const { slug } = useParams();
  const [mode, setMode] = useState<'hub'|'merchant'|'category'|null>(null);
  const [hub, setHub] = useState<any|null>(null);
  const [merchant, setMerchant] = useState<any|null>(null);
  const [category, setCategory] = useState<any|null>(null);

  useEffect(()=>{
    let cancel = false;
    async function run(){
      if (!slug) return;
      if (/^\d{4}$/.test(slug)) {
        const h = await loadBFHub(Number(slug));
        if (!cancel){ setMode('hub'); setHub(h); }
        return;
      }
      const m = await loadBFMerchant(slug);
      if (m && !cancel){ setMode('merchant'); setMerchant(m); return; }
      const c = await loadBFCategory(slug);
      if (c && !cancel){ setMode('category'); setCategory(c); return; }
      if (!cancel){ setMode('hub'); setHub(await loadBFHub()); }
    }
    run();
    return ()=>{ cancel = true; };
  }, [slug]);

  const title = useMemo(()=> mode==='merchant' ? `Black Friday ${merchant?.merchant?.name}` : mode==='category' ? `Black Friday ${category?.category?.name}` : `Black Friday România ${hub?.year || new Date().getFullYear()}`,[mode, merchant, category, hub]);

  return (
    <>
      <SEO kind="bf" merchant={mode==='merchant' ? (merchant?.merchant?.slug||'generic') : 'generic'} title={`${title} — Oferte`} description={`Oferte și promoții ${title}.`} path={`/black-friday/${slug}`} />
      <Container>
        {mode==='hub' && (
          <>
            <BFHero bfDate={hub?.bfDate||null} />
            <CategoryPills items={hub?.categories||[]} />
            <MerchantGrid items={hub?.merchants||[]} />
            <section className="py-6">
              <h2 className="text-xl font-semibold mb-3">Top Oferte</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {(hub?.offers || []).map((o:any)=> <OfferCard key={o.id} offer={o} />)}
              </div>
            </section>
          </>
        )}
        {mode==='merchant' && (
          <>
            <h1 className="text-2xl font-semibold mb-3">Black Friday {merchant?.merchant?.name}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(merchant?.offers || []).map((o:any)=> <OfferCard key={o.id} offer={o} />)}
            </div>
          </>
        )}
        {mode==='category' && (
          <>
            <h1 className="text-2xl font-semibold mb-3">Black Friday {category?.category?.name}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {(category?.offers || []).map((o:any)=> <OfferCard key={o.id} offer={o} />)}
            </div>
          </>
        )}
      </Container>
    </>
  );
}
