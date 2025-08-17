import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { getInitialData } from "@/ssg/serialize";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import MovieCard from "@/components/cards/MovieCard";
import { MovieCardEnhanced } from "@/components/movies/MovieCardEnhanced";
import MovieStrip from "@/components/movies/MovieStrip";
import { GridSkeleton } from "@/components/movies/Skeletons";
import { routes } from "@/lib/routes";
import { track } from "@/lib/analytics";
import { toast } from "@/hooks/use-toast";

const months = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"];

export default function Movies() {
  const initial = getInitialData<{ kind: string; movies?: any }>();
  const sections = initial?.movies?.sections;

  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<any[]>(initial?.movies?.items || []);

  const month = Number(params.get('month') || '') || undefined;
  const year = Number(params.get('year') || '') || undefined;
  const genre = params.get('genre') || undefined;
  const status = (params.get('status') as any) || undefined;

  const genres = useMemo(() => {
    const pool: string[] = [];
    (sections?.upcomingCinema || []).forEach((m: any) => (m.genres || []).forEach((g: string) => pool.push(g)));
    (sections?.nowInCinema || []).forEach((m: any) => (m.genres || []).forEach((g: string) => pool.push(g)));
    return Array.from(new Set(pool)).sort();
  }, [sections]);

  useEffect(() => {
    const cancelled = false;
    async function load() {
      setLoading(true);
      try {
        let q = supabase.from('movie').select(`
          id, 
          title, 
          poster_url, 
          backdrop_url,
          cinema_release_ro, 
          netflix_date, 
          prime_date, 
          status, 
          genres, 
          provider, 
          streaming_ro,
          popularity,
          vote_average,
          overview,
          trailer_youtube_key
        `).order('popularity', { ascending: false }).limit(100);
        
        if (status) q = q.eq('status', status);
        if (genre) q = q.contains('genres', [genre]);
        if (year) q = q.gte('cinema_release_ro', `${year}-01-01`).lte('cinema_release_ro', `${year}-12-31`);
        if (month && year) {
          const mm = String(month).padStart(2, '0');
          const next = month === 12 ? `${year+1}-01-01` : `${year}-${String(month+1).padStart(2,'0')}-01`;
          q = q.gte('cinema_release_ro', `${year}-${mm}-01`).lt('cinema_release_ro', next);
        }
        
        // If no specific filters, show a mix of popular and upcoming movies
        if (!status && !genre && !year && !month) {
          q = q.or('status.eq.SCHEDULED,status.eq.RELEASED').order('popularity', { ascending: false });
        }
        
        const { data } = await q;
        if (!cancelled) setItems(data || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, genre, status]);

  useEffect(() => {
    const runImport = params.get('import');
    const populateMonthly = params.get('populate');
    
    if (runImport === '1') {
      (async () => {
        try {
          toast({ title: 'Import TMDB pornit', description: 'Se importă filme…' });
          await supabase.functions.invoke('import_tmdb_movies', { body: { pages: 5 } });
          await supabase.functions.invoke('update_movie_providers', { body: {} as any });
          toast({ title: 'Gata', description: 'Filmele au fost importate/actualizate.' });
        } catch (e) {
          toast({ title: 'Eroare la import', description: String((e as any)?.message || e), variant: 'destructive' as any });
        } finally {
          const next = new URLSearchParams(params);
          next.delete('import');
          setParams(next, { replace: true });
        }
      })();
    }
    
    if (populateMonthly === '1') {
      (async () => {
        try {
          toast({ title: 'Populare lunară pornită', description: 'Se populează filme pentru toate lunile 2025…' });
          await supabase.functions.invoke('populate_monthly_movies', { body: { year: 2025 } });
          toast({ title: 'Gata', description: 'Filmele au fost populate pentru 2025.' });
        } catch (e) {
          toast({ title: 'Eroare la populare', description: String((e as any)?.message || e), variant: 'destructive' as any });
        } finally {
          const next = new URLSearchParams(params);
          next.delete('populate');
          setParams(next, { replace: true });
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  function updateParam(key: string, value?: string) {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key); else next.set(key, value);
    setParams(next, { replace: true });
    track('movies_filter_change', { [key]: value });
  }

  return (
    <>
      <SEO kind="category" title="Filme în România — Cinema & Streaming" description="Când apar filmele la cinema în România și pe Netflix/Prime. Calendar actualizat zilnic." path="/filme" />
      <Container className="py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Filme în România — Cinema & Streaming</h1>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <select className="h-9 rounded-md border bg-background px-2" value={month || ''} onChange={(e)=>updateParam('month', e.target.value || undefined)}>
            <option value="">Lună</option>
            {months.map((m, i) => (
              <option key={i} value={i+1}>{m}</option>
            ))}
          </select>
          <select className="h-9 rounded-md border bg-background px-2" value={year || ''} onChange={(e)=>updateParam('year', e.target.value || undefined)}>
            <option value="">An</option>
            {Array.from({ length: 3 }).map((_, i) => {
              const y = new Date().getFullYear() - 1 + i;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
          <select className="h-9 rounded-md border bg-background px-2" value={genre || ''} onChange={(e)=>updateParam('genre', e.target.value || undefined)}>
            <option value="">Gen</option>
            {genres.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
          <select className="h-9 rounded-md border bg-background px-2" value={status || ''} onChange={(e)=>updateParam('status', e.target.value || undefined)}>
            <option value="">Status</option>
            <option value="SCHEDULED">În curând</option>
            <option value="RELEASED">Lansat</option>
          </select>
        </div>

        {/* Admin Actions */}
        {window.location.hostname.includes('localhost') || window.location.hostname.includes('lovable.app') ? (
          <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
            <button 
              onClick={() => updateParam('populate', '1')}
              className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
            >
              Populează filme 2025
            </button>
            <button 
              onClick={() => updateParam('import', '1')}
              className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm"
            >
              Import TMDB
            </button>
          </div>
        ) : null}

        {/* Sections */}
        <MovieStrip title="La cinema în curând" items={sections?.upcomingCinema || []} />
        <MovieStrip title="Acum în cinematografe" items={sections?.nowInCinema || []} />
        <MovieStrip title="Pe Netflix/Prime în curând" items={sections?.streamingSoon || []} />
        <MovieStrip title="Disponibile pe Netflix/Prime" items={sections?.streamingAvailable || []} />

        {/* Grid */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Rezultate</h2>
          {loading ? (
            <GridSkeleton />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {items.map((m) => (
                <MovieCardEnhanced 
                  key={m.id}
                  movie={{
                    id: m.id,
                    title: m.title,
                    poster_url: m.poster_url,
                    cinema_release_ro: m.cinema_release_ro,
                    streaming_ro: m.streaming_ro,
                    genres: m.genres,
                    status: m.status
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </Container>
    </>
  );
}
