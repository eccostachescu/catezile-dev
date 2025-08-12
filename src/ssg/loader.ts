import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const SUPABASE_URL = "https://ibihfzhrsllndxhfwgvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false, storageKey: 'ssg' }});

const EventSchema = z.object({ slug: z.string(), title: z.string(), start_at: z.string().or(z.date()).nullable(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional(), seo_faq: z.any().nullable().optional(), image_url: z.string().nullable().optional(), city: z.string().nullable().optional(), status: z.string() });
const MatchSchema = z.object({ id: z.string().uuid(), home: z.string(), away: z.string(), kickoff_at: z.string().or(z.date()), tv_channels: z.array(z.string()).nullable().optional(), is_derby: z.boolean().nullable().optional(), status: z.string().nullable().optional(), score: z.any().nullable().optional(), stadium: z.string().nullable().optional(), city: z.string().nullable().optional(), round: z.string().nullable().optional(), competition_id: z.string().uuid().nullable().optional(), slug: z.string().nullable().optional(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional() });
const MovieSchema = z.object({ id: z.string().uuid(), tmdb_id: z.number().nullable().optional(), title: z.string(), original_title: z.string().nullable().optional(), overview: z.string().nullable().optional(), poster_url: z.string().nullable().optional(), backdrop_url: z.string().nullable().optional(), trailer_youtube_key: z.string().nullable().optional(), cinema_release_ro: z.string().nullable().optional(), netflix_date: z.string().nullable().optional(), prime_date: z.string().nullable().optional(), status: z.string().nullable().optional(), genres: z.array(z.string()).nullable().optional(), provider: z.any().nullable().optional(), slug: z.string().nullable().optional(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional() });
const CategorySchema = z.object({ slug: z.string(), name: z.string(), sort: z.number().nullable().optional() });

export async function loadEvent(slug: string) {
  // Base event
  const { data: ev } = await supabase
    .from('event')
    .select('id, slug, title, description, start_at, end_at, timezone, city, category_id, image_url, official_site, status, seo_title, seo_description, seo_h1, seo_faq, og_theme, updated_at')
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
  const today = now.toISOString().slice(0, 10);
  const y = now.getFullYear();

  // Featured events: try selected slugs, fallback to upcoming
  const featuredSlugs = [
    `black-friday-${y}`,
    `paste-${y}`,
    `craciun-${y}`,
    `bac-${y}`,
  ];
  const { data: featData } = await supabase
    .from('event')
    .select('*')
    .in('slug', featuredSlugs)
    .eq('status', 'PUBLISHED')
    .limit(4);
  let featured = (featData ?? []).map((e: any) => EventSchema.parse(e));
  if (featured.length < 4) {
    const { data: fallback } = await supabase
      .from('event')
      .select('*')
      .eq('status', 'PUBLISHED')
      .gte('start_at', now.toISOString())
      .order('start_at', { ascending: true })
      .limit(4);
    featured = (fallback ?? []).map((e: any) => EventSchema.parse(e));
  }

  // Next matches
  const { data: matches } = await supabase
    .from('match')
    .select('id,home,away,kickoff_at,tv_channels,is_derby,seo_title,seo_description,seo_h1')
    .gte('kickoff_at', now.toISOString())
    .order('kickoff_at', { ascending: true })
    .limit(6);

  // Upcoming movies
  const { data: upcomingMovies } = await supabase
    .from('movie')
    .select('id,title,poster_url,cinema_release_ro,netflix_date,seo_title,seo_description,seo_h1')
    .gte('cinema_release_ro', today)
    .order('cinema_release_ro', { ascending: true })
    .limit(6);

  // Sections
  const [sarbatori, examene, festivaluri] = await Promise.all([
    loadSectionByCategory('sarbatori'),
    loadSectionByCategory('examene'),
    loadSectionByCategory('festivaluri'),
  ]);

  // Black Friday hub
  const { data: bfEvent } = await supabase
    .from('event')
    .select('*')
    .eq('slug', `black-friday-${y}`)
    .maybeSingle();
  const bfHub = {
    event: bfEvent ? EventSchema.parse(bfEvent) : null,
    merchants: [
      { name: 'eMAG', url: 'https://www.emag.ro/' },
      { name: 'Altex', url: 'https://altex.ro/' },
      { name: 'PC Garage', url: 'https://www.pcgarage.ro/' },
      { name: 'evoMAG', url: 'https://www.evomag.ro/' },
    ],
  };

  // Trending fallback
  const { data: trendingData } = await supabase
    .from('event')
    .select('*')
    .eq('status', 'PUBLISHED')
    .gte('start_at', now.toISOString())
    .order('start_at', { ascending: true })
    .limit(8);
  const trending = (trendingData ?? []).map((e: any) => EventSchema.parse(e));

  return {
    featured: { events: featured },
    sport: { nextMatches: matches ?? [] },
    movies: { upcoming: upcomingMovies ?? [] },
    sections: { sarbatori, examene, festivaluri },
    bf: { hub: bfHub },
    trending,
  };
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

