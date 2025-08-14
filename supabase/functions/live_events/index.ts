import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    console.log('Fetching live events...')

    // Mock live events for now
    const mockLiveEvents = [
      {
        id: '1',
        title: 'Real Madrid vs Barcelona',
        slug: 'real-madrid-vs-barcelona',
        start_date: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
        location: 'Madrid',
        category: 'Sport'
      },
      {
        id: '2', 
        title: 'Concert Inna - București',
        slug: 'concert-inna-bucuresti',
        start_date: new Date().toISOString(),
        image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=400',
        location: 'București',
        category: 'Eveniment'
      }
    ];

    console.log(`Found ${mockLiveEvents.length} live events`)

    return new Response(
      JSON.stringify({ events: mockLiveEvents }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})