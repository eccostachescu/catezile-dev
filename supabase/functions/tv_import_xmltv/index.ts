import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { url: xmlUrl } = await req.json().catch(()=>({ url: Deno.env.get('XMLTV_URL') }));
    if (!xmlUrl) return new Response(JSON.stringify({ error: 'Missing XMLTV URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const res = await fetch(xmlUrl);
    const xml = await res.text();

    // Very naive XMLTV parse (titles + start/stop + channel id)
    const programmeRegex = /<programme[^>]*start="([^"]+)"[^>]*stop="([^"]+)"[^>]*channel="([^"]+)"[^>]*>([\s\S]*?)<\/programme>/g;
    const titleRegex = /<title[^>]*>([\s\S]*?)<\/title>/;

    // Build channel mapping: alias -> channel_id
    const [{ data: channels }, { data: aliases }] = await Promise.all([
      supabase.from('tv_channel').select('id,name,slug,active').eq('active', true),
      supabase.from('tv_channel_alias').select('alias, canonical')
    ]);
    const normalize = (s: string) => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
    const nameToId = new Map<string, string>();
    (channels || []).forEach((c: any) => {
      nameToId.set(normalize(c.name), c.id);
      if (c.slug) nameToId.set(normalize(c.slug), c.id);
    });
    const aliasToCanonical = new Map<string, string>();
    (aliases || []).forEach((a: any) => aliasToCanonical.set(normalize(a.alias), normalize(a.canonical)));

    const rows: any[] = [];
    let m: RegExpExecArray | null;
    const toIso = (xmlDate: string) => {
      // xmltv often uses YYYYMMDDHHMMSS + timezone offset like +0300
      const dt = xmlDate.slice(0,14);
      const tz = xmlDate.slice(14);
      const yyyy = dt.slice(0,4), MM = dt.slice(4,6), dd = dt.slice(6,8), hh = dt.slice(8,10), mm = dt.slice(10,12), ss = dt.slice(12,14);
      const iso = `${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}${tz ? tz.slice(0,3)+":"+tz.slice(3) : 'Z'}`;
      return new Date(iso).toISOString();
    };

    while ((m = programmeRegex.exec(xml)) !== null) {
      const start = toIso(m[1]);
      const stop = toIso(m[2]);
      const channelRaw = normalize(m[3]);
      const body = m[4] || '';
      const titleMatch = body.match(titleRegex);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g,'').trim() : 'Program';

      const canonical = aliasToCanonical.get(channelRaw) || channelRaw;
      const channelId = nameToId.get(canonical);
      if (!channelId) continue;

      rows.push({
        channel_id: channelId,
        kind: 'other',
        source: 'xmltv',
        title,
        subtitle: null,
        starts_at: start,
        ends_at: stop,
        match_id: null,
        status: 'SCHEDULED',
      });
    }

    // Only keep next 7 days
    const now = Date.now();
    const in7 = now + 7*24*3600*1000;
    const filtered = rows.filter(r => {
      const ts = new Date(r.starts_at).getTime();
      return ts >= now && ts <= in7;
    });

    for (let i = 0; i < filtered.length; i += 500) {
      const batch = filtered.slice(i, i+500);
      const { error } = await supabase.from('tv_program').upsert(batch, { onConflict: 'channel_id,starts_at,title' });
      if (error) console.error('upsert error', error.message);
    }

    return new Response(JSON.stringify({ inserted: filtered.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
