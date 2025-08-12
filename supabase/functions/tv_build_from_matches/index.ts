import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function normalize(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[șş]/g,'s').replace(/[țţ]/g,'t').replace(/[ăâ]/g,'a').replace(/[î]/g,'i')
    .replace(/\s+/g,' ').trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { fromDays = -1, toDays = 7 } = (await req.json().catch(()=>({}))) as any;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const now = new Date();
    const from = new Date(now.getTime() + fromDays*24*3600*1000);
    const to = new Date(now.getTime() + toDays*24*3600*1000);

    // Load channels and aliases
    const [{ data: channels }, { data: aliases }] = await Promise.all([
      supabase.from('tv_channel').select('id,name,slug,active').eq('active', true),
      supabase.from('tv_channel_alias').select('alias, canonical')
    ]);

    const nameToId = new Map<string, string>();
    (channels || []).forEach((c: any) => {
      nameToId.set(normalize(c.name), c.id);
      if (c.slug) nameToId.set(normalize(c.slug), c.id);
    });

    const aliasToCanonical = new Map<string, string>();
    (aliases || []).forEach((a: any) => aliasToCanonical.set(normalize(a.alias), normalize(a.canonical)));

    const { data: matches } = await supabase
      .from('match')
      .select('id,home,away,kickoff_at,tv_channels,status')
      .gte('kickoff_at', from.toISOString())
      .lte('kickoff_at', to.toISOString())
      .not('tv_channels','is', null);

    const rows: any[] = [];

    const toStatus = (s: string | null | undefined) => {
      if (s === 'LIVE') return 'LIVE';
      if (s === 'FINISHED') return 'FINISHED';
      if (s === 'CANCELLED') return 'CANCELLED';
      return 'SCHEDULED';
    };

    (matches || []).forEach((m: any) => {
      const starts = new Date(m.kickoff_at);
      const ends = new Date(starts.getTime() + 2*60*60*1000);
      const title = `${m.home} – ${m.away}`;
      (m.tv_channels || []).forEach((raw: string) => {
        const n = normalize(raw);
        const canonical = aliasToCanonical.get(n) || n;
        const channelId = nameToId.get(canonical);
        if (!channelId) return;
        rows.push({
          channel_id: channelId,
          kind: 'sport',
          source: 'derived',
          title,
          subtitle: null,
          starts_at: starts.toISOString(),
          ends_at: ends.toISOString(),
          match_id: m.id,
          status: toStatus(m.status),
        });
      });
    });

    // Upsert in batches
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i+500);
      const { error } = await supabase.from('tv_program').upsert(batch, { onConflict: 'channel_id,starts_at,title' });
      if (error) console.error('upsert error', error.message);
    }

    return new Response(JSON.stringify({ inserted: rows.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
