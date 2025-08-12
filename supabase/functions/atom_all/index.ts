import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const SITE_URL = "https://catezile.ro";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function iso(dt?: string | Date | null) {
  const d = dt ? new Date(dt) : new Date();
  return d.toISOString();
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

    const entries = (data || []).map((it: any) => {
      const link = entryLink(it.kind, it.slug || null, it.entity_id || it.id);
      const updated = iso(it.when_at);
      const id = `tag:catezile.ro,${updated.substring(0,10)}:item:${it.id}`;
      return [
        '  <entry>',
        `    <title>${(it.title || '').toString().replace(/&/g,'&amp;')}</title>`,
        `    <id>${id}</id>`,
        `    <updated>${updated}</updated>`,
        `    <link href="${link}" rel="alternate"/>`,
        (it.subtitle ? `    <summary type="html"><![CDATA[${it.subtitle}]]></summary>` : ''),
        '  </entry>'
      ].filter(Boolean).join('\n');
    }).join('\n');

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<feed xmlns="http://www.w3.org/2005/Atom">',
      `  <title>CâteZile.ro — Flux Atom</title>`,
      `  <id>tag:catezile.ro,2024:atom</id>`,
      `  <updated>${iso()}</updated>`,
      `  <link href="${SITE_URL}/atom.xml" rel="self"/>`,
      `  <link href="${SITE_URL}"/>`,
      entries,
      '</feed>'
    ].join('\n');

    return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900', ...corsHeaders } });
  } catch (e) {
    console.error('atom_all error', e);
    return new Response('Internal Error', { status: 500, headers: corsHeaders });
  }
});
