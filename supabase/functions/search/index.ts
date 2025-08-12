import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-cron",
};

function normalize(q: string) {
  const map: Record<string, string> = { "ș":"s","ş":"s","Ș":"s","Ş":"s","ț":"t","ţ":"t","Ț":"t","Ţ":"t","ă":"a","Ă":"a","â":"a","Â":"a","î":"i","Î":"i" };
  return q.trim().toLowerCase().split("").map(c => map[c] ?? c).join("").replace(/\s+/g, " ");
}

function textScore(title: string, nq: string) {
  const t = normalize(title);
  if (t === nq) return 1.2;
  if (t.startsWith(nq)) return 1.0;
  if (t.includes(nq)) return 0.6;
  return 0.2;
}

function recencyBoost(when_at?: string | null) {
  if (!when_at) return 0.0;
  const now = Date.now();
  const t = new Date(when_at).getTime();
  const days = (t - now) / (1000*60*60*24);
  if (days < -7) return 0; // past long ago
  const d = Math.max(0, days);
  return Math.exp(-d / 30);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    let q = '';
    let kind = 'all';
    let sort = 'relevance';
    let page = 1;
    let pageSize = 20;
    let dateFrom: string | null = null;
    let dateTo: string | null = null;
    let tv: string | null = null;
    let genre: string | null = null;
    let category: string | null = null;

    if (req.method === 'POST') {
      const body = await req.json().catch(()=>({}));
      q = String(body.q || '');
      kind = String(body.kind || 'all');
      sort = String(body.sort || 'relevance');
      page = Math.max(1, Number(body.page || 1));
      pageSize = Math.min(50, Math.max(10, Number(body.pageSize || 20)));
      dateFrom = body.dateFrom || null;
      dateTo = body.dateTo || null;
      tv = body.tv || null;
      genre = body.genre || null;
      category = body.category || null;
    } else {
      const url = new URL(req.url);
      q = url.searchParams.get('q') || '';
      kind = url.searchParams.get('kind') || 'all';
      sort = url.searchParams.get('sort') || 'relevance';
      page = Math.max(1, Number(url.searchParams.get('page') || '1'));
      pageSize = Math.min(50, Math.max(10, Number(url.searchParams.get('pageSize') || '20')));
      dateFrom = url.searchParams.get('dateFrom');
      dateTo = url.searchParams.get('dateTo');
      tv = url.searchParams.get('tv');
      genre = url.searchParams.get('genre');
      category = url.searchParams.get('category');
    }

    const nq = normalize(q);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from('search_index').select('id,kind,entity_id,slug,title,subtitle,when_at,tv,popularity,search_text,genres,category_slug', { count: 'exact' });

    if (q) {
      query = query.textSearch('search_tsv', nq, { type: 'plain' }).or(`title.ilike.%${q}%,search_text.ilike.%${nq}%`);
    }

    if (kind !== 'all') query = query.eq('kind', kind);
    if (dateFrom) query = query.gte('when_at', dateFrom);
    if (dateTo) query = query.lte('when_at', dateTo);
    if (tv) query = query.contains('tv', [tv]);
    if (genre) query = query.contains('genres', [genre]);
    if (category) query = query.eq('category_slug', category);

    // Fetch a larger slice then re-rank
    const { data: prelim, count, error } = await query.range(0, Math.max(100, to));
    if (error) throw error;

    const maxPop = Math.max(1, ...((prelim||[]).map((x:any)=> Number(x.popularity||0))));
    const scored = (prelim || []).map((it: any) => {
      const sText = textScore(it.title || '', nq);
      const sTime = recencyBoost(it.when_at);
      const sPop = Number(it.popularity || 0) / maxPop;
      const sTv = (it.kind === 'match' && (it.tv || []).length > 0) ? 0.05 : 0;
      const score = 0.5*sText + 0.3*sTime + 0.2*sPop + sTv;
      return { ...it, _score: score };
    });

    let items = scored;
    if (sort === 'relevance') items = scored.sort((a,b)=> b._score - a._score);
    if (sort === 'soon') items = scored.sort((a,b)=> new Date(a.when_at||0).getTime() - new Date(b.when_at||0).getTime());
    if (sort === 'popular') items = scored.sort((a,b)=> Number(b.popularity||0) - Number(a.popularity||0));

    const pageItems = items.slice(from, to+1);

    // Facets (basic): kinds and tv
    const kindsCount: Record<string, number> = {};
    const tvCount: Record<string, number> = {};
    (prelim || []).forEach((it: any) => {
      kindsCount[it.kind] = (kindsCount[it.kind] || 0) + 1;
      (it.tv || []).forEach((t: string) => tvCount[t] = (tvCount[t] || 0) + 1);
    });

    let didYouMean: string | null = null;
    if (((count || 0) === 0 || pageItems.length===0) && q && q.length >= 4) {
      const { data: alt } = await supabase
        .from('search_index')
        .select('title')
        .ilike('title', `%${q.slice(0, q.length - 1)}%`)
        .limit(1);
      if (alt && alt[0]) didYouMean = alt[0].title;
    }

    return new Response(JSON.stringify({ items: pageItems, total: count || (prelim||[]).length, facets: { kinds: kindsCount, tv: tvCount }, didYouMean }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('search error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
