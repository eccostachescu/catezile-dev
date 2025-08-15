import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Read from both URL params and request body
    let requestData = {};
    if (req.method === 'POST') {
      try {
        requestData = await req.json();
      } catch (e) {
        requestData = {};
      }
    }
    
    const limit = parseInt(requestData.limit || url.searchParams.get('limit') || '12');
    const offset = parseInt(requestData.offset || url.searchParams.get('offset') || '0');
    const category = requestData.category || url.searchParams.get('category');
    const timeStatus = requestData.time_status || url.searchParams.get('time_status');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    console.log(`Fetching popular countdowns from all sources with images - limit: ${limit}, offset: ${offset}`);

    let finalEvents = [];

    // 1. Get approved user countdowns with images
    const { data: userCountdowns } = await supabase
      .from('countdown')
      .select('*')
      .eq('status', 'APPROVED')
      .eq('privacy', 'PUBLIC')
      .gte('target_at', new Date().toISOString())
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .order('created_at', { ascending: false })
      .limit(5);

    if (userCountdowns) {
      const transformedCountdowns = userCountdowns.map(countdown => ({
        id: countdown.id,
        slug: countdown.slug,
        title: countdown.title,
        starts_at: countdown.target_at,
        image_url: countdown.image_url,
        city: countdown.city,
        country: 'RO',
        category_id: null,
        category_name: 'Countdown',
        category_slug: 'countdown',
        score: 0,
        time_status: 'FUTURE',
        source: 'user_countdown'
      }));

      finalEvents = [...finalEvents, ...transformedCountdowns];
    }

    // 2. Get upcoming matches with TV coverage and images
    const { data: liveMatches } = await supabase
      .from('match')
      .select('*')
      .gte('kickoff_at', new Date().toISOString())
      .lt('kickoff_at', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
      .not('tv_channels', 'is', null)
      .neq('tv_channels', '{}')
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .order('kickoff_at', { ascending: true })
      .limit(8);

    if (liveMatches) {
      const transformedMatches = liveMatches.map(match => ({
        id: match.id,
        slug: match.slug,
        title: `${match.home} vs ${match.away}`,
        starts_at: match.kickoff_at,
        image_url: match.image_url,
        city: match.city,
        country: 'RO',
        category_id: null,
        category_name: 'Sport',
        category_slug: 'sport',
        score: 0,
        time_status: 'UPCOMING',
        source: 'match_api'
      }));

      finalEvents = [...finalEvents, ...transformedMatches];
    }

    // 3. Get upcoming movies with posters
    const { data: upcomingMovies } = await supabase
      .from('movie')
      .select('*')
      .gte('cinema_release_ro', new Date().toISOString().split('T')[0])
      .lt('cinema_release_ro', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .not('poster_url', 'is', null)
      .neq('poster_url', '')
      .order('cinema_release_ro', { ascending: true })
      .limit(5);

    if (upcomingMovies) {
      const transformedMovies = upcomingMovies.map(movie => ({
        id: movie.id,
        slug: movie.slug,
        title: movie.title,
        starts_at: movie.cinema_release_ro + 'T00:00:00Z',
        image_url: movie.poster_url,
        city: null,
        country: 'RO',
        category_id: null,
        category_name: 'Filme',
        category_slug: 'filme',
        score: 0,
        time_status: 'UPCOMING',
        source: 'movie_api'
      }));

      finalEvents = [...finalEvents, ...transformedMovies];
    }

    // 4. Get published events with images (TV shows, holidays, etc.)
    const { data: publishedEvents } = await supabase
      .from('event')
      .select(`
        id, slug, title, start_at, image_url, image_credit, city, country, category_id,
        category:category_id(name, slug)
      `)
      .eq('status', 'PUBLISHED')
      .gte('start_at', new Date().toISOString())
      .not('image_url', 'is', null)
      .neq('image_url', '')
      .order('start_at', { ascending: true })
      .limit(8);

    if (publishedEvents && publishedEvents.length > 0) {
      const transformedEvents = publishedEvents.map(event => ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        starts_at: event.start_at,
        image_url: event.image_url,
        city: event.city,
        country: event.country,
        category_id: event.category_id,
        category_name: event.category?.name || null,
        category_slug: event.category?.slug || null,
        score: 0,
        time_status: event.start_at <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() ? 'UPCOMING' : 'FUTURE',
        source: 'published_event'
      }));

      finalEvents = [...finalEvents, ...transformedEvents];
    }

    // 5. Get events from database function with images
    const { data: dbEvents } = await supabase.rpc('get_popular_countdowns', {
      limit_count: 10,
      offset_count: 0
    });

    if (dbEvents && dbEvents.length > 0) {
      const filteredDbEvents = dbEvents.filter(event => {
        if (new Date(event.starts_at) < new Date()) return false;
        return event.image_url && event.image_url !== '';
      }).map(event => ({
        ...event,
        source: 'popular_events'
      }));
      
      finalEvents = [...finalEvents, ...filteredDbEvents];
    }

    // Remove duplicates and apply filters
    const existingIds = new Set();
    finalEvents = finalEvents.filter(event => {
      if (existingIds.has(event.id)) return false;
      existingIds.add(event.id);
      
      // Apply category filter if specified
      if (category && category !== 'all' && event.category_slug !== category) return false;
      
      // Apply time status filter if specified  
      if (timeStatus && timeStatus !== 'all' && event.time_status !== timeStatus) return false;
      
      return true;
    });

    // Sort by start date for better UX
    finalEvents.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    // Apply pagination
    const paginatedEvents = finalEvents.slice(offset, offset + limit);

    // Count sources for debugging
    const sourceCounts = paginatedEvents.reduce((acc, event) => {
      const source = event.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    console.log(`Returning ${paginatedEvents.length} popular countdowns from sources:`, sourceCounts);

    return new Response(
      JSON.stringify({
        events: paginatedEvents,
        total: finalEvents.length,
        limit,
        offset,
        has_more: (offset + limit) < finalEvents.length
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
        } 
      }
    );

  } catch (error: any) {
    console.error('Popular countdowns error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});