import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { channelSlug, windowMin = 90 } = await req.json().catch(()=>({}));
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    let channelId: string | null = null;
    if (channelSlug) {
      const { data: ch } = await supabase.from('tv_channel').select('id').eq('slug', channelSlug).maybeSingle();
      channelId = ch?.id ?? null;
    }

    const now = new Date();
    const until = new Date(now.getTime() + Number(windowMin) * 60 * 1000);

    let q = supabase.from('tv_program').select('id,channel_id,title,subtitle,starts_at,ends_at,status,match_id').eq('kind','sport');
    if (channelId) q = q.eq('channel_id', channelId);

    // LIVE: starts_at <= now <= ends_at (or ends_at null) and NEXT: starts between now and until
    const { data: liveRows } = await q.lte('starts_at', now.toISOString()).or(`ends_at.is.null,ends_at.gte.${now.toISOString()}`).order('starts_at', { ascending: true }).limit(8);
    const { data: nextRows } = await q.gte('starts_at', now.toISOString()).lte('starts_at', until.toISOString()).order('starts_at', { ascending: true }).limit(8);

    const ids = Array.from(new Set([...(liveRows||[]), ...(nextRows||[])]
      .map((r: any) => r.match_id).filter(Boolean)));
    let matchesMap = new Map<string, any>();
    if (ids.length) {
      const { data: matches } = await supabase.from('match').select('id,home,away,status,score,slug,kickoff_at,tv_channels').in('id', ids);
      matchesMap = new Map(matches?.map((m: any) => [m.id, m]) || []);
    }

    const enrich = (rows: any[]) => (rows||[]).map((r: any) => ({
      ...r,
      match: r.match_id ? matchesMap.get(r.match_id) || null : null,
    }));

    return new Response(JSON.stringify({
      live: enrich(liveRows||[]),
      next: enrich(nextRows||[]),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
