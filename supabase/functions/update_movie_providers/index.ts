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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Pick relevant movies: released last 365 days or releasing next 180 days
    const today = new Date();
    const past = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const future = new Date(today.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const { data: movies, error } = await supabase
      .from('movie')
      .select('id, tmdb_id, provider, netflix_date, prime_date, cinema_release_ro')
      .or(
        `and(cinema_release_ro.gte.${past},cinema_release_ro.lte.${future}),and(cinema_release_ro.is.null,created_at.gte.${past})`
      )
      .limit(500);
    if (error) throw error;

    let updated = 0; const errors: Array<{ id: number; error: string }> = [];

    for (const m of movies || []) {
      try {
        const prov = await tmdb(`/movie/${m.tmdb_id}/watch/providers`);
        const ro = prov?.results?.[REGION_RO] || {};
        const flatrate = ro.flatrate || [];
        const names: string[] = flatrate.map((x: any) => x.provider_name);
        const hasNetflix = names.some(n => n.toLowerCase().includes('netflix'));
        const hasPrime = names.some(n => n.toLowerCase().includes('prime'));
        const provider: any = { ...(m.provider || {}) };
        if (hasNetflix) provider.netflix = { ...(provider.netflix || {}), available: true };
        if (hasPrime) provider.prime = { ...(provider.prime || {}), available: true };
        if (!hasNetflix && provider.netflix) provider.netflix.available = false;
        if (!hasPrime && provider.prime) provider.prime.available = false;

        const { error: uerr } = await supabase.from('movie')
          .update({ provider })
          .eq('id', m.id);
        if (uerr) throw uerr;
        updated++;
      } catch (e: any) {
        errors.push({ id: m.tmdb_id, error: String(e?.message || e) });
      }
    }

    await supabase.from('ingestion_log').insert({ source: 'tmdb-providers', status: errors.length ? 'PARTIAL' : 'OK', rows: updated, message: errors.length ? JSON.stringify({ errors: errors.slice(0, 10) }) : null });

    return new Response(JSON.stringify({ ok: true, updated, scanned: movies?.length || 0, errors }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    console.error('update_movie_providers error', e);
    await supabase.from('ingestion_log').insert({ source: 'tmdb-providers', status: 'ERROR', message: String(e?.message || e) });
    return new Response(JSON.stringify({ ok: false, error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
