import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const SUPABASE_URL = "https://ibihfzhrsllndxhfwgvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false }});

const EventSchema = z.object({ slug: z.string(), title: z.string(), start_at: z.string().or(z.date()).nullable(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional(), seo_faq: z.any().nullable().optional(), image_url: z.string().nullable().optional(), city: z.string().nullable().optional(), status: z.string() });
const MatchSchema = z.object({ id: z.string().uuid(), home: z.string(), away: z.string(), kickoff_at: z.string().or(z.date()), tv_channels: z.array(z.string()).nullable().optional(), is_derby: z.boolean().nullable().optional(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional() });
const MovieSchema = z.object({ id: z.string().uuid(), title: z.string(), poster_url: z.string().nullable().optional(), cinema_release_ro: z.string().nullable().optional(), netflix_date: z.string().nullable().optional(), seo_title: z.string().nullable().optional(), seo_description: z.string().nullable().optional(), seo_h1: z.string().nullable().optional() });
const CategorySchema = z.object({ slug: z.string(), name: z.string(), sort: z.number().nullable().optional() });

export async function loadEvent(slug: string) {
  const { data, error } = await supabase.from('event').select('*').eq('slug', slug).eq('status','PUBLISHED').maybeSingle();
  if (error || !data) return null;
  return EventSchema.parse(data);
}

export async function loadMatch(id: string) {
  const { data, error } = await supabase.from('match').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return MatchSchema.parse(data);
}

export async function loadMovie(id: string) {
  const { data, error } = await supabase.from('movie').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return MovieSchema.parse(data);
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
