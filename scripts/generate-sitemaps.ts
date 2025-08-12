import path from 'path';
import { promises as fs } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ibihfzhrsllndxhfwgvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('category').select('id').eq('slug', slug).maybeSingle();
  return data?.id ?? null;
}

function fmtDate(d: string | Date) {
  const iso = typeof d === 'string' ? d : d.toISOString();
  return iso.replace(/\.\d{3}Z$/, 'Z');
}

function urlXml(loc: string, lastmod?: string, changefreq: string = 'weekly', priority?: number) {
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

async function buildCategorySitemap(slug: string, outDir: string) {
  const baseUrl = 'https://catezile.ro';
  const catId = await getCategoryId(slug);
  if (!catId) return;

  const now = new Date();
  const past = new Date(now);
  past.setMonth(now.getMonth() - 18);
  const future = new Date(now);
  future.setMonth(now.getMonth() + 18);

  const { data: events } = await supabase
    .from('event')
    .select('slug, updated_at, verified_at, start_at')
    .eq('status','PUBLISHED')
    .eq('category_id', catId)
    .gte('start_at', past.toISOString())
    .lte('start_at', future.toISOString());

  const eventUrls = (events ?? []).map((e: any) => {
    const lm = e.verified_at || e.updated_at || e.start_at || now.toISOString();
    return { loc: `${baseUrl}/evenimente/${e.slug}`, lastmod: fmtDate(new Date(lm)) };
  });

  const hubLoc = `${baseUrl}/categorii/${slug}`;
  const hubLastmod = fmtDate(eventUrls.reduce((acc, u) => (new Date(u.lastmod) > new Date(acc) ? u.lastmod : acc), fmtDate(now)));

  const urls = [
    urlXml(hubLoc, hubLastmod, 'weekly', 0.9),
    ...eventUrls.map(u => urlXml(u.loc, u.lastmod, 'weekly', 0.7)),
  ].join('\n');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>'
  ].join('\n');

  const targetDir = outDir;
  await fs.mkdir(targetDir, { recursive: true });
  const targetPath = path.join(targetDir, `sitemap-${slug}.xml`);
  await fs.writeFile(targetPath, xml, 'utf8');
}

export async function generateSitemaps(outBaseDir?: string) {
  const publicDir = outBaseDir || path.resolve(__dirname, '..', 'public', 'sitemaps');
  await Promise.all([
    buildCategorySitemap('sarbatori', publicDir),
    buildCategorySitemap('examene', publicDir),
    buildCategorySitemap('festivaluri', publicDir),
  ]);
}

