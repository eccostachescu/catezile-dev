import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-cron",
};

async function plausibleFetch(path: string, params: Record<string, string>) {
  const base = Deno.env.get('PLAUSIBLE_API_URL') || '';
  const site = Deno.env.get('PLAUSIBLE_SITE') || '';
  const key = Deno.env.get('PLAUSIBLE_API_KEY') || '';
  const url = new URL(base.replace(/\/$/, '') + path);
  url.searchParams.set('site_id', site);
  for (const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: { 'Authorization': `Bearer ${key}`, 'Accept':'application/json' } });
  if (!res.ok) throw new Error(`Plausible ${path} ${res.status}`);
  return res.json();
}

function fmtDay(date: Date, tz = Deno.env.get('TIMEZONE') || 'Europe/Bucharest') {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  // Allow manual run or cron protected
  const cronHeader = req.headers.get('x-admin-cron');
  const cronSecret = Deno.env.get('ADMIN_CRON_SECRET');

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.54.0");
  const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

  try {
    if (cronSecret && cronHeader !== cronSecret) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const haveKeys = !!(Deno.env.get('PLAUSIBLE_API_URL') && Deno.env.get('PLAUSIBLE_SITE') && Deno.env.get('PLAUSIBLE_API_KEY'));
    if (!haveKeys) {
      await supabase.from('ingestion_log').insert({ source: 'collect_plausible_daily', status: 'SKIP', message: 'Missing PLAUSIBLE_* envs' });
      return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const tz = Deno.env.get('TIMEZONE') || 'Europe/Bucharest';
    const now = new Date();
    const today = fmtDay(now, tz);
    const yday = fmtDay(new Date(now.getTime() - 24*60*60*1000), tz);

    // Aggregate visitors & pageviews for today and yesterday
    const periods = [today, yday];
    let rowsInserted = 0;

    for (const day of periods) {
      const agg = await plausibleFetch('/stats/aggregate', { period: 'day', date: day, metrics: 'pageviews,visitors' });
      const pv = Number(agg?.results?.pageviews?.value || 0);
      const vi = Number(agg?.results?.visitors?.value || 0);

      // Upsert metric_daily for pageviews and visitors
      const ensureMetric = async (metric: string, value: number) => {
        const { data: existing } = await supabase
          .from('metric_daily')
          .select('id')
          .eq('day', day)
          .eq('source', 'plausible')
          .eq('metric', metric)
          .eq('labels', '{}')
          .maybeSingle();
        if (existing?.id) await supabase.from('metric_daily').update({ value }).eq('id', existing.id);
        else await supabase.from('metric_daily').insert({ day, source: 'plausible', metric, value, labels: {} });
      };
      await ensureMetric('pageviews', pv);
      await ensureMetric('visitors', vi);
      rowsInserted += 2;

      // Top pages breakdown
      const br = await plausibleFetch('/stats/breakdown', { period: 'day', date: day, property: 'page', metrics: 'pageviews,visitors', limit: '100' });
      const pages = (br?.results || []) as Array<{ page: string; pageviews: number; visitors: number }>;
      if (Array.isArray(pages)) {
        const upserts = pages.map((p) => ({ day, path: (p as any).page, pageviews: Number((p as any).pageviews||0), visitors: Number((p as any).visitors||0) }));
        if (upserts.length) await supabase.from('top_pages_daily').upsert(upserts, { onConflict: 'day,path' });
        rowsInserted += upserts.length;
      }
    }

    await supabase.from('ingestion_log').insert({ source: 'collect_plausible_daily', status: 'OK', rows: rowsInserted });
    return new Response(JSON.stringify({ ok: true, rows: rowsInserted }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('collect_plausible_daily error', e);
    await supabase.from('ingestion_log').insert({ source: 'collect_plausible_daily', status: 'ERROR', message: e?.message });
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
