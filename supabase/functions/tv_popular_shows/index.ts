import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Popular Romanian TV Shows with their typical schedule
const popularShows = [
  {
    title: "Insula Iubirii",
    channel: "Antena 1",
    type: "reality",
    typical_time: "21:30",
    typical_days: ["luni", "marți", "miercuri"],
    description: "Cel mai urmărit test al iubirii și încrederii din România"
  },
  {
    title: "Chefi la Cuțite",
    channel: "Antena 1", 
    type: "cooking",
    typical_time: "20:30",
    typical_days: ["luni", "marți", "miercuri", "joi"],
    description: "Competiția culinară care îi pune la încercare pe cei mai buni chefi"
  },
  {
    title: "Asia Express",
    channel: "Antena 1",
    type: "adventure", 
    typical_time: "20:30",
    typical_days: ["marți", "miercuri", "joi"],
    description: "Cel mai greu reality show din lume"
  },
  {
    title: "Survivor România",
    channel: "Pro TV",
    type: "survival",
    typical_time: "20:30", 
    typical_days: ["sâmbătă", "duminică"],
    description: "Supraviețuirea în condiții extreme"
  },
  {
    title: "Bravo, ai Stil!",
    channel: "Kanal D",
    type: "fashion",
    typical_time: "17:00",
    typical_days: ["luni", "marți", "miercuri", "joi", "vineri"],
    description: "Competiția de modă și stil"
  },
  {
    title: "Te cunosc de undeva",
    channel: "Antena 1",
    type: "entertainment",
    typical_time: "20:00",
    typical_days: ["sâmbătă"],
    description: "Show-ul transformărilor spectaculoase"
  },
  {
    title: "Masked Singer România",
    channel: "Pro TV", 
    type: "music",
    typical_time: "20:30",
    typical_days: ["vineri"],
    description: "Competiția muzicală cu identități ascunse"
  },
  {
    title: "Vocea României",
    channel: "Pro TV",
    type: "music",
    typical_time: "20:30",
    typical_days: ["vineri"],
    description: "Talentele vocale ale României"
  },
  {
    title: "Românii au Talent",
    channel: "Pro TV",
    type: "talent",
    typical_time: "20:30",
    typical_days: ["vineri"],
    description: "Cea mai mare scenă de talente din România"
  },
  {
    title: "Ferma",
    channel: "Pro TV",
    type: "reality",
    typical_time: "20:30",
    typical_days: ["sâmbătă", "duminică"],
    description: "Viața la țară în cel mai dur reality show"
  }
];

serve(async (req) => {
  console.log('Popular TV shows request received');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const body = req.method === 'POST' ? await req.json() : {};
    
    const category = url.searchParams.get('category') || body.category;
    const channel = url.searchParams.get('channel') || body.channel; 
    const limit = parseInt(url.searchParams.get('limit') || body.limit || '10');

    console.log('Filters:', { category, channel, limit });

    let filteredShows = popularShows;

    // Filter by category if provided
    if (category) {
      filteredShows = filteredShows.filter(show => show.type === category);
      console.log(`Filtered by category '${category}': ${filteredShows.length} shows`);
    }

    // Filter by channel if provided  
    if (channel) {
      filteredShows = filteredShows.filter(show => show.channel === channel);
      console.log(`Filtered by channel '${channel}': ${filteredShows.length} shows`);
    }

    // Limit results
    filteredShows = filteredShows.slice(0, limit);

    // Add current day context
    const today = new Date();
    const dayNames = ['duminică', 'luni', 'marți', 'miercuri', 'joi', 'vineri', 'sâmbătă'];
    const currentDay = dayNames[today.getDay()];

    // Mark shows that typically air today
    const enrichedShows = filteredShows.map(show => ({
      ...show,
      airs_today: show.typical_days.includes(currentDay),
      next_typical_day: show.typical_days.find(day => {
        const dayIndex = dayNames.indexOf(day);
        const todayIndex = today.getDay();
        return dayIndex >= todayIndex;
      }) || show.typical_days[0]
    }));

    // Sort by relevance - shows airing today first
    enrichedShows.sort((a, b) => {
      if (a.airs_today && !b.airs_today) return -1;
      if (!a.airs_today && b.airs_today) return 1;
      return 0;
    });

    console.log(`Returning ${enrichedShows.length} popular shows`);

    return new Response(
      JSON.stringify({
        shows: enrichedShows,
        total: enrichedShows.length,
        current_day: currentDay,
        filters_applied: { category, channel }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in popular TV shows function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});