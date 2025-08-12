import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function toCsvRow(vals: (string|number)[]) {
  return vals.map(v => typeof v === 'string' && v.includes(',') ? `"${v.replaceAll('"','""')}"` : String(v)).join(',');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    let start = url.searchParams.get('start');
    let end = url.searchParams.get('end');
    if (req.method === 'POST') {
      const body = await req.json().catch(()=>undefined) as any;
      if (body?.start) start = body.start;
      if (body?.end) end = body.end;
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, { global: { headers: { ...Object.fromEntries(req.headers) } } });

    const where = (q: any, col: string) => {
      if (start) q = q.gte(col, start);
      if (end) q = q.lte(col, end);
      return q;
    };

    const { data: metrics } = await where(supabase.from('metric_daily').select('day, source, metric, value, labels').order('day',{ascending:true}), 'day');
    const { data: aff } = await where(supabase.from('affiliate_kpi_daily').select('day, affiliate_link_id, merchant, clicks, est_revenue').order('day',{ascending:true}), 'day');

    const header1 = 'table,day,source,metric,value,labels';
    const lines1 = (metrics||[]).map(m => toCsvRow(['metric_daily', m.day, m.source, m.metric, m.value, JSON.stringify(m.labels||{})]));

    const header2 = 'table,day,affiliate_link_id,merchant,clicks,est_revenue';
    const lines2 = (aff||[]).map(a => toCsvRow(['affiliate_kpi_daily', a.day, a.affiliate_link_id||'', a.merchant||'', a.clicks, a.est_revenue]));

    const csv = [header1, ...lines1, header2, ...lines2].join('\n');

    return new Response(csv, { status: 200, headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="metrics.csv"', ...corsHeaders } });
  } catch (e: any) {
    console.error('export_metrics_csv error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
});
