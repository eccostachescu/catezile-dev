import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TMDBImagesResponse {
  backdrops: Array<{
    file_path: string;
    width: number;
    height: number;
    vote_average: number;
  }>;
}

interface PexelsPhoto {
  id: number;
  url: string;
  photographer: string;
  src: {
    landscape: string;
    large2x: string;
    large: string;
  };
}

interface PexelsResponse {
  photos: PexelsPhoto[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const tmdbApiKey = Deno.env.get('TMDB_API_KEY')!;
    const pexelsApiKey = Deno.env.get('PEXELS_API_KEY');
    
    if (!tmdbApiKey) {
      throw new Error('TMDB_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting image enrichment for missing show images...');

    // Get shows without images that have TMDB mapping
    const { data: showsNeedingImages, error: fetchError } = await supabase
      .from('show_mapping')
      .select(`
        tvmaze_show_id,
        tmdb_id,
        image_url,
        tvmaze_show!inner(name)
      `)
      .not('tmdb_id', 'is', null)
      .or('image_url.is.null,image_url.eq.')
      .limit(30);

    if (fetchError) {
      console.error('Error fetching shows needing images:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${showsNeedingImages?.length || 0} shows needing images`);

    let totalEnriched = 0;

    for (const showMapping of showsNeedingImages || []) {
      try {
        const showName = (showMapping as any).tvmaze_show.name;
        console.log(`Enriching images for: ${showName}`);

        let imageUrl: string | null = null;
        let imageSource: string | null = null;
        let imageCredit: string | null = null;

        // Try TMDB images first
        if (showMapping.tmdb_id) {
          try {
            const tmdbImagesUrl = `https://api.themoviedb.org/3/tv/${showMapping.tmdb_id}/images?api_key=${tmdbApiKey}`;
            const response = await fetch(tmdbImagesUrl);
            
            if (response.ok) {
              const imagesData: TMDBImagesResponse = await response.json();
              
              if (imagesData.backdrops && imagesData.backdrops.length > 0) {
                // Get the best backdrop (highest resolution and rating)
                const bestBackdrop = imagesData.backdrops
                  .sort((a, b) => (b.vote_average * b.width) - (a.vote_average * a.width))[0];
                
                imageUrl = `https://image.tmdb.org/t/p/w780${bestBackdrop.file_path}`;
                imageSource = 'tmdb';
                imageCredit = 'The Movie Database (TMDB)';
                
                console.log(`✅ Found TMDB image for ${showName}`);
              }
            }
          } catch (error) {
            console.error(`TMDB images fetch failed for ${showName}:`, error);
          }
        }

        // Fallback to Pexels if no TMDB image and API key available
        if (!imageUrl && pexelsApiKey) {
          try {
            const searchQuery = encodeURIComponent(`${showName} TV show Romania`);
            const pexelsUrl = `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=5&orientation=landscape`;
            
            const response = await fetch(pexelsUrl, {
              headers: {
                'Authorization': pexelsApiKey
              }
            });
            
            if (response.ok) {
              const pexelsData: PexelsResponse = await response.json();
              
              if (pexelsData.photos && pexelsData.photos.length > 0) {
                const photo = pexelsData.photos[0];
                imageUrl = photo.src.large;
                imageSource = 'pexels';
                imageCredit = `Photo by ${photo.photographer} from Pexels`;
                
                console.log(`✅ Found Pexels image for ${showName}`);
              }
            }
          } catch (error) {
            console.error(`Pexels search failed for ${showName}:`, error);
          }
        }

        // Update mapping if we found an image
        if (imageUrl) {
          const { error: updateError } = await supabase
            .from('show_mapping')
            .update({
              image_url: imageUrl,
              image_source: imageSource
            })
            .eq('tvmaze_show_id', showMapping.tvmaze_show_id);

          if (updateError) {
            console.error(`Error updating mapping for ${showName}:`, updateError);
            continue;
          }

          // Update events without images for this show
          await supabase
            .from('event')
            .update({ 
              image_url: imageUrl,
              image_credit: imageCredit
            })
            .eq('series_name', showName)
            .or('image_url.is.null,image_url.eq.');

          totalEnriched++;
        } else {
          console.log(`❌ No image found for ${showName}`);
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300)); // Respect API limits

      } catch (error) {
        console.error(`Error processing show ${showMapping.tvmaze_show_id}:`, error);
      }
    }

    console.log(`Image enrichment completed. Total shows enriched: ${totalEnriched}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully enriched ${totalEnriched} shows with images`,
        processed: showsNeedingImages?.length || 0
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in images_enrich_missing_shows:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to enrich missing show images', 
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