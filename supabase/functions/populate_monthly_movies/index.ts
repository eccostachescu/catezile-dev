import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY')!;
const TMDB_API_URL = Deno.env.get('TMDB_API_URL') || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = Deno.env.get('TMDB_IMAGE_BASE') || 'https://image.tmdb.org/t/p';
const REGION_RO = Deno.env.get('REGION_RO') || 'RO';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function tmdb(path: string, params: Record<string, string | number> = {}) {
  const url = new URL(TMDB_API_URL + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  if (TMDB_API_KEY && TMDB_API_KEY.length < 60) url.searchParams.set('api_key', TMDB_API_KEY);
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${TMDB_API_KEY}` } });
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function parseCinemaReleaseRO(release_dates: any): string | null {
  try {
    const ro = release_dates?.results?.find((r: any) => r.iso_3166_1 === REGION_RO);
    // Include all release types: 1=Premiere, 2=Theatrical(limited), 3=Theatrical, 4=Digital, 5=Physical, 6=TV
    const candidates = ro?.release_dates?.filter((x: any) => [1, 2, 3, 4, 5, 6].includes(x.type)) || [];
    const sorted = candidates.sort((a: any, b: any) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
    return sorted[0]?.release_date?.slice(0, 10) || null;
  } catch {
    return null;
  }
}

function buildPosterUrl(p: string | null | undefined, size = 'w500') {
  return p ? `${TMDB_IMAGE_BASE}/${size}${p}` : null;
}

function buildBackdropUrl(p: string | null | undefined, size = 'w780') {
  return p ? `${TMDB_IMAGE_BASE}/${size}${p}` : null;
}

function firstYouTubeTrailer(videos: any): string | null {
  try {
    const t = videos?.results?.find((v: any) => v.site === 'YouTube' && v.type === 'Trailer');
    return t?.key || null;
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { year = 2025 }: { year?: number } = req.method === 'POST' ? await req.json().catch(() => ({})) : Object.fromEntries(new URL(req.url).searchParams) as any;

    let totalUpserted = 0;
    const monthlyResults: any[] = [];

    // Process each month of the year
    for (let month = 1; month <= 12; month++) {
      console.log(`Processing ${year}-${month.toString().padStart(2, '0')}`);
      
      const monthStartDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const monthEndDate = `${year}-${month.toString().padStart(2, '0')}-${new Date(year, month, 0).getDate()}`;

      const ids = new Set<number>();

      // Fetch movies from multiple TMDB endpoints for this specific month
      const endpoints = [
        {
          path: '/discover/movie',
          params: {
            region: REGION_RO,
            'primary_release_date.gte': monthStartDate,
            'primary_release_date.lte': monthEndDate,
            sort_by: 'popularity.desc',
            'vote_count.gte': 1
          }
        },
        {
          path: '/discover/movie',
          params: {
            region: REGION_RO,
            'release_date.gte': monthStartDate,
            'release_date.lte': monthEndDate,
            sort_by: 'release_date.desc',
            'vote_count.gte': 1
          }
        }
      ];

      // Fetch from each endpoint
      for (const endpoint of endpoints) {
        for (let page = 1; page <= 5; page++) {
          try {
            const data = await tmdb(endpoint.path, { ...endpoint.params, page });
            for (const m of data.results || []) {
              ids.add(m.id);
            }
            
            // If we got less than 20 results, no point in fetching more pages
            if ((data.results || []).length < 20) break;
          } catch (e) {
            console.warn(`Failed to fetch ${endpoint.path} page ${page} for ${year}-${month}:`, e);
            break;
          }
        }
      }

      // Also fetch popular and top-rated movies and filter by date
      const listTypes = ['popular', 'top_rated', 'upcoming', 'now_playing'] as const;
      for (const typ of listTypes) {
        for (let page = 1; page <= 3; page++) {
          try {
            const data = await tmdb(`/movie/${typ}`, { region: REGION_RO, page });
            for (const m of data.results || []) {
              // We'll check the actual release date when processing individual movies
              ids.add(m.id);
            }
          } catch (e) {
            console.warn(`Failed to fetch ${typ} page ${page}:`, e);
          }
        }
      }

      console.log(`Found ${ids.size} unique movie IDs for ${year}-${month}`);

      // Process each movie
      let monthUpserted = 0;
      const errors: Array<{ id: number; error: string }> = [];
      
      for (const id of ids) {
        try {
          const full = await tmdb(`/movie/${id}`, { append_to_response: 'release_dates,videos' });
          const cinema_release_ro = parseCinemaReleaseRO(full.release_dates);
          
          // Skip if this movie doesn't have a release date in the current month we're processing
          if (cinema_release_ro) {
            const releaseDate = new Date(cinema_release_ro);
            const releaseMonth = releaseDate.getMonth() + 1;
            const releaseYear = releaseDate.getFullYear();
            
            // Only include movies that actually release in this month/year
            if (releaseYear !== year || releaseMonth !== month) {
              continue;
            }
          }

          const trailer_youtube_key = firstYouTubeTrailer(full.videos);
          const poster_url = buildPosterUrl(full.poster_path);
          const backdrop_url = buildBackdropUrl(full.backdrop_path);
          const genres = (full.genres || []).map((g: any) => g.name);
          const title: string = full.title;
          const original_title: string | null = full.original_title && full.original_title !== title ? full.original_title : null;
          const overview: string | null = full.overview || null;
          const status = cinema_release_ro ? (new Date(cinema_release_ro) > new Date() ? 'SCHEDULED' : 'RELEASED') : 'SCHEDULED';

          const payload: any = {
            tmdb_id: id,
            title,
            original_title,
            overview,
            poster_url,
            backdrop_url,
            trailer_youtube_key,
            genres,
            status,
            popularity: full.popularity || 0,
            vote_average: full.vote_average || 0,
            vote_count: full.vote_count || 0,
            runtime: full.runtime || null,
          };
          
          if (cinema_release_ro) payload.cinema_release_ro = cinema_release_ro;

          const { error } = await supabase
            .from('movie')
            .upsert(payload, { onConflict: 'tmdb_id' })
            .select('id')
            .maybeSingle();
            
          if (error) throw error;
          monthUpserted++;
          totalUpserted++;
          
          // Small delay to avoid rate limiting
          if (monthUpserted % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (e: any) {
          errors.push({ id, error: String(e?.message || e) });
        }
      }

      monthlyResults.push({
        month,
        year,
        processed: ids.size,
        upserted: monthUpserted,
        errors: errors.length
      });

      console.log(`Month ${month}: processed ${ids.size}, upserted ${monthUpserted}, errors ${errors.length}`);
    }

    await supabase.from('ingestion_log').insert({ 
      source: 'populate-monthly-movies', 
      status: 'OK', 
      rows: totalUpserted, 
      message: JSON.stringify({ year, monthlyResults }) 
    });

    return new Response(JSON.stringify({ 
      ok: true, 
      year,
      totalUpserted, 
      monthlyResults 
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
    
  } catch (e: any) {
    console.error('populate_monthly_movies error', e);
    await supabase.from('ingestion_log').insert({ 
      source: 'populate-monthly-movies', 
      status: 'ERROR', 
      message: String(e?.message || e) 
    });
    return new Response(JSON.stringify({ 
      ok: false, 
      error: String(e?.message || e) 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});