import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.54.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DedupeRequest {
  title: string;
  date: string;
  cityId?: string;
  venueId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const request: DedupeRequest = await req.json();
    const eventDate = new Date(request.date);
    
    // Look for events ±2 days in same city/venue with similar title
    const twoDaysAgo = new Date(eventDate);
    twoDaysAgo.setDate(eventDate.getDate() - 2);
    
    const twoDaysLater = new Date(eventDate);
    twoDaysLater.setDate(eventDate.getDate() + 2);

    let query = supabaseClient
      .from('event')
      .select(`
        id,
        title,
        starts_at,
        status,
        city:city_id(name),
        venue:venue_id(name)
      `)
      .gte('starts_at', twoDaysAgo.toISOString())
      .lte('starts_at', twoDaysLater.toISOString())
      .neq('status', 'REJECTED');

    // Add city filter if provided
    if (request.cityId) {
      query = query.eq('city_id', request.cityId);
    }

    // Add venue filter if provided
    if (request.venueId) {
      query = query.eq('venue_id', request.venueId);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Dedupe query error:', error);
      return new Response(JSON.stringify({ error: "Failed to check duplicates" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const candidates = [];
    const inputTitle = request.title.toLowerCase();

    for (const event of events || []) {
      const eventTitle = event.title.toLowerCase();
      
      // Simple similarity check - could be improved with proper string similarity
      const similarity = calculateSimilarity(inputTitle, eventTitle);
      
      if (similarity > 0.6) {
        candidates.push({
          id: event.id,
          title: event.title,
          starts_at: event.starts_at,
          status: event.status,
          city: event.city?.name,
          venue: event.venue?.name,
          similarity: similarity
        });
      }
    }

    // Sort by similarity score descending
    candidates.sort((a, b) => b.similarity - a.similarity);

    return new Response(JSON.stringify({ 
      duplicates: candidates.slice(0, 5), // Return top 5 matches
      hasPotentialDuplicates: candidates.length > 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error('Error in events_dedupe:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateSimilarity(str1: string, str2: string): number {
  // Simple word-based similarity - could use Levenshtein distance or other algorithms
  const words1 = str1.split(/\s+/).filter(w => w.length > 2);
  const words2 = str2.split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
}