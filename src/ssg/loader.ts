import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const SUPABASE_URL = "https://ibihfzhrsllndxhfwgvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'ssg' }, global: { headers: { 'X-Client-Info': 'ssg-loader' }}});


const EventSchema = z.object({ slug: z.string(), title: z.string(), start_at: z.string().or(z.date()).nullable(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional(), seo_faq: z.any().nullable().optional(), image_url: z.string().nullable().optional(), city: z.string().nullable().optional(), status: z.string() });
const MatchSchema = z.object({ id: z.string().uuid(), home: z.string(), away: z.string(), kickoff_at: z.string().or(z.date()), tv_channels: z.array(z.string()).nullable().optional(), is_derby: z.boolean().nullable().optional(), status: z.string().nullable().optional(), score: z.any().nullable().optional(), stadium: z.string().nullable().optional(), city: z.string().nullable().optional(), round: z.string().nullable().optional(), competition_id: z.string().uuid().nullable().optional(), slug: z.string().nullable().optional(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional() });
const MovieSchema = z.object({ id: z.string().uuid(), tmdb_id: z.number().nullable().optional(), title: z.string(), original_title: z.string().nullable().optional(), overview: z.string().nullable().optional(), poster_url: z.string().nullable().optional(), backdrop_url: z.string().nullable().optional(), trailer_youtube_key: z.string().nullable().optional(), cinema_release_ro: z.string().nullable().optional(), netflix_date: z.string().nullable().optional(), prime_date: z.string().nullable().optional(), status: z.string().nullable().optional(), genres: z.array(z.string()).nullable().optional(), provider: z.any().nullable().optional(), slug: z.string().nullable().optional(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional() });
const CategorySchema = z.object({ slug: z.string(), name: z.string(), sort: z.number().nullable().optional() });

export async function loadEvent(slug: string) {
  // Base event
  const { data: ev } = await supabase
    .from('event')
    .select('id, slug, title, description, start_at, end_at, timezone, city, category_id, image_url, official_site, status, seo_title, seo_description, seo_h1, seo_faq, og_theme, updated_at, official_source_url, verified_at, editorial_status')
    .eq('slug', slug)
    .eq('status','PUBLISHED')
    .maybeSingle();
  if (!ev) return null;

  // Offers (event_offer -> affiliate_link)
  const { data: offerLinks } = await supabase
    .from('event_offer')
    .select('affiliate_link_id')
    .eq('event_id', ev.id);
  let offers: Array<{ id: string; partner: string; url: string }> = [];
  if (offerLinks && offerLinks.length) {
    const ids = offerLinks.map((o: any) => o.affiliate_link_id);
    const { data: affiliates } = await supabase
      .from('affiliate_link')
      .select('id, partner, url')
      .in('id', ids)
      .eq('active', true);
    offers = (affiliates ?? []) as any;
  }

  // Breadcrumbs: Category -> Event
  let breadcrumbs: Array<{ label: string; url: string }> = [];
  if (ev.category_id) {
    const { data: cat } = await supabase
      .from('category')
      .select('name, slug')
      .eq('id', ev.category_id)
      .maybeSingle();
    if (cat) {
      breadcrumbs = [
        { label: cat.name, url: `/categorii/${cat.slug}` },
        { label: ev.title, url: `/evenimente/${ev.slug}` },
      ];
    }
  }

  // Compute temporal state relative to Europe/Bucharest
  const now = new Date();
  const start = ev.start_at ? new Date(ev.start_at).getTime() : 0;
  const end = ev.end_at ? new Date(ev.end_at).getTime() : start;
  const sameDay = (a: Date, b: Date) => {
    const fmt = new Intl.DateTimeFormat('ro-RO', { timeZone: ev.timezone || 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit' });
    return fmt.format(a) === fmt.format(b);
  };
  let state: 'upcoming'|'today'|'ongoing'|'past' = 'upcoming';
  if (now.getTime() > end) state = 'past';
  else if (now.getTime() >= start && now.getTime() <= end) state = 'ongoing';
  else if (sameDay(now, new Date(start))) state = 'today';
  else state = 'upcoming';

  return { ...ev, offers, breadcrumbs, state } as const;
}

export async function loadMatch(id: string) {
  const { data, error } = await supabase
    .from('match')
    .select('id, home, away, kickoff_at, stadium, city, round, competition_id, status, score, tv_channels, is_derby, slug, seo_title, seo_description, seo_h1')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;

  // Offers: match_offer -> affiliate_link (active)
  const { data: mOffers } = await supabase
    .from('match_offer')
    .select('affiliate_link_id')
    .eq('match_id', id);
  let offers: Array<{ id: string; partner: string; url: string }> = [];
  if (mOffers && mOffers.length) {
    const ids = mOffers.map((o: any) => o.affiliate_link_id);
    const { data: affiliates } = await supabase
      .from('affiliate_link')
      .select('id, partner, url')
      .in('id', ids)
      .eq('active', true);
    offers = (affiliates ?? []) as any;
  }

  const match = MatchSchema.parse(data);
  return { ...match, offers } as const;
}

export async function loadMovie(id: string) {
  const { data, error } = await supabase
    .from('movie')
    .select('id, tmdb_id, title, original_title, overview, poster_url, backdrop_url, trailer_youtube_key, cinema_release_ro, netflix_date, prime_date, status, genres, provider, slug, seo_title, seo_description, seo_h1')
    .eq('id', id)
    .maybeSingle();
  if (error || !data) return null;
  return MovieSchema.parse(data);
}

export async function loadMovies(params: { month?: number; year?: number; genre?: string; status?: 'SCHEDULED'|'RELEASED' } = {}) {
  const { month, year, genre, status } = params;
  let q = supabase
    .from('movie')
    .select('id, tmdb_id, title, poster_url, cinema_release_ro, netflix_date, prime_date, status, genres, provider')
    .order('cinema_release_ro', { ascending: true })
    .limit(48);

  if (status) q = q.eq('status', status);
  if (genre) q = q.contains('genres', [genre]);
  if (year) q = q.gte('cinema_release_ro', `${year}-01-01`).lte('cinema_release_ro', `${year}-12-31`);
  if (month && year) {
    const mm = String(month).padStart(2, '0');
    const next = month === 12 ? `${year+1}-01-01` : `${year}-${String(month+1).padStart(2,'0')}-01`;
    q = q.gte('cinema_release_ro', `${year}-${mm}-01`).lt('cinema_release_ro', next);
  }

  const { data: items } = await q;

  const today = new Date().toISOString().slice(0,10);
  const rangePast = new Date(Date.now() - 45*24*3600*1000).toISOString().slice(0,10);

  const [upcomingCinema, nowInCinema, streamingSoon, streamingAvailable] = await Promise.all([
    supabase.from('movie').select('id,title,poster_url,cinema_release_ro,status').gte('cinema_release_ro', today).order('cinema_release_ro', { ascending: true }).limit(12),
    supabase.from('movie').select('id,title,poster_url,cinema_release_ro,status').gte('cinema_release_ro', rangePast).lte('cinema_release_ro', today).order('cinema_release_ro', { ascending: false }).limit(12),
    supabase.from('movie').select('id,title,poster_url,netflix_date,prime_date,status').or(`netflix_date.gte.${today},prime_date.gte.${today}`).order('netflix_date', { ascending: true, nullsFirst: false }).limit(12),
    supabase.from('movie').select('id,title,poster_url,provider,status').or(`provider->netflix->>available.eq.true,provider->prime->>available.eq.true`).limit(12),
  ]);

  return {
    items: items ?? [],
    sections: {
      upcomingCinema: upcomingCinema.data ?? [],
      nowInCinema: nowInCinema.data ?? [],
      streamingSoon: streamingSoon.data ?? [],
      streamingAvailable: streamingAvailable.data ?? [],
    }
  } as const;
}

export async function loadCategory(slug: string) {
  const { data, error } = await supabase.from('category').select('*').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return CategorySchema.parse(data);
}

export async function loadCategoryHub(slug: string, opts: { year?: number } = {}) {
  const cat = await loadCategory(slug);
  if (!cat) return null as any;
  const catId = await getCategoryId(slug);
  const year = opts.year || new Date().getFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1)).toISOString();
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();

  // Featured slugs per category
  const featuredBySlug = (y: number) => {
    if (slug === 'sarbatori') return [`paste-${y}`, `craciun-${y}`, `anul-nou-${y}`, `ziua-nationala-a-romaniei-${y}`];
    if (slug === 'examene') return [`bac-${y}`, `evaluare-nationala-${y}`];
    if (slug === 'festivaluri') return [`untold-${y}`, `electric-castle-${y}`];
    return [] as string[];
  };

  const now = new Date().toISOString();
  const in90 = new Date(Date.now() + 90*24*3600*1000).toISOString();

  const [featuredQ, upcomingQ, byYearQ, sourcesQ] = await Promise.all([
    supabase.from('event').select('slug,title,start_at,seo_title,seo_description,seo_h1,image_url,city,status').eq('status','PUBLISHED').eq('category_id', catId).in('slug', featuredBySlug(year)).limit(8),
    supabase.from('event').select('slug,title,start_at,seo_title,seo_description,seo_h1,image_url,city,status').eq('status','PUBLISHED').eq('category_id', catId).gte('start_at', now).lte('start_at', in90).order('start_at', { ascending: true }).limit(16),
    supabase.from('event').select('slug,title,start_at,seo_title,seo_description,seo_h1,image_url,city,status').eq('status','PUBLISHED').eq('category_id', catId).gte('start_at', startOfYear).lte('start_at', endOfYear).order('start_at', { ascending: true }).limit(60),
    supabase.from('event').select('official_source_url, verified_at, updated_at').eq('status','PUBLISHED').eq('category_id', catId).gte('start_at', startOfYear).lte('start_at', endOfYear),
  ]);

  const faqDefaults: Record<string, Array<{ q: string; a: string }>> = {
    sarbatori: [
      { q: `Când pică Paștele în ${year}?`, a: 'Vezi mai sus cele mai importante sărbători și datele exacte.' },
      { q: 'Zile libere legale', a: `Consultă lista pentru ${year} și planifică-ți vacanțele.` },
    ],
    examene: [
      { q: `Calendar Bacalaureat ${year}`, a: 'Perioadele de înscriere, probele și afișarea rezultatelor.' },
      { q: `Evaluare Națională ${year}`, a: 'Datele probelor scrise și rezultatele.' },
    ],
    festivaluri: [
      { q: 'Bilete și program', a: 'Linkuri către organizatori și ghiduri utile.' },
    ],
  };

  // Sources distinct
  const sourcesSet = new Map<string, string>();
  (sourcesQ.data ?? []).forEach((r: any) => { if (r.official_source_url) sourcesSet.set(r.official_source_url, r.verified_at || r.updated_at); });
  const sources = Array.from(sourcesSet.entries()).map(([url, last]) => ({ url, lastVerified: last }));

  const hub = {
    category: { slug: cat.slug, name: cat.name },
    featured: (featuredQ.data ?? []).map((e: any) => EventSchema.parse(e)),
    upcoming: (upcomingQ.data ?? []).map((e: any) => EventSchema.parse(e)),
    byYear: (byYearQ.data ?? []).map((e: any) => EventSchema.parse(e)),
    faq: faqDefaults[slug] || [],
    sources,
    year,
  } as const;

  return hub;
}


async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase.from('category').select('id').eq('slug', slug).maybeSingle();
  return data?.id ?? null;
}

async function loadSectionByCategory(slug: string, daysAhead = 90) {
  const catId = await getCategoryId(slug);
  if (!catId) return [] as Array<z.infer<typeof EventSchema>>;
  const now = new Date();
  const until = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  const { data } = await supabase
    .from('event')
    .select('*')
    .eq('category_id', catId)
    .gte('start_at', now.toISOString())
    .lte('start_at', until.toISOString())
    .order('start_at', { ascending: true })
    .limit(8);
  return (data ?? []).map((e: any) => EventSchema.parse(e));
}

export async function loadHome() {
  const now = new Date();
  const tz = 'Europe/Bucharest';
  const nowIso = now.toISOString();

  // Settings
  const { data: settingsRows } = await supabase.from('settings').select('key,value').in('key', ['home_hero','home_sections_order','home_trending_limit','home_tv_window_min']);
  const settingsMap = Object.fromEntries((settingsRows || []).map((r: any) => [r.key, r.value]));
  const heroOverride = settingsMap['home_hero'] as any;
  const trendingLimit = Number(settingsMap['home_trending_limit'] ?? 8);
  const tvWindowMin = Number(settingsMap['home_tv_window_min'] ?? 90);

  // BF merchants (simple list from bf_merchant)
  const { data: bfMerchants } = await supabase.from('bf_merchant').select('id,name,slug,affiliate_link_id').limit(3);

  // Derby within 72h
  const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();
  const { data: derbyCandidates } = await supabase
    .from('match')
    .select('id,home,away,kickoff_at,tv_channels,status,score,slug,is_derby')
    .eq('is_derby', true)
    .gte('kickoff_at', nowIso)
    .lte('kickoff_at', in72h)
    .order('kickoff_at', { ascending: true })
    .limit(1);

  // Today window (approx UTC today) and TV now window
  const startToday = new Date(); startToday.setUTCHours(0,0,0,0);
  const endToday = new Date(); endToday.setUTCHours(23,59,59,999);
  const tvUntil = new Date(now.getTime() + tvWindowMin * 60 * 1000).toISOString();

  // Trending 24h via `trending` + hydrate via search_index
  const { data: trendingRows } = await supabase
    .from('trending')
    .select('kind, entity_id, reasons, score, updated_at')
    .order('updated_at', { ascending: false })
    .limit(trendingLimit);
  const trendingIds = (trendingRows || []).map((t: any) => t.entity_id);
  const { data: trendingMeta } = await supabase
    .from('search_index')
    .select('entity_id, kind, id, title, subtitle, slug, when_at, tv')
    .in('entity_id', trendingIds);
  const trendingMap = new Map<string, any>((trendingMeta || []).map((x: any) => [x.entity_id, x]));
  const trending = (trendingRows || []).map((t: any) => {
    const m = trendingMap.get(t.entity_id) || {};
    return {
      kind: m.kind || t.kind,
      id: m.id || t.entity_id,
      title: m.title,
      subtitle: m.subtitle,
      slug: m.slug,
      when_at: m.when_at,
      score: t.score,
      reasons: t.reasons || {},
    };
  }).filter(x => x.title);

  // Today (mix from search_index happening today)
  const { data: todayRows } = await supabase
    .from('search_index')
    .select('kind,id,title,slug,when_at,tv,category_slug')
    .gte('when_at', startToday.toISOString())
    .lte('when_at', endToday.toISOString())
    .order('when_at', { ascending: true })
    .limit(12);
  const today = (todayRows || []).map((x: any) => ({
    kind: x.kind, id: x.id, title: x.title, slug: x.slug, when_at: x.when_at, tv_channels: x.tv || null,
  }));

  // TV now (LIVE or within next N minutes)
  const { data: tvNowRows } = await supabase
    .from('match')
    .select('id,home,away,kickoff_at,tv_channels,status,score,slug')
    .or(`status.eq.LIVE,and(kickoff_at.gte.${nowIso},kickoff_at.lte.${tvUntil})`)
    .order('kickoff_at', { ascending: true })
    .limit(6);
  const tv_now = (tvNowRows || []).map((m: any) => ({
    id: m.id, home: m.home, away: m.away, kickoff_at: m.kickoff_at, tv_channels: m.tv_channels, status: m.status, minute: (m.score && (m.score.minute || m.score.min)) || null, slug: m.slug || m.id,
  }));

  // Upcoming
  const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0,10);
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth()+1, 1)).toISOString().slice(0,10);
  const plus30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const plus90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const [sportQ, moviesQ, eventsQ] = await Promise.all([
    supabase.from('match').select('id,home,away,kickoff_at,tv_channels,slug').gte('kickoff_at', nowIso).lte('kickoff_at', in7d).order('kickoff_at', { ascending: true }).limit(20),
    supabase.from('movie').select('id,title,poster_url,cinema_release_ro,slug').gte('cinema_release_ro', monthStart).lt('cinema_release_ro', nextMonthStart).order('cinema_release_ro', { ascending: true }).limit(20),
    supabase.from('event').select('id,slug,title,start_at,city').eq('status','PUBLISHED').gte('start_at', plus30).lte('start_at', plus90).order('start_at', { ascending: true }).limit(20),
  ]);

  // Discovery
  const [tagsQ, tvQ] = await Promise.all([
    supabase.from('tag').select('slug,name').limit(12),
    supabase.from('tv_channel').select('slug,name').limit(12),
  ]);
  const discovery = {
    tags: tagsQ.data || [],
    teams: [
      { slug: 'fcsb', name: 'FCSB' },
      { slug: 'dinamo-bucuresti', name: 'Dinamo' },
      { slug: 'cfr-cluj', name: 'CFR Cluj' },
      { slug: 'rapid-bucuresti', name: 'Rapid' },
    ],
    tv: tvQ.data || [],
  };

  // Hero selection
  const month = now.getUTCMonth() + 1;
  let hero: any = { kind: 'today', payload: { highlights: today.slice(0,3) } };
  const bfEligible = (month === 11) || (heroOverride === 'bf');
  if (bfEligible && (bfMerchants && bfMerchants.length > 0)) {
    hero = { kind: 'bf', payload: { merchants: bfMerchants } };
  } else if ((heroOverride === 'derby') || (derbyCandidates && derbyCandidates.length > 0)) {
    const d = derbyCandidates?.[0];
    if (d) hero = { kind: 'derby', payload: d };
  }

  // BF Top Offers (for homepage band) when active
  const bfActive = bfEligible || (settingsMap['bf_enabled'] === true) || (hero.kind === 'bf');
  let bf_top_offers: Array<any> = [];
  if (bfActive) {
    const { data: bfOffers } = await supabase
      .from('bf_offer')
      .select('id,title,subtitle,price,price_old,discount_percent,image_url,affiliate_link_id,product_url,merchant_id')
      .eq('status','LIVE')
      .order('score', { ascending: false })
      .limit(10);
    const mids = Array.from(new Set((bfOffers||[]).map((o: any)=>o.merchant_id))).filter(Boolean);
    const { data: merchants } = await supabase.from('bf_merchant').select('id,name,slug,logo_url').in('id', mids);
    const mMap = new Map<string, any>((merchants||[]).map((m:any)=>[m.id, m] as const));
    bf_top_offers = (bfOffers||[]).map((o:any)=>({
      id: o.id,
      title: o.title,
      subtitle: o.subtitle,
      price: o.price,
      price_old: o.price_old,
      discount_percent: o.discount_percent,
      image_url: o.image_url,
      href: o.affiliate_link_id ? `/out/${o.affiliate_link_id}` : (o.product_url || '#'),
      merchant: mMap.get(o.merchant_id) || null,
    }));
  }

  return {
    nowIso,
    tz,
    hero,
    trending,
    today,
    tv_now,
    upcoming: {
      sport: sportQ.data || [],
      movies: moviesQ.data || [],
      events: eventsQ.data || [],
    },
    discovery,
    sections_order: Array.isArray(settingsMap['home_sections_order']) ? settingsMap['home_sections_order'] : undefined,
    bf_top_offers,
  } as const;
}

