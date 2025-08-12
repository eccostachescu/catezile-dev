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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    // Optional cron protection
    const cronHeader = req.headers.get('x-admin-cron');
    const cronSecret = Deno.env.get('ADMIN_CRON_SECRET');
    if (cronSecret && cronHeader !== cronSecret) {
      // continue; idempotent
    }

    // Preload category map
    const { data: cats } = await supabase.from('category').select('id,slug');
    const catMap = new Map<string,string>();
    (cats||[]).forEach((c:any)=>{ if (c.id && c.slug) catMap.set(c.id, c.slug); });

    const batch: any[] = [];

    // Events
    const { data: events } = await supabase
      .from('event')
      .select('id,slug,title,description,start_at,city,status,category_id')
      .eq('status','PUBLISHED')
      .limit(5000);
    for (const e of events || []) {
      const title = e.title as string;
      const subtitle = e.city ? `${e.city}` : undefined;
      batch.push({
        kind: 'event', entity_id: e.id, slug: e.slug, title,
        subtitle, when_at: e.start_at, tv: null, popularity: 0,
        search_text: normalize(`${title} ${e.description || ''} ${subtitle || ''}`),
        search_tsv: null,
        genres: null,
        category_slug: e.category_id ? catMap.get(e.category_id) || null : null,
      });
    }

    // Matches
    const { data: matches } = await supabase
      .from('match')
      .select('id,home,away,kickoff_at,tv_channels,status')
      .limit(5000);
    for (const m of matches || []) {
      const title = `${m.home} – ${m.away}`;
      const subtitle = (m.tv_channels && (m.tv_channels as string[]).length) ? `TV: ${(m.tv_channels as string[]).join(', ')}` : undefined;
      batch.push({
        kind: 'match', entity_id: m.id, slug: m.id, title,
        subtitle, when_at: m.kickoff_at, tv: m.tv_channels || [], popularity: 0,
        search_text: normalize(`${title} ${subtitle || ''}`),
        search_tsv: null,
        genres: null,
        category_slug: null,
      });
    }

    // Movies
    const { data: movies } = await supabase
      .from('movie')
      .select('id,title,original_title,cinema_release_ro,genres,status')
      .limit(5000);
    for (const mv of movies || []) {
      const title = mv.title as string;
      const subtitle = mv.cinema_release_ro ? `La cinema din ${new Date(mv.cinema_release_ro as any).toLocaleDateString('ro-RO')}` : undefined;
      batch.push({
        kind: 'movie', entity_id: mv.id, slug: mv.id, title,
        subtitle, when_at: mv.cinema_release_ro, tv: null, popularity: 0,
        search_text: normalize(`${title} ${mv.original_title || ''} ${(mv.genres||[]).join(' ')}`),
        search_tsv: null,
        genres: (mv.genres || []) as any,
        category_slug: null,
      });
    }

    // Countdowns (public approved)
    const { data: cds } = await supabase
      .from('countdown')
      .select('id,slug,title,target_at,status,privacy')
      .eq('status', 'APPROVED')
      .eq('privacy','PUBLIC')
      .limit(5000);
    for (const c of cds || []) {
      batch.push({
        kind: 'countdown', entity_id: c.id, slug: c.slug, title: c.title,
        subtitle: undefined, when_at: c.target_at, tv: null, popularity: 0,
        search_text: normalize(`${c.title}`),
        search_tsv: null,
        genres: null,
        category_slug: null,
      });
    }

    // Tags
    const { data: tags } = await supabase.from('tag').select('id,slug,name').limit(2000);
    for (const t of tags || []) {
      batch.push({ kind: 'tag', entity_id: t.id, slug: t.slug, title: t.name, subtitle: undefined, when_at: null, tv: null, popularity: 0, search_text: normalize(`${t.name}`), search_tsv: null, genres: null, category_slug: null });
    }

    // TV channels
    const { data: tvs } = await supabase.from('tv_channel').select('id,slug,name').limit(2000);
    for (const tv of tvs || []) {
      batch.push({ kind: 'tv', entity_id: tv.id, slug: tv.slug, title: tv.name, subtitle: undefined, when_at: null, tv: null, popularity: 0, search_text: normalize(`${tv.name}`), search_tsv: null, genres: null, category_slug: null });
    }

    if (batch.length) {
      const chunks = (arr: any[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, (i + 1) * size));
      for (const chunk of chunks(batch, 1000)) {
        const { error } = await supabase.from('search_index').upsert(chunk as any, { onConflict: 'kind,entity_id' });
        if (error) console.error('upsert error', error);
      }
    }

    return new Response(JSON.stringify({ ok: true, inserted: batch.length }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('search_index_refresh error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
