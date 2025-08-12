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

    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { merchantSlug, offers = [], source = 'json' } = body || {};
    if (!merchantSlug || !Array.isArray(offers)) {
      return new Response(JSON.stringify({ error: 'merchantSlug and offers[] required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: merchant } = await supabase.from('bf_merchant').select('id, slug, epc_estimate, affiliate_base_url').eq('slug', merchantSlug).maybeSingle();
    if (!merchant) {
      return new Response(JSON.stringify({ error: 'merchant not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const toPct = (n: any) => {
      const x = Number(n);
      if (!isFinite(x)) return null;
      return Math.round(x);
    };

    const nowIso = new Date().toISOString();

    const rows = [] as any[];
    for (const o of offers) {
      // expected fields: title, image_url, price, price_old, url, category_slug, starts_at, ends_at
      const title = String(o.title || '').trim(); if (!title) continue;
      const product_url = String(o.url || o.product_url || '').trim(); if (!product_url) continue;
      const price = o.price != null ? Number(o.price) : null;
      const price_old = o.price_old != null ? Number(o.price_old) : null;
      const discount_percent = (price != null && price_old != null && price_old > 0) ? toPct(100 - (price * 100) / price_old) : null;

      // category lookup (optional)
      let category_id: string | null = null;
      const cslug = (o.category || o.category_slug || '').toString().trim();
      if (cslug) {
        const { data: cat } = await supabase.from('bf_category').select('id').eq('slug', cslug).maybeSingle();
        category_id = cat?.id ?? null;
      }

      // create offer row (affiliate_link_id left null; existing /out/:id uses affiliate_link table elsewhere)
      const starts_at = o.starts_at ? new Date(o.starts_at).toISOString() : null;
      const ends_at = o.ends_at ? new Date(o.ends_at).toISOString() : null;
      const status = (starts_at && starts_at > nowIso) ? 'COMING_SOON' : (ends_at && ends_at < nowIso) ? 'EXPIRED' : 'LIVE';

      rows.push({
        merchant_id: merchant.id,
        category_id,
        title,
        subtitle: o.subtitle || null,
        price,
        price_old,
        discount_percent,
        image_url: o.image_url || null,
        product_url,
        starts_at,
        ends_at,
        status,
      });
    }

    // Upsert by unique key (merchant_id + product_url). Create a temp unique index to use on_conflict?
    // We can't add index from function; perform manual merge: fetch existing for URLs and update/insert accordingly
    const urls = rows.map(r => r.product_url);
    const { data: existing } = await supabase.from('bf_offer').select('id, product_url').in('product_url', urls).eq('merchant_id', merchant.id);
    const existingMap = new Map((existing || []).map((e: any) => [e.product_url, e.id] as const));

    const inserts: any[] = [];
    const updates: any[] = [];
    for (const r of rows) {
      const id = existingMap.get(r.product_url);
      if (id) updates.push({ id, ...r }); else inserts.push(r);
    }

    if (inserts.length) await supabase.from('bf_offer').insert(inserts);
    if (updates.length) await supabase.from('bf_offer').upsert(updates);

    // Log
    await supabase.from('ingestion_log').insert({ source: 'bf-import', status: 'OK', rows: rows.length, message: `${merchantSlug}/${source}` });

    return new Response(JSON.stringify({ ok: true, inserted: inserts.length, updated: updates.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Unexpected', details: e?.message || String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
