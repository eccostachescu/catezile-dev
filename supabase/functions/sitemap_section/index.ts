import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const SITE_URL = "https://catezile.ro";
const PAGE_SIZE = 5000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function iso(dt?: string | Date | null) {
  const d = dt ? new Date(dt) : new Date();
  return d.toISOString();
}

async function gzipText(text: string): Promise<Response> {
  // Use CompressionStream for gzip
  // @ts-ignore: Deno has CompressionStream
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  await writer.write(new TextEncoder().encode(text));
  await writer.close();
  const gzStream = cs.readable;
  return new Response(gzStream, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Content-Encoding': 'gzip',
      'Cache-Control': 'public, max-age=900',
      ...corsHeaders,
    },
  });
}

function urlXml(loc: string, lastmod?: string, changefreq?: string, priority?: number) {
  const parts = [
    `  <url>`,
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    typeof priority === 'number' ? `    <priority>${priority.toFixed(1)}</priority>` : '',
    `  </url>`
  ].filter(Boolean);
  return parts.join('\n');
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const section = (url.searchParams.get('section') || 'home').toLowerCase();
    const chunk = Math.max(1, Number(url.searchParams.get('chunk') || '1'));
    const from = (chunk - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const now = new Date();

    let urls: string[] = [];

    if (section === 'home') {
      const hubs = [
        { loc: `${SITE_URL}/`, changefreq: 'daily', priority: 0.9 },
        { loc: `${SITE_URL}/sport`, changefreq: 'daily', priority: 0.9 },
        { loc: `${SITE_URL}/filme`, changefreq: 'daily', priority: 0.9 },
      ];
      const { data: cats } = await supabase.from('category').select('slug, updated_at').order('sort');
      (cats || []).forEach((c: any) => hubs.push({ loc: `${SITE_URL}/categorii/${c.slug}`, lastmod: iso(c.updated_at), changefreq: 'weekly', priority: 0.8 }));
      urls = hubs.slice(from, to + 1).map(u => urlXml(u.loc, u.lastmod, u.changefreq, u.priority));
    }

    if (section === 'evenimente') {
      const { data, error } = await supabase
        .from('event')
        .select('slug, start_at, updated_at, verified_at')
        .eq('editorial_status', 'PUBLISHED')
        .range(from, to);
      if (error) throw error;
      urls = (data || []).map((e: any) => {
        const last = iso(e.verified_at || e.updated_at || e.start_at || now);
        const soonDays = Math.abs((new Date(e.start_at).getTime() - now.getTime()) / 86400000);
        const priority = soonDays < 30 ? 0.8 : 0.6;
        const changefreq = soonDays < 7 ? 'daily' : 'weekly';
        return urlXml(`${SITE_URL}/evenimente/${e.slug}`, last, changefreq, priority);
      });
    }

    if (section === 'sport') {
      const { data, error } = await supabase
        .from('match')
        .select('id, kickoff_at, updated_at, status')
        .in('status', ['SCHEDULED', 'FINISHED'])
        .range(from, to);
      if (error) throw error;
      urls = (data || []).map((m: any) => {
        const last = iso(m.updated_at || m.kickoff_at || now);
        const sameDay = Math.abs((new Date(m.kickoff_at).getTime() - now.getTime()) / 86400000) < 1;
        const changefreq = sameDay ? 'hourly' : 'daily';
        const priority = sameDay ? 0.8 : 0.5;
        return urlXml(`${SITE_URL}/sport/${m.id}`, last, changefreq, priority);
      });
    }

    if (section === 'filme') {
      const { data, error } = await supabase
        .from('movie')
        .select('id, slug, updated_at, cinema_release_ro, status')
        .in('status', ['SCHEDULED', 'RELEASED'])
        .range(from, to);
      if (error) throw error;
      urls = (data || []).map((m: any) => {
        const lm = m.updated_at || m.cinema_release_ro || now;
        const last = iso(lm);
        const days = m.cinema_release_ro ? Math.abs((new Date(m.cinema_release_ro).getTime() - now.getTime()) / 86400000) : 90;
        const priority = days < 30 ? 0.8 : (days > 90 ? 0.4 : 0.6);
        const changefreq = 'weekly';
        const slug = m.slug || m.id;
        return urlXml(`${SITE_URL}/filme/${slug}`, last, changefreq, priority);
      });
    }

    if (section === 'countdowns') {
      const { data, error } = await supabase
        .from('countdown')
        .select('id, updated_at, target_at')
        .eq('status', 'APPROVED')
        .eq('privacy', 'PUBLIC')
        .range(from, to);
      if (error) throw error;
      urls = (data || []).map((c: any) => urlXml(`${SITE_URL}/c/${c.id}`, iso(c.updated_at || c.target_at || now), 'weekly', 0.6));
    }

    if (section === 'discovery') {
      const tagStart = from;
      const tagEnd = to;
      const { data: tags } = await supabase.from('tag').select('slug').range(tagStart, tagEnd);
      const tagUrls = (tags || []).map((t: any) => urlXml(`${SITE_URL}/tag/${t.slug}`, undefined, 'weekly', 0.5));
      const { data: tvs } = await supabase.from('tv_channel').select('slug').range(tagStart, tagEnd);
      const tvUrls = (tvs || []).map((t: any) => urlXml(`${SITE_URL}/tv/${t.slug}`, undefined, 'weekly', 0.5));
      urls = [...tagUrls, ...tvUrls].slice(0, PAGE_SIZE);
    }

    if (section === 'static') {
      const { data } = await supabase.from('static_pages').select('url');
      const all = (data || []).map((r: any) => urlXml(`${SITE_URL}${r.url}`, iso(), 'weekly', 0.5));
      urls = all.slice(from, to + 1);
    }

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urls.join('\n'),
      '</urlset>'
    ].join('\n');

    return gzipText(xml);
  } catch (e) {
    console.error('sitemap_section error', e);
    return new Response('Internal Error', { status: 500, headers: corsHeaders });
  }
});
