import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BodyIn {
  id: string;
  path?: string;
  referrer?: string;
  campaign?: string;
  subid?: string;
  utm?: Record<string, any>;
}

function buildUrl(link: { url: string; deeplink_template: string | null }): string {
  const base = link.url;
  const tmpl = link.deeplink_template || '';
  if (!tmpl) return base;
  const encoded = encodeURIComponent(base);
  return tmpl
    .replace(/\{\{?url\}?\}/gi, encoded)
    .replace(/\{url\}/gi, encoded);
}

function parseIp(h: Headers): string | null {
  const xf = h.get('x-forwarded-for') || '';
  if (xf) return xf.split(',')[0].trim();
  const ip = h.get('cf-connecting-ip') || h.get('x-real-ip');
  return ip || null;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey, {
      global: { headers: { ...Object.fromEntries(req.headers) } },
    });

    const body = (await req.json().catch(() => ({}))) as BodyIn;
    const id = String(body?.id || '').trim();
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });

    const { data: link, error: linkErr } = await supabase
      .from('affiliate_link')
      .select('id, url, deeplink_template, status, active')
      .eq('id', id)
      .maybeSingle();
    if (linkErr) throw linkErr;
    if (!link || link.status !== 'ACTIVE' || link.active === false) {
      return new Response(JSON.stringify({ error: 'Link inactiv' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

    const finalUrl = buildUrl({ url: link.url as any, deeplink_template: (link as any).deeplink_template });

    // Log click (best-effort)
    const ua = req.headers.get('user-agent') || null;
    const ip = parseIp(req.headers);
    const row: any = {
      kind: 'affiliate',
      entity_id: link.id,
      path: body.path || null,
      referrer: body.referrer || null,
      utm: body.utm || null,
      user_agent: ua,
      ip,
      campaign: body.campaign || null,
      subid: body.subid || null,
    };
    await supabase.from('click').insert(row);

    return new Response(JSON.stringify({ url: finalUrl }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (e: any) {
    console.error('out_redirect error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Eroare' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
