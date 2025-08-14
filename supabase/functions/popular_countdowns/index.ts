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
    const onlyWithImage = requestData.onlyWithImage || url.searchParams.get('onlyWithImage') === 'true';

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    console.log(`Fetching popular countdowns - limit: ${limit}, offset: ${offset}, category: ${category}, timeStatus: ${timeStatus}, onlyWithImage: ${onlyWithImage}`);

    // Build query
    let query = supabase
      .from('popular_countdowns_mv')
      .select('*');

    // Add filters
    if (category && category !== 'all') {
      query = query.eq('category_slug', category);
    }

    if (timeStatus && timeStatus !== 'all') {
      query = query.eq('time_status', timeStatus);
    }

    // Filter only events with images if requested
    if (onlyWithImage) {
      query = query.not('image_url', 'is', null).neq('image_url', '');
    }

    // Add pagination and ordering
    const { data: popularEvents, error } = await query
      .order('score', { ascending: false })
      .order('starts_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching popular countdowns:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let finalEvents = popularEvents || [];

    // Fallback to featured events if we have less than 6 items
    if (finalEvents.length < 6) {
      console.log('Adding featured events as fallback');
      
      let featuredQuery = supabase
        .from('event')
        .select(`
          id, slug, title, start_at, image_url, city, country, category_id,
          category:category_id(name, slug)
        `)
        .eq('featured', true)
        .eq('status', 'PUBLISHED')
        .gte('start_at', new Date().toISOString());

      // Temporarily disable image filter for featured events too
      // if (onlyWithImage) {
      //   featuredQuery = featuredQuery.not('image_url', 'is', null);
      // }

      const { data: featuredEvents } = await featuredQuery
        .order('start_at', { ascending: true })
        .limit(12 - finalEvents.length);

      if (featuredEvents && featuredEvents.length > 0) {
        // Transform featured events to match popular format
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
          time_status: event.start_at <= new Date().toISOString() ? 'PAST' :
                      event.start_at <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() ? 'UPCOMING' : 'FUTURE'
        }));

        // Merge and deduplicate
        const existingIds = new Set(finalEvents.map(e => e.id));
        const newFeatured = transformedFeatured.filter(e => !existingIds.has(e.id));
        finalEvents = [...finalEvents, ...newFeatured];
      }
    }

    // Limit to requested amount
    finalEvents = finalEvents.slice(0, limit);

    console.log(`Returning ${finalEvents.length} popular countdowns`);

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