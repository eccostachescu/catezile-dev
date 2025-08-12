import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const SITE_URL = "https://catezile.ro";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function rfc822(dt?: string | Date | null) {
  const d = dt ? new Date(dt) : new Date();
  return d.toUTCString();
}

function entryLink(kind: string, slug: string | null, id: string | null) {
  if (kind === 'event' && slug) return `${SITE_URL}/evenimente/${slug}`;
  if (kind === 'match' && id) return `${SITE_URL}/sport/${id}`;
  if (kind === 'movie' && id) return `${SITE_URL}/filme/${id}`;
  if (kind === 'countdown' && id) return `${SITE_URL}/c/${id}`;
  return SITE_URL;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('search_index')
      .select('id, kind, title, subtitle, slug, entity_id, when_at')
      .not('when_at', 'is', null)
      .gte('when_at', nowIso)
      .order('when_at', { ascending: true })
      .limit(100);
    if (error) throw error;

    const items = (data || []).map((it: any) => {
      const link = entryLink(it.kind, it.slug || null, it.entity_id || it.id);
      const pubDate = rfc822(it.when_at);
      const guid = `catezile-${it.kind}-${it.id}`;
      const desc = (it.subtitle || '').toString();
      return [
        '  <item>',
        `    <title>${(it.title || '').toString().replace(/&/g,'&amp;')}</title>`,
        `    <link>${link}</link>`,
        `    <guid isPermaLink="false">${guid}</guid>`,
        `    <pubDate>${pubDate}</pubDate>`,
        desc ? `    <description><![CDATA[${desc}]]></description>` : '',
        '  </item>'
      ].filter(Boolean).join('\n');
    }).join('\n');

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<rss version="2.0">',
      ' <channel>',
      `  <title>CâteZile.ro — Noutăți</title>`,
      `  <link>${SITE_URL}</link>`,
      `  <description>Următoarele evenimente, meciuri și filme</description>`,
      `  <lastBuildDate>${rfc822()}</lastBuildDate>`,
      items,
      ' </channel>',
      '</rss>'
    ].join('\n');

    return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=900', ...corsHeaders } });
  } catch (e) {
    console.error('rss_all error', e);
    return new Response('Internal Error', { status: 500, headers: corsHeaders });
  }
});
