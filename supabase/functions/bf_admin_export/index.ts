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

    const { data: offers } = await supabase
      .from('bf_offer')
      .select('id, title, price, price_old, discount_percent, merchant_id, created_at, score')
      .order('score', { ascending: false })
      .limit(1000);

    const headers = ['id','title','price','price_old','discount_percent','merchant_id','score'];
    const rows = (offers||[]).map((o:any)=> headers.map((h)=> JSON.stringify(o[h] ?? '')).join(','));
    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, { headers: { ...corsHeaders, 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="bf_offers_export.csv"' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Unexpected', details: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
