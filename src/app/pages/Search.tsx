import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { supabase } from "@/integrations/supabase/client";

export default function SearchPage() {
  const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const initialQ = sp.get('q') || '';
  const [q, setQ] = useState(initialQ);
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [kind, setKind] = useState<'all'|'event'|'match'|'movie'|'countdown'>('all');
  const [sort, setSort] = useState<'relevance'|'soon'|'popular'>('relevance');
  const [dateFrom, setDateFrom] = useState<string | undefined>(sp.get('dateFrom') || undefined);
  const [dateTo, setDateTo] = useState<string | undefined>(sp.get('dateTo') || undefined);
  const [tv, setTv] = useState<string>(sp.get('tv') || '');
  const [genre, setGenre] = useState<string>(sp.get('genre') || '');
  const [category, setCategory] = useState<string>(sp.get('category') || '');

  useEffect(()=>{ setQ(initialQ); }, [initialQ]);

  useEffect(()=>{
    let cancel = false;
    async function run(){
      setLoading(true);
      const { data } = await supabase.functions.invoke('search', { body: { q, kind, sort, page: 1, pageSize: 20, dateFrom, dateTo, tv: tv || undefined, genre: genre || undefined, category: category || undefined } });
      if (!cancel) {
        setItems((data as any)?.items || []);
        setTotal((data as any)?.total || 0);
        setLoading(false);
      }
    }
    run();
    return ()=>{ cancel = true };
  }, [q, kind, sort, dateFrom, dateTo, tv, genre, category]);

  return (
    <main>
      <SEO kind="search" title={`Căutare: ${q}`} description={`Rezultate pentru ${q}`} noindex path="/cauta" />
      <Container className="py-8">
        <h1 className="text-2xl font-bold mb-4">Căutare</h1>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Caută…" className="h-10 px-3 rounded-md border" />
          <select value={kind} onChange={(e)=>setKind(e.target.value as any)} className="h-10 px-3 rounded-md border">
            <option value="all">Toate</option>
            <option value="event">Evenimente</option>
            <option value="match">Meciuri</option>
            <option value="movie">Filme</option>
            <option value="countdown">Countdown</option>
          </select>
          <select value={sort} onChange={(e)=>setSort(e.target.value as any)} className="h-10 px-3 rounded-md border">
            <option value="relevance">Relevanță</option>
            <option value="soon">În curând</option>
            <option value="popular">Cele mai populare</option>
          </select>
          <input type="date" value={dateFrom||''} onChange={(e)=>setDateFrom(e.target.value||undefined)} className="h-10 px-3 rounded-md border" />
          <input type="date" value={dateTo||''} onChange={(e)=>setDateTo(e.target.value||undefined)} className="h-10 px-3 rounded-md border" />
          <input value={tv} onChange={(e)=>setTv(e.target.value)} placeholder="TV" className="h-10 px-3 rounded-md border w-24" />
          <input value={genre} onChange={(e)=>setGenre(e.target.value)} placeholder="Gen" className="h-10 px-3 rounded-md border w-24" />
          <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="Categorie (slug)" className="h-10 px-3 rounded-md border" />
          <div className="text-sm text-muted-foreground">{loading ? 'Se caută…' : `${total} rezultate`}</div>
        </div>
        <div className="grid gap-3">
          {items.map((it:any, idx:number)=> (
            <a key={idx} href={linkFor(it)} className="p-3 rounded-md border hover:bg-muted">
              <div className="font-medium">{it.title}</div>
              {it.subtitle && <div className="text-xs text-muted-foreground">{it.subtitle}</div>}
            </a>
          ))}
          {!loading && items.length===0 && (
            <div className="text-muted-foreground">Nu am găsit nimic pentru „{q}”.</div>
          )}
        </div>
      </Container>
    </main>
  );
}

function linkFor(it: any) {
  if (it.kind==='event' && it.slug) return `/evenimente/${it.slug}`;
  if (it.kind==='match' && it.entity_id) return `/sport/${it.entity_id}`;
  if (it.kind==='movie' && it.entity_id) return `/filme/${it.entity_id}`;
  if (it.kind==='countdown' && it.slug) return `/c/${it.slug}`;
  if (it.kind==='tag' && it.slug) return `/tag/${it.slug}`;
  if (it.kind==='tv' && it.slug) return `/tv/${it.slug}`;
  return '#';
}
