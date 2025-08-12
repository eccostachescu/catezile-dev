import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalize(q: string) {
  const map: Record<string, string> = { "ș":"s","ş":"s","Ș":"s","Ş":"s","ț":"t","ţ":"t","Ț":"t","Ţ":"t","ă":"a","Ă":"a","â":"a","Â":"a","î":"i","Î":"i" };
  return q.trim().toLowerCase().split("").map(c => map[c] ?? c).join("").replace(/\s+/g, " ");
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').slice(0, 200);
    const kind = url.searchParams.get('kind') || 'all';
    const sort = url.searchParams.get('sort') || 'relevance';
    const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(50, Math.max(10, Number(url.searchParams.get('pageSize') || '20')));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const nq = normalize(q);

    let query = supabase.from('search_index').select('*', { count: 'exact' });

    if (q) {
      // Use FTS if available
      query = query.textSearch('search_tsv', nq, { type: 'plain' }).or(`title.ilike.%${q}%,search_text.ilike.%${nq}%`);
    }

    if (kind !== 'all') query = query.eq('kind', kind);

    // Sorting
    if (sort === 'soon') query = query.order('when_at', { ascending: true, nullsFirst: false });
    else if (sort === 'popular') query = query.order('popularity', { ascending: false, nullsFirst: true });
    else query = query.order('when_at', { ascending: true, nullsFirst: false }).order('popularity', { ascending: false, nullsFirst: true });

    const { data: items, count, error } = await query.range(from, to);
    if (error) throw error;

    // Did you mean (simple): if no results and q length>=4, try partial
    let didYouMean: string | null = null;
    if ((count || 0) === 0 && q && q.length >= 4) {
      const { data: alt } = await supabase
        .from('search_index')
        .select('title')
        .ilike('title', `%${q.slice(0, q.length - 1)}%`)
        .limit(1);
      if (alt && alt[0]) didYouMean = alt[0].title;
    }

    return new Response(JSON.stringify({ items: items || [], total: count || 0, didYouMean }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('search error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
