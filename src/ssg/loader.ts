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
  const { data, error } = await supabase.from('event').select('*').eq('slug', slug).eq('status','PUBLISHED').single();
  if (error || !data) return null;
  return EventSchema.parse(data);
}

export async function loadMatch(id: string) {
  const { data, error } = await supabase.from('match').select('*').eq('id', id).single();
  if (error || !data) return null;
  return MatchSchema.parse(data);
}

export async function loadMovie(id: string) {
  const { data, error } = await supabase.from('movie').select('*').eq('id', id).single();
  if (error || !data) return null;
  return MovieSchema.parse(data);
}

export async function loadCategory(slug: string) {
  const { data, error } = await supabase.from('category').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return CategorySchema.parse(data);
}
