import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const filter = url.searchParams.get('filter') || 'all'; // all, today, week

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from('v_tv_episodes_upcoming')
      .select('*')
      .order('airstamp', { ascending: true });

    // Apply time filters
    const now = new Date();
    if (filter === 'today') {
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('airstamp', endOfDay.toISOString());
    } else if (filter === 'week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      query = query.lte('airstamp', nextWeek.toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: episodes, error } = await query;

    if (error) {
      console.error('Error fetching upcoming episodes:', error);
      throw error;
    }

    console.log(`Returning ${episodes?.length || 0} upcoming TV episodes`);

    return new Response(
      JSON.stringify({ 
        episodes: episodes || [],
        total: episodes?.length || 0,
        limit,
        offset,
        filter
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
        } 
      }
    );

  } catch (error) {
    console.error('Error in tv_episodes_upcoming:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch upcoming TV episodes', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});