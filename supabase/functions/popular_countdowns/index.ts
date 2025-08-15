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

    console.log(`Fetching popular countdowns with real images only - limit: ${limit}, offset: ${offset}, category: ${category}, timeStatus: ${timeStatus}`);

    // Build query using the database function instead of materialized view
    let baseQuery = supabase.rpc('get_popular_countdowns', {
      limit_count: limit + offset,
      offset_count: 0
    });

    const { data: allPopularEvents, error } = await baseQuery;

    if (error) {
      console.error('Error fetching popular countdowns:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter by category and time status if needed, and apply image filtering
    let filteredEvents = (allPopularEvents || []).filter(event => {
      // Always exclude past events from popular countdowns
      if (new Date(event.starts_at) < new Date()) return false;
      
      // Filter by category
      if (category && category !== 'all' && event.category_slug !== category) return false;
      
      // Filter by time status
      if (timeStatus && timeStatus !== 'all' && event.time_status !== timeStatus) return false;
      
      // Always filter only events with real images (not auto-generated)
      // Include events with image_credit indicating real sources
      if (!event.image_url || event.image_url === '') return false;
      if (event.image_credit && !['TMDB', 'TVMaze', 'Manual', 'Admin', 'Upload'].includes(event.image_credit)) {
        return false;
      }
      
      return true;
    });

    // Apply pagination
    const popularEvents = filteredEvents.slice(offset, offset + limit);

    let finalEvents = popularEvents || [];

    // If we don't have enough popular countdowns with real images, mix in other content with real images
    if (finalEvents.length < limit) {
      console.log('Mixing in additional content sources with real images only');

      // 1. First try user-created countdowns (approved) - only with real images
      const { data: userCountdowns } = await supabase
        .from('countdown')
        .select('*')
        .eq('status', 'APPROVED')
        .eq('privacy', 'PUBLIC')
        .gte('target_at', new Date().toISOString())
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('created_at', { ascending: false })
        .limit(3);

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

      // 2. Then add upcoming matches with TV coverage - only with real images
      const { data: liveMatches } = await supabase
        .from('match')
        .select('*')
        .gte('kickoff_at', new Date().toISOString())
        .lt('kickoff_at', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .not('tv_channels', 'is', null)
        .neq('tv_channels', '{}')
        .not('image_url', 'is', null)
        .neq('image_url', '')
        .order('kickoff_at', { ascending: true })
        .limit(3);

      if (liveMatches) {
        const transformedMatches = liveMatches.map(match => ({
          id: match.id,
          slug: match.slug,
          title: `${match.home} vs ${match.away}`,
          starts_at: match.kickoff_at,
          image_url: match.image_url, // Use the image URL from match if available
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

      // 3. Add upcoming movies in cinema - only with real TMDB images
      const { data: upcomingMovies } = await supabase
        .from('movie')
        .select('*')
        .gte('cinema_release_ro', new Date().toISOString().split('T')[0])
        .lt('cinema_release_ro', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .not('poster_url', 'is', null)
        .neq('poster_url', '')
        .order('cinema_release_ro', { ascending: true })
        .limit(2);

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

      // 4. Fallback to featured events only if still not enough
      if (finalEvents.length < limit) {
        console.log('Adding featured events as final fallback');
        
        let featuredQuery = supabase
          .from('event')
          .select(`
            id, slug, title, start_at, image_url, image_credit, city, country, category_id,
            category:category_id(name, slug)
          `)
          .eq('featured', true)
          .eq('status', 'PUBLISHED')
          .gte('start_at', new Date().toISOString())
          .not('image_url', 'is', null)
          .neq('image_url', '')
          .or('image_credit.eq.TMDB,image_credit.eq.TVMaze,image_credit.eq.Manual,image_credit.eq.Admin,image_credit.eq.Upload');

        const { data: featuredEvents } = await featuredQuery
          .order('start_at', { ascending: true })
          .limit(limit - finalEvents.length);

        if (featuredEvents && featuredEvents.length > 0) {
          const transformedFeatured = featuredEvents.map(event => ({
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
            source: 'featured_event'
          }));

          const existingIds = new Set(finalEvents.map(e => e.id));
          const newFeatured = transformedFeatured.filter(e => !existingIds.has(e.id));
          finalEvents = [...finalEvents, ...newFeatured];
        }
      }

      // Sort mixed results by date
      finalEvents.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
    }

    // Limit to requested amount and add source summary
    finalEvents = finalEvents.slice(0, limit);

    // Count sources for debugging
    const sourceCounts = finalEvents.reduce((acc, event) => {
      const source = event.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    console.log(`Returning ${finalEvents.length} popular countdowns from sources:`, sourceCounts);

    return new Response(
      JSON.stringify({
        events: finalEvents,
        total: finalEvents.length,
        limit,
        offset,
        has_more: finalEvents.length === limit
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