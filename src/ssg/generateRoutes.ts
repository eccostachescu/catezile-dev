import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://ibihfzhrsllndxhfwgvb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaWhmemhyc2xsbmR4aGZ3Z3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzAyNTAsImV4cCI6MjA3MDUwNjI1MH0.Zqikiwqpgb4lksNXcAdLA3fQzZwfV4WwFYzxpAwxCoU";

export async function generateRoutes() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { 'X-Client-Info': 'ssg-route-gen' } },
  });

  const routes = new Set<string>();
  routes.add('/');
  routes.add('/black-friday');
  routes.add('/filme');

  const { data: cats } = await supabase.from('category').select('slug').order('sort', { ascending: true }).limit(2000);
  cats?.forEach((c: any) => routes.add(`/categorii/${c.slug}`));

  const { data: events } = await supabase.from('event').select('slug,status').eq('status', 'PUBLISHED').order('start_at', { ascending: false }).limit(5000);
  events?.forEach((e: any) => routes.add(`/evenimente/${e.slug}`));

  const { data: matches } = await supabase.from('match').select('id').order('kickoff_at', { ascending: false }).limit(5000);
  matches?.forEach((m: any) => routes.add(`/sport/${m.id}`));

  const { data: movies } = await supabase.from('movie').select('id').order('cinema_release_ro', { ascending: false, nullsFirst: false }).limit(5000);
  movies?.forEach((m: any) => routes.add(`/filme/${m.id}`));

  // Discovery pages
  const { data: tags } = await supabase.from('tag').select('slug').limit(2000);
  tags?.forEach((t: any) => routes.add(`/tag/${t.slug}`));
  const { data: channels } = await supabase.from('tv_channel').select('slug').limit(2000);
  channels?.forEach((c: any) => routes.add(`/tv/${c.slug}`));

  return Array.from(routes);
}
