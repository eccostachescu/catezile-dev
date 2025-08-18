import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime?: number;
}

class TMDBService {
  private apiKey: string;
  private baseURL = 'https://api.themoviedb.org/3';
  private imageBaseURL = 'https://image.tmdb.org/t/p';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getMoviesByProvider(providerId: number, page = 1) {
    const response = await fetch(
      `${this.baseURL}/discover/movie?api_key=${this.apiKey}&language=ro-RO&watch_region=RO&with_watch_providers=${providerId}&page=${page}&sort_by=popularity.desc`
    );
    if (!response.ok) throw new Error('Failed to fetch movies by provider');
    const data = await response.json();
    return data.results;
  }

  async getMovieDetails(movieId: number) {
    const response = await fetch(
      `${this.baseURL}/movie/${movieId}?api_key=${this.apiKey}&language=ro-RO&append_to_response=videos`
    );
    if (!response.ok) throw new Error(`Failed to fetch movie details for ID ${movieId}`);
    return await response.json();
  }

  async getWatchProviders(movieId: number) {
    const response = await fetch(
      `${this.baseURL}/movie/${movieId}/watch/providers?api_key=${this.apiKey}`
    );
    if (!response.ok) throw new Error(`Failed to fetch watch providers for movie ${movieId}`);
    const data = await response.json();
    
    const romaniaData = data.results['RO'] || {};
    return {
      flatrate: romaniaData.flatrate || [],
      link: romaniaData.link
    };
  }

  getImageURL(path: string, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  extractBestTrailer(videos: any[]) {
    if (!videos || videos.length === 0) return null;
    
    const youtubeVideos = videos.filter(v => v.site === 'YouTube');
    const official = youtubeVideos.find(v => v.official && v.type === 'Trailer');
    const trailer = youtubeVideos.find(v => v.type === 'Trailer');
    const teaser = youtubeVideos.find(v => v.type === 'Teaser');
    
    const best = official || trailer || teaser;
    return best ? `https://www.youtube.com/watch?v=${best.key}` : null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const tmdbApiKey = Deno.env.get('TMDB_API_KEY');
    if (!tmdbApiKey) {
      throw new Error('TMDB API key not configured');
    }

    const tmdb = new TMDBService(tmdbApiKey);
    const body = req.method === 'POST' ? await req.json().catch(() => ({})) : {};
    const { platform = 'netflix', limit = 20 } = body;

    console.log(`Starting sync for platform: ${platform}, limit: ${limit}`);

    // Provider mapping
    const providerIds: Record<string, number> = {
      netflix: 8,
      prime: 119,
      'prime-video': 119,
      max: 1899,
      'hbo-max': 1899,
      disney: 337,
      'disney-plus': 337,
      'apple-tv': 350,
      hulu: 15,
      paramount: 531
    };

    const providerId = providerIds[platform];
    if (!providerId) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    // Get movies from TMDB for this provider
    const movies = await tmdb.getMoviesByProvider(providerId, 1);
    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const movie of movies.slice(0, limit)) {
      try {
        // Check if movie already exists
        const { data: existingMovie } = await supabaseClient
          .from('movie')
          .select('id, tmdb_id')
          .eq('tmdb_id', movie.id)
          .single();

        // Get detailed movie info
        const [details, watchProviders] = await Promise.all([
          tmdb.getMovieDetails(movie.id),
          tmdb.getWatchProviders(movie.id)
        ]);

        // Check if actually available on the platform in Romania
        const isAvailableOnPlatform = watchProviders.flatrate.some(
          (provider: any) => provider.provider_id === providerId
        );

        if (!isAvailableOnPlatform) {
          skipped++;
          continue;
        }

        const movieData = {
          title: details.title,
          tmdb_id: details.id,
          overview: details.overview,
          poster_url: tmdb.getImageURL(details.poster_path),
          poster_path: details.poster_path,
          backdrop_url: tmdb.getImageURL(details.backdrop_path, 'w1280'),
          backdrop_path: details.backdrop_path,
          runtime: details.runtime,
          popularity: details.popularity,
          streaming_ro: JSON.stringify({ [platform]: new Date().toISOString() }),
          trailer_key: tmdb.extractBestTrailer(details.videos?.results || []),
          updated_ext_at: new Date().toISOString(),
          genres: details.genres?.map((g: any) => g.name) || [],
          status: 'RELEASED'
        };

        if (existingMovie) {
          // Update existing movie
          const { error } = await supabaseClient
            .from('movie')
            .update(movieData)
            .eq('id', existingMovie.id);

          if (error) throw error;
          updated++;
          console.log(`Updated: ${details.title}`);
        } else {
          // Insert new movie
          const { error } = await supabaseClient
            .from('movie')
            .insert(movieData);

          if (error) throw error;
          imported++;
          console.log(`Imported: ${details.title}`);
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 250));

      } catch (error) {
        console.error(`Error processing movie ${movie.title}:`, error);
        skipped++;
      }
    }

    const result = {
      success: true,
      platform,
      imported,
      updated,
      skipped,
      total: imported + updated + skipped,
      message: `Sync completed: ${imported} imported, ${updated} updated, ${skipped} skipped`
    };

    console.log('Sync completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in sync function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});