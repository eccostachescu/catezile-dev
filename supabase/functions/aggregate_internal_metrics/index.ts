import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-cron",
};

function fmtDay(date: Date, tz = Deno.env.get('TIMEZONE') || 'Europe/Bucharest') {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const y = parts.find(p => p.type === 'year')?.value;
  const m = parts.find(p => p.type === 'month')?.value;
  const d = parts.find(p => p.type === 'day')?.value;
  return `${y}-${m}-${d}`;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    // Optional cron protection via header
    const cronHeader = req.headers.get('x-admin-cron');
    const cronSecret = Deno.env.get('ADMIN_CRON_SECRET');
    if (cronSecret && cronHeader !== cronSecret) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    const now = new Date();
    const lookbackIso = new Date(now.getTime() - 1000 * 60 * 60 * 48).toISOString(); // last 48h
    const tz = Deno.env.get('TIMEZONE') || 'Europe/Bucharest';

    // 1) Affiliate clicks (from click.kind='affiliate')
    const { data: clicks, error: clicksErr } = await supabase
      .from('click')
      .select('entity_id, created_at')
      .eq('kind', 'affiliate')
      .gte('created_at', lookbackIso);
    if (clicksErr) throw clicksErr;

    // Group by day and affiliate_link_id
    const perDayAffiliate = new Map<string, Map<string, number>>();
    for (const c of clicks || []) {
      const day = fmtDay(new Date(c.created_at), tz);
      const linkId = c.entity_id as string;
      if (!perDayAffiliate.has(day)) perDayAffiliate.set(day, new Map());
      const map = perDayAffiliate.get(day)!;
      map.set(linkId, (map.get(linkId) || 0) + 1);
    }

    // Fetch affiliate metadata for EPC and merchant
    const allLinkIds = Array.from(new Set((clicks || []).map((c: any) => c.entity_id))).filter(Boolean);
    let linkMeta: Record<string, { merchant: string | null; epc: number } > = {};
    if (allLinkIds.length) {
      const { data: links } = await supabase.from('affiliate_link').select('id, merchant, epc_estimate').in('id', allLinkIds);
      for (const l of links || []) linkMeta[l.id] = { merchant: l.merchant, epc: Number(l.epc_estimate || 0) };
    }

    // Upsert affiliate_kpi_daily and metric_daily (affiliate_clicks and revenue_est)
    for (const [day, perLink] of perDayAffiliate.entries()) {
      let totalClicks = 0;
      let totalRevenue = 0;
      const rows: any[] = [];
      for (const [linkId, clicks] of perLink.entries()) {
        totalClicks += clicks;
        const meta = linkMeta[linkId] || { merchant: null, epc: 0 };
        const est = clicks * meta.epc;
        totalRevenue += est;
        rows.push({ day, affiliate_link_id: linkId, merchant: meta.merchant, clicks, est_revenue: est });
      }
      if (rows.length) {
        await supabase.from('affiliate_kpi_daily').upsert(rows, { onConflict: 'day,affiliate_link_id' });
      }
      // metric_daily: affiliate_clicks (total)
      const { data: existing } = await supabase
        .from('metric_daily')
        .select('id')
        .eq('day', day)
        .eq('source', 'affiliate')
        .eq('metric', 'affiliate_clicks')
        .eq('labels', '{}')
        .maybeSingle();
      if (existing?.id) {
        await supabase.from('metric_daily').update({ value: totalClicks }).eq('id', existing.id);
      } else {
        await supabase.from('metric_daily').insert({ day, source: 'affiliate', metric: 'affiliate_clicks', value: totalClicks, labels: {} });
      }
      // metric_daily: revenue_est (affiliate part)
      const { data: existingRev } = await supabase
        .from('metric_daily')
        .select('id')
        .eq('day', day)
        .eq('source', 'affiliate')
        .eq('metric', 'revenue_est')
        .eq('labels', '{}')
        .maybeSingle();
      if (existingRev?.id) {
        await supabase.from('metric_daily').update({ value: totalRevenue }).eq('id', existingRev.id);
      } else {
        await supabase.from('metric_daily').insert({ day, source: 'affiliate', metric: 'revenue_est', value: totalRevenue, labels: {} });
      }
    }

    // 2) Reminders sent (from reminder_log)
    const { data: rlogs, error: rErr } = await supabase
      .from('reminder_log')
      .select('sent_at')
      .gte('sent_at', lookbackIso);
    if (rErr) throw rErr;
    const perDayRem: Record<string, number> = {};
    for (const r of rlogs || []) {
      const day = fmtDay(new Date(r.sent_at), tz);
      perDayRem[day] = (perDayRem[day] || 0) + 1;
    }
    for (const [day, count] of Object.entries(perDayRem)) {
      const { data: existing } = await supabase
        .from('metric_daily')
        .select('id')
        .eq('day', day)
        .eq('source', 'internal')
        .eq('metric', 'reminders_sent')
        .eq('labels', '{}')
        .maybeSingle();
      if (existing?.id) await supabase.from('metric_daily').update({ value: count }).eq('id', existing.id);
      else await supabase.from('metric_daily').insert({ day, source: 'internal', metric: 'reminders_sent', value: count, labels: {} });
    }

    // 3) Ads RPM estimate (if setting exists) → revenue_est additive
    const { data: setting } = await supabase.from('settings').select('value').eq('key', 'ads_rpm_est').maybeSingle();
    if (setting?.value) {
      // If we already have ad_views in metric_daily (possibly from plausible function), estimate per day
      const sinceDay = fmtDay(new Date(now.getTime() - 1000 * 60 * 60 * 48), tz);
      const { data: adViews } = await supabase
        .from('metric_daily')
        .select('day, value')
        .eq('source', 'ads')
        .eq('metric', 'ad_views')
        .gte('day', sinceDay);
      for (const row of adViews || []) {
        const est = Number(row.value) * Number(setting.value) / 1000;
        // upsert revenue_est (ads) and also sum to total revenue_est (internal)
        const { data: existingAds } = await supabase
          .from('metric_daily')
          .select('id')
          .eq('day', row.day)
          .eq('source', 'ads')
          .eq('metric', 'revenue_est')
          .eq('labels', '{}')
          .maybeSingle();
        if (existingAds?.id) await supabase.from('metric_daily').update({ value: est }).eq('id', existingAds.id);
        else await supabase.from('metric_daily').insert({ day: row.day, source: 'ads', metric: 'revenue_est', value: est, labels: {} });
      }
    }

    // Log
    await supabase.from('ingestion_log').insert({ source: 'aggregate_internal_metrics', status: 'OK', rows: (clicks?.length || 0) + (rlogs?.length || 0) });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  } catch (e: any) {
    console.error('aggregate_internal_metrics error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