// Countdown loader (public-approved only for SSG)
export async function loadCountdown(id: string) {
  const { data } = await supabase
    .from('countdown')
    .select('id, slug, title, target_at, privacy, status, owner_id, theme, image_url, city, seo_title, seo_description, seo_h1')
    .eq('id', id)
    .eq('status', 'APPROVED')
    .eq('privacy', 'PUBLIC')
    .maybeSingle();
  if (!data) return null;
  return data;
}

// Related events: same category in ±90 days (excludes current)
export async function loadRelated(eventId: string, categoryId: string | null) {
  if (!categoryId) return [] as any[];
  // Get anchor date
  const { data: anchor } = await supabase
    .from('event')
    .select('start_at')
    .eq('id', eventId)
    .maybeSingle();
  if (!anchor?.start_at) return [] as any[];
  const startAt = new Date(anchor.start_at);
  const minus = new Date(startAt.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const plus = new Date(startAt.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('event')
    .select('id,slug,title,start_at,seo_title,seo_description,seo_h1,image_url,city,status')
    .eq('status','PUBLISHED')
    .eq('category_id', categoryId)
    .neq('id', eventId)
    .gte('start_at', minus)
    .lte('start_at', plus)
    .order('start_at', { ascending: true })
    .limit(6);
  return data ?? [];
}

// Sport list grouped by days with filters
export async function loadSportList({ days = 10 }: { days?: number } = {}) {
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const { data } = await supabase
    .from('match')
    .select('id, home, away, kickoff_at, tv_channels, is_derby, status, score')
    .gte('kickoff_at', now.toISOString())
    .lte('kickoff_at', until.toISOString())
    .order('kickoff_at', { ascending: true });
  const matches = (data ?? []) as Array<any>;

  // Group by Bucharest local date
  const fmt = new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', year: 'numeric', month: '2-digit', day: '2-digit' });
  const groups: Record<string, any[]> = {};
  const teamCount: Record<string, number> = {};
  const tvSet = new Set<string>();

  for (const m of matches) {
    const key = fmt.format(new Date(m.kickoff_at));
    groups[key] = groups[key] || [];
    groups[key].push(m);
    // teams
    teamCount[m.home] = (teamCount[m.home] ?? 0) + 1;
    teamCount[m.away] = (teamCount[m.away] ?? 0) + 1;
    // tv
    (m.tv_channels ?? []).forEach((t: string) => tvSet.add(t));
  }

  const daysOut = Object.keys(groups)
    .sort((a,b) => new Date(a).getTime() - new Date(b).getTime())
    .map((date) => ({ date, matches: groups[date] }));

  const teams = Object.entries(teamCount)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name]) => name);

  const tv = Array.from(tvSet.values()).sort();

  return { days: daysOut, filters: { teams, tv } } as const;
}

