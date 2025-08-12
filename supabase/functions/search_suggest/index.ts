import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalize(q: string) {
  const map: Record<string, string> = {
    "ș": "s", "ş": "s", "Ș": "s", "Ş": "s",
    "ț": "t", "ţ": "t", "Ț": "t", "Ţ": "t",
    "ă": "a", "Ă": "a", "â": "a", "Â": "a", "î": "i", "Î": "i",
  };
  return q.trim().toLowerCase().split("").map((c) => map[c] ?? c).join("").replace(/\s+/g, " ");
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    let q = '';
    let limit = 8;
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      q = String(body.q || '');
      limit = Math.min(Number(body.limit || 8), 12);
    } else {
      const url = new URL(req.url);
      q = (url.searchParams.get('q') || '').slice(0, 100);
      limit = Math.min(Number(url.searchParams.get('limit') || '8'), 12);
    }

    if (q.trim().length < 2) {
      return new Response(JSON.stringify({ items: [] }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const nq = normalize(q);

    // Unified index suggestions (entities)
    const { data: ents } = await supabase
      .from('search_index')
      .select('kind, entity_id, slug, title, subtitle, when_at, tv, popularity')
      .or(`title.ilike.${q.replace(/%/g,'').replace(/_/g,'')}%,search_text.ilike.${nq}%`)
      .order('popularity', { ascending: false, nullsFirst: true })
      .order('when_at', { ascending: true, nullsFirst: false })
      .limit(limit);

    // Teams (simple distinct across home/away)
    const { data: homeTeams } = await supabase
      .from('match')
      .select('home')
      .ilike('home', `%${q}%`)
      .limit(8);
    const { data: awayTeams } = await supabase
      .from('match')
      .select('away')
      .ilike('away', `%${q}%`)
      .limit(8);
    const teamsSet = new Set<string>();
    (homeTeams || []).forEach((r: any) => r?.home && teamsSet.add(r.home));
    (awayTeams || []).forEach((r: any) => r?.away && teamsSet.add(r.away));
    const teams = Array.from(teamsSet).slice(0, 4).map((name) => ({ kind: 'team', title: name, slug: name.toLowerCase().replace(/\s+/g,'-') }));

    // TV channels
    const { data: channels } = await supabase
      .from('tv_channel')
      .select('slug,name')
      .ilike('name', `%${q}%`)
      .limit(4);

    const items = [
      ...((ents ?? []).map((e: any) => ({ kind: e.kind, id: e.entity_id, slug: e.slug, title: e.title, subtitle: e.subtitle, when_at: e.when_at, tv: e.tv }))),
      ...teams,
      ...((channels ?? []).map((c: any) => ({ kind: 'tv', slug: c.slug, title: c.name }))),
    ].slice(0, limit);

    return new Response(JSON.stringify({ items }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('search_suggest error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
