import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TMDBSearchResult {
  id: number;
  name: string;
  first_air_date?: string;
  backdrop_path?: string;
  poster_path?: string;
  vote_average: number;
  overview: string;
  origin_country?: string[];
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY')!;
    
    if (!tmdbApiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting TVMaze to TMDB mapping...');

    // Get unmapped shows (limit 50 per run)
    const { data: unmappedShows, error: fetchError } = await supabase
      .from('tvmaze_show')
      .select(`
        id,
        tvmaze_id,
        name,
        premiered,
        network,
        genres
      `)
      .not('id', 'in', `(
        SELECT tvmaze_show_id 
        FROM show_mapping 
        WHERE tvmaze_show_id IS NOT NULL
      )`)
      .limit(50);

    if (fetchError) {
      console.error('Error fetching unmapped shows:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${unmappedShows?.length || 0} unmapped shows`);

    let totalMapped = 0;

    for (const show of unmappedShows || []) {
      try {
        console.log(`Mapping show: ${show.name}`);

        // Search TMDB for this show
        const searchQuery = encodeURIComponent(show.name);
        const premieredYear = show.premiered ? new Date(show.premiered).getFullYear() : '';
        
        const tmdbSearchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbApiKey}&query=${searchQuery}&first_air_date_year=${premieredYear}&language=ro-RO`;
        
        const response = await fetch(tmdbSearchUrl);
        
        if (!response.ok) {
          console.error(`TMDB search failed for ${show.name}: ${response.status}`);
          continue;
        }

        const searchResults: TMDBSearchResponse = await response.json();
        
        if (!searchResults.results || searchResults.results.length === 0) {
          console.log(`No TMDB results found for: ${show.name}`);
          
          // Insert empty mapping to avoid re-processing
          await supabase
            .from('show_mapping')
            .upsert({
              tvmaze_show_id: show.tvmaze_id,
              tmdb_id: null,
              slug: generateSlug(show.name),
              verified: false,
              manual_override: false
            });
          
          continue;
        }

        // Find best match
        const bestMatch = findBestMatch(show, searchResults.results);
        
        if (!bestMatch) {
          console.log(`No suitable match found for: ${show.name}`);
          continue;
        }

        // Generate image URL
        const imageUrl = bestMatch.backdrop_path 
          ? `https://image.tmdb.org/t/p/w780${bestMatch.backdrop_path}`
          : bestMatch.poster_path 
          ? `https://image.tmdb.org/t/p/w780${bestMatch.poster_path}`
          : null;

        // Insert mapping
        const { error: mappingError } = await supabase
          .from('show_mapping')
          .upsert({
            tvmaze_show_id: show.tvmaze_id,
            tmdb_id: bestMatch.id,
            slug: generateSlug(show.name),
            image_url: imageUrl,
            image_source: 'tmdb',
            verified: bestMatch.vote_average > 7, // Auto-verify high-rated matches
            manual_override: false
          });

        if (mappingError) {
          console.error(`Error saving mapping for ${show.name}:`, mappingError);
          continue;
        }

        // Update events without images
        if (imageUrl) {
          await supabase
            .from('event')
            .update({ 
              image_url: imageUrl,
              image_credit: 'TMDB' 
            })
            .eq('series_name', show.name)
            .is('image_url', null);
        }

        totalMapped++;
        console.log(`✅ Mapped ${show.name} to TMDB ID ${bestMatch.id}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 250)); // 4 requests/second

      } catch (error) {
        console.error(`Error processing show ${show.name}:`, error);
      }
    }

    console.log(`Mapping completed. Total shows mapped: ${totalMapped}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully mapped ${totalMapped} shows to TMDB`,
        processed: unmappedShows?.length || 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in map_tvmaze_to_tmdb:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to map shows to TMDB', 
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function findBestMatch(tvmazeShow: any, tmdbResults: TMDBSearchResult[]): TMDBSearchResult | null {
  if (tmdbResults.length === 0) return null;
  
  // Simple scoring system
  let bestMatch = tmdbResults[0];
  let bestScore = 0;
  
  for (const result of tmdbResults) {
    let score = 0;
    
    // Name similarity (basic)
    if (result.name.toLowerCase().includes(tvmazeShow.name.toLowerCase()) ||
        tvmazeShow.name.toLowerCase().includes(result.name.toLowerCase())) {
      score += 3;
    }
    
    // Exact name match
    if (result.name.toLowerCase() === tvmazeShow.name.toLowerCase()) {
      score += 5;
    }
    
    // Year match
    if (tvmazeShow.premiered && result.first_air_date) {
      const tvmazeYear = new Date(tvmazeShow.premiered).getFullYear();
      const tmdbYear = new Date(result.first_air_date).getFullYear();
      if (Math.abs(tvmazeYear - tmdbYear) <= 1) {
        score += 2;
      }
    }
    
    // Higher rating gives slight boost
    score += result.vote_average / 10;
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = result;
    }
  }
  
  // Only return if we have a reasonable confidence
  return bestScore >= 1 ? bestMatch : null;
}