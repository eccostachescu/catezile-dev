import { supabase } from '@/integrations/supabase/client';

export class TMDBService {
  private baseURL = 'https://api.themoviedb.org/3';
  private imageBaseURL = 'https://image.tmdb.org/t/p';

  constructor() {
    console.log('TMDB Service initialized - using edge functions for API calls');
  }

  // Always returns false since we use edge functions now
  isUsingDemoKey(): boolean {
    return false;
  }

  // Get popular movies - use edge function for production
  async getPopularMovies(page = 1) {
    console.log('Note: Use edge functions for production TMDB calls');
    return [];
  }

  // Get upcoming movies - use edge function for production
  async getUpcomingMovies(page = 1) {
    console.log('Note: Use edge functions for production TMDB calls');
    return [];
  }

  // Get TV show details - placeholder for now (should use edge function in production)
  async getTVShowDetails(showId: number) {
    console.warn('getTVShowDetails not implemented - should use edge function in production');
    throw new Error('TV show details not available - use edge function instead');
  }

  // Get image URL
  getImageURL(path: string, size = 'w500') {
    if (!path) return '/placeholder-movie.jpg';
    return `${this.imageBaseURL}/${size}${path}`;
  }

  // Get upcoming TV shows with episodes - now uses edge function
  async getUpcomingTVShowsWithEpisodes(limit = 20) {
    try {
      console.log('🔧 Calling tmdb_popular_tv edge function for upcoming shows...');
      
      const { data } = await supabase.functions.invoke('tmdb_popular_tv', {
        body: { 
          type: 'upcoming',
          limit: limit 
        }
      });

      if (data?.success) {
        console.log('🔧 Edge function returned:', data.shows?.length || 0, 'shows');
        return data.shows || [];
      } else {
        console.error('🔧 Edge function error:', data?.error);
        return [];
      }
    } catch (error) {
      console.error('🔧 Error calling edge function:', error);
      return [];
    }
  }

  // Get popular TV shows - use edge function
  async getPopularTVShows(genre?: string, limit = 12) {
    try {
      console.log('🔧 Calling tmdb_popular_tv edge function for popular shows...');
      
      const { data } = await supabase.functions.invoke('tmdb_popular_tv', {
        body: { 
          type: 'popular',
          genre: genre,
          limit: limit 
        }
      });

      if (data?.success) {
        console.log('🔧 Edge function returned:', data.shows?.length || 0, 'shows');
        return data.shows || [];
      } else {
        console.error('🔧 Edge function error:', data?.error);
        return [];
      }
    } catch (error) {
      console.error('🔧 Error calling edge function:', error);
      return [];
    }
  }

  // Utility function to calculate time until episode airs
  getTimeUntilAiring(airDate: string): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  } | null {
    if (!airDate) return null;
    
    const now = new Date().getTime();
    const airTime = new Date(airDate).getTime();
    const diff = airTime - now;
    
    if (diff <= 0) return null;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, totalMs: diff };
  }
}

// Export singleton instance
export const tmdbService = new TMDBService();