import path from 'path';
import { promises as fs } from 'fs';
import { gzipSync } from 'zlib';
import { createClient } from '@supabase/supabase-js';
import { formatInTimeZone } from 'date-fns-tz';

const SUPABASE_URL = "https://ibihfzhrsllndxhfwgvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU";
const SITE_URL = 'https://catezile.ro';
const CHUNK_SIZE = 5000;
const OUT_DIR = path.resolve(process.cwd(), 'public', 'sitemaps');

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

function isoRo(dt?: string | Date | null) {
  const d = dt ? new Date(dt) : new Date();
  return formatInTimeZone(d, 'Europe/Bucharest', "yyyy-MM-dd'T'HH:mmXXX");
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

function chunkify<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function writeGzipFile(filePath: string, xml: string) {
  const gz = gzipSync(Buffer.from(xml, 'utf8'));
  return fs.writeFile(filePath, gz);
}

async function buildHomeAndHubs(): Promise<{ section: string; items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }> {
  const hubs = [
    { loc: `${SITE_URL}/`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/sport`, changefreq: 'daily', priority: 0.9 },
    { loc: `${SITE_URL}/filme`, changefreq: 'daily', priority: 0.9 },
  ];
  const { data: cats } = await supabase.from('category').select('slug, updated_at').order('sort', { ascending: true });
  (cats || []).forEach((c: any) => hubs.push({ loc: `${SITE_URL}/categorii/${c.slug}`, lastmod: isoRo(c.updated_at), changefreq: 'weekly', priority: 0.8 }));
  return { section: 'home', items: hubs };
}

async function buildStatic(): Promise<{ section: string; items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }> {
  const { data } = await supabase.from('static_pages').select('url');
  const items = (data || []).map((r: any) => ({ loc: `${SITE_URL}${r.url}`, changefreq: 'weekly', priority: 0.5 }));
  return { section: 'static', items };
}

async function buildEvents(): Promise<{ section: string; items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }> {
  const now = new Date();
  const { data } = await supabase
    .from('event')
    .select('slug, start_at, updated_at, verified_at, editorial_status')
    .eq('editorial_status', 'PUBLISHED');
  const items = (data || []).map((e: any) => {
    const last = isoRo(e.verified_at || e.updated_at || e.start_at || now);
    const soonDays = Math.abs((new Date(e.start_at).getTime() - now.getTime()) / 86400000);
    const priority = soonDays < 30 ? 0.8 : 0.6;
    const changefreq = soonDays < 7 ? 'daily' : 'weekly';
    return { loc: `${SITE_URL}/evenimente/${e.slug}`, lastmod: last, changefreq, priority };
  });
  return { section: 'evenimente', items };
}

async function buildSport(): Promise<{ section: string; items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }> {
  const now = new Date();
  const { data } = await supabase
    .from('match')
    .select('id, kickoff_at, updated_at, status')
    .in('status', ['SCHEDULED', 'FINISHED']);
  const items = (data || []).map((m: any) => {
    const last = isoRo(m.updated_at || m.kickoff_at || now);
    const sameDay = Math.abs((new Date(m.kickoff_at).getTime() - now.getTime()) / 86400000) < 1;
    const changefreq = sameDay ? 'hourly' : 'daily';
    const priority = sameDay ? 0.8 : 0.5;
    return { loc: `${SITE_URL}/sport/${m.id}`, lastmod: last, changefreq, priority };
  });
  return { section: 'sport', items };
}

async function buildMovies(): Promise<{ section: string; items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }> {
  const now = new Date();
  const { data } = await supabase
    .from('movie')
    .select('id, slug, updated_at, cinema_release_ro, status')
    .in('status', ['SCHEDULED', 'RELEASED']);
  const items = (data || []).map((m: any) => {
    const lm = m.updated_at || m.cinema_release_ro || now;
    const last = isoRo(lm);
    const days = m.cinema_release_ro ? Math.abs((new Date(m.cinema_release_ro).getTime() - now.getTime()) / 86400000) : 90;
    const priority = days < 30 ? 0.8 : (days > 90 ? 0.4 : 0.6);
    const changefreq = 'weekly';
    const slug = m.slug || m.id;
    return { loc: `${SITE_URL}/filme/${slug}`, lastmod: last, changefreq, priority };
  });
  return { section: 'filme', items };
}

async function buildCountdowns(): Promise<{ section: string; items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }> {
  const now = new Date();
  const { data } = await supabase
    .from('countdown')
    .select('id, updated_at, target_at, status, privacy')
    .eq('status', 'APPROVED')
    .eq('privacy', 'PUBLIC');
  const items = (data || []).map((c: any) => {
    const last = isoRo(c.updated_at || c.target_at || now);
    return { loc: `${SITE_URL}/c/${c.id}`, lastmod: last, changefreq: 'weekly', priority: 0.6 };
  });
  return { section: 'countdowns', items };
}

async function buildDiscovery(): Promise<{ section: string; items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] }> {
  const items: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] = [];
  const { data: tags } = await supabase.from('tag').select('slug');
  (tags || []).forEach((t: any) => items.push({ loc: `${SITE_URL}/tag/${t.slug}`, changefreq: 'weekly', priority: 0.5 }));
  const { data: tvs } = await supabase.from('tv_channel').select('slug');
  (tvs || []).forEach((t: any) => items.push({ loc: `${SITE_URL}/tv/${t.slug}`, changefreq: 'weekly', priority: 0.5 }));
  return { section: 'discovery', items };
}

export async function generateSitemaps(outBaseDir?: string) {
  const dir = outBaseDir || OUT_DIR;
  await fs.mkdir(dir, { recursive: true });

  const sections = await Promise.all([
    buildHomeAndHubs(),
    buildEvents(),
    buildSport(),
    buildMovies(),
    buildCountdowns(),
    buildDiscovery(),
    buildStatic(),
  ]);

  // write section chunk files
  const indexEntries: { loc: string; lastmod?: string }[] = [];

  for (const sec of sections) {
    const chunks = chunkify(sec.items, CHUNK_SIZE);
    if (chunks.length === 0) {
      // still produce an empty chunk 00001 for consistency
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '</urlset>'
      ].join('\n');
      const file = path.join(dir, `sitemap-${sec.section}-00001.xml.gz`);
      await writeGzipFile(file, xml);
      indexEntries.push({ loc: `${SITE_URL}/sitemaps/${path.basename(file)}`, lastmod: isoRo() });
      continue;
    }
    for (let i = 0; i < chunks.length; i++) {
      const urls = chunks[i].map(u => urlXml(u.loc, u.lastmod, u.changefreq, u.priority)).join('\n');
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        urls,
        '</urlset>'
      ].join('\n');
      const chunkNo = String(i + 1).padStart(5, '0');
      const file = path.join(dir, `sitemap-${sec.section}-${chunkNo}.xml.gz`);
      await writeGzipFile(file, xml);
      const lastmod = chunks[i].map(c => c.lastmod).filter(Boolean).sort().slice(-1)[0] || isoRo();
      indexEntries.push({ loc: `${SITE_URL}/sitemaps/${path.basename(file)}`, lastmod });
    }
  }

  // sitemap index
  const indexXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...indexEntries.map(e => [
      '  <sitemap>',
      `    <loc>${e.loc}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : '',
      '  </sitemap>'
    ].filter(Boolean).join('\n')),
    '</sitemapindex>'
  ].join('\n');
  await fs.writeFile(path.resolve(process.cwd(), 'public', 'sitemap.xml'), indexXml, 'utf8');

  console.log(`Generated ${indexEntries.length} sitemap chunks at ${dir}`);
}
