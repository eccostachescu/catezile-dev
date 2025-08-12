import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const CRON_SECRET = Deno.env.get('ADMIN_CRON_SECRET');
    if (!CRON_SECRET || req.headers.get('x-cron-secret') !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get LIVE or soon offers and compute a simple score
    const now = new Date();
    const in24h = new Date(now.getTime() + 24*3600*1000).toISOString();
    const { data: offers } = await supabase
      .from('bf_offer')
      .select('id, merchant_id, discount_percent, price, price_old, starts_at, ends_at, score')
      .or(`status.eq.LIVE,and(starts_at.lte.${in24h},status.eq.COMING_SOON)`) // include soon ones
      .limit(500);

    if (offers && offers.length) {
      // fetch merchant EPC
      const merchantIds = Array.from(new Set(offers.map((o: any) => o.merchant_id)));
      const { data: merchants } = await supabase.from('bf_merchant').select('id, epc_estimate').in('id', merchantIds);
      const epcMap = new Map((merchants||[]).map((m:any)=>[m.id, Number(m.epc_estimate||0)]));
      const maxEpc = Math.max(1, ...Array.from(epcMap.values()));

      const updates = offers.map((o: any) => {
        const pct = Number(o.discount_percent || 0);
        const epc = epcMap.get(o.merchant_id) || 0;
        const epcNorm = epc / maxEpc;
        const freshness = o.starts_at ? Math.max(0, 1 - (Math.max(0, (Date.now() - new Date(o.starts_at).getTime())) / (7*24*3600*1000))) : 0.5;
        const score = pct * 0.6 + epcNorm * 20 + freshness * 10;
        return { id: o.id, score };
      });

      await supabase.from('bf_offer').upsert(updates);
    }

    return new Response(JSON.stringify({ ok: true, updated: offers?.length || 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Unexpected', details: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
