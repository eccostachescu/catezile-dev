export class TMDBService {
  private apiKey: string = '';
  private baseURL = 'https://api.themoviedb.org/3';
  private imageBaseURL = 'https://image.tmdb.org/t/p';

  constructor() {
    // Use environment variable if available, otherwise use demo key
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY || 'demo';
    if (this.apiKey === 'demo') {
      console.warn('TMDB API key not found. Add VITE_TMDB_API_KEY to your .env file');
    }
  }

  // Get popular movies
  async getPopularMovies(page = 1) {
    const response = await fetch(
      `${this.baseURL}/movie/popular?api_key=${this.apiKey}&language=ro-RO&page=${page}&region=RO`
    );
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    const data = await response.json();
    return data.results;
  }

  // Get upcoming movies
  async getUpcomingMovies(page = 1) {
    const response = await fetch(
      `${this.baseURL}/movie/upcoming?api_key=${this.apiKey}&language=ro-RO&page=${page}&region=RO`
    );
    if (!response.ok) throw new Error('Failed to fetch upcoming movies');
    const data = await response.json();
    return data.results;
  }

  // Get movie details
  async getMovieDetails(movieId: number) {
    const response = await fetch(
      `${this.baseURL}/movie/${movieId}?api_key=${this.apiKey}&language=ro-RO&append_to_response=videos,credits`
    );
    if (!response.ok) throw new Error(`Failed to fetch movie details for ID ${movieId}`);
    return await response.json();
  }

  // Get watch providers (streaming availability)
  async getWatchProviders(movieId: number, region = 'RO') {
    const response = await fetch(
      `${this.baseURL}/movie/${movieId}/watch/providers?api_key=${this.apiKey}`
    );
    if (!response.ok) throw new Error(`Failed to fetch watch providers for movie ${movieId}`);
    const data = await response.json();
    
    const regionData = data.results[region] || data.results['US'] || {};
    
    return {
      netflix: regionData.flatrate?.find((p: any) => p.provider_name === 'Netflix'),
      allStreamingServices: regionData.flatrate || [],
      buyOptions: regionData.buy || [],
      rentOptions: regionData.rent || [],
      tmdbWatchLink: regionData.link
    };
  }

  // Get movies by streaming provider
  async getMoviesByProvider(providerId: number, page = 1) {
    const response = await fetch(
      `${this.baseURL}/discover/movie?api_key=${this.apiKey}&language=ro-RO&watch_region=RO&with_watch_providers=${providerId}&page=${page}&sort_by=popularity.desc`
    );
    if (!response.ok) throw new Error('Failed to fetch movies by provider');
    const data = await response.json();
    return data.results;
  }

  // Get image URL
  getImageURL(path: string, size = 'w500') {
    if (!path) return '/placeholder-movie.jpg';
    return `${this.imageBaseURL}/${size}${path}`;
  }

  // Search movies
  async searchMovies(query: string, year?: number) {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      language: 'ro-RO',
      query: query,
      include_adult: 'false',
      ...(year && { year: year.toString() })
    });
    
    const response = await fetch(`${this.baseURL}/search/movie?${params}`);
    if (!response.ok) throw new Error('Failed to search movies');
    const data = await response.json();
    return data.results;
  }

  // NEW TV SHOW METHODS
  
  // Get popular TV shows
  async getPopularTVShows(page = 1) {
    const response = await fetch(
      `${this.baseURL}/tv/popular?api_key=${this.apiKey}&language=ro-RO&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch popular TV shows');
    const data = await response.json();
    return data.results;
  }

  // Get on-air TV shows (currently airing)
  async getOnAirTVShows(page = 1) {
    const response = await fetch(
      `${this.baseURL}/tv/on_the_air?api_key=${this.apiKey}&language=ro-RO&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch on-air TV shows');
    const data = await response.json();
    return data.results;
  }

  // Get airing today TV shows
  async getAiringTodayTVShows(page = 1) {
    const response = await fetch(
      `${this.baseURL}/tv/airing_today?api_key=${this.apiKey}&language=ro-RO&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch airing today TV shows');
    const data = await response.json();
    return data.results;
  }

  // Get TV show details with episodes
  async getTVShowDetails(showId: number) {
    const response = await fetch(
      `${this.baseURL}/tv/${showId}?api_key=${this.apiKey}&language=ro-RO&append_to_response=videos,credits,external_ids`
    );
    if (!response.ok) throw new Error(`Failed to fetch TV show details for ID ${showId}`);
    return await response.json();
  }

  // Get specific season details
  async getSeasonDetails(showId: number, seasonNumber: number) {
    const response = await fetch(
      `${this.baseURL}/tv/${showId}/season/${seasonNumber}?api_key=${this.apiKey}&language=ro-RO`
    );
    if (!response.ok) throw new Error(`Failed to fetch season ${seasonNumber} for show ${showId}`);
    return await response.json();
  }

  // Get next episode to air for a show
  async getNextEpisode(showId: number) {
    try {
      const showDetails = await this.getTVShowDetails(showId);
      
      if (showDetails.next_episode_to_air) {
        return {
          episode: showDetails.next_episode_to_air,
          show: showDetails
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching next episode:', error);
      return null;
    }
  }

  // Get upcoming TV shows with episodes (main function for your use case)
  async getUpcomingTVShowsWithEpisodes(limit = 20) {
    try {
      const [onAir, airingToday, popular] = await Promise.all([
        this.getOnAirTVShows(1),
        this.getAiringTodayTVShows(1),
        this.getPopularTVShows(1)
      ]);

      // Combine and deduplicate shows
      const allShows = [...onAir, ...airingToday, ...popular];
      const uniqueShows = allShows.filter((show, index, self) => 
        index === self.findIndex(s => s.id === show.id)
      );

      // Get detailed info for each show with next episode
      const showsWithEpisodes = await Promise.all(
        uniqueShows.slice(0, limit).map(async (show) => {
          try {
            const nextEpisode = await this.getNextEpisode(show.id);
            if (nextEpisode) {
              return {
                ...show,
                next_episode: nextEpisode.episode,
                backdrop_url: this.getImageURL(show.backdrop_path, 'w1280'),
                poster_url: this.getImageURL(show.poster_path, 'w500'),
                air_date: nextEpisode.episode.air_date,
                episode_name: nextEpisode.episode.name,
                season_number: nextEpisode.episode.season_number,
                episode_number: nextEpisode.episode.episode_number
              };
            }
            return null;
          } catch (error) {
            console.error(`Error processing show ${show.id}:`, error);
            return null;
          }
        })
      );

      // Filter out null results and sort by air date
      return showsWithEpisodes
        .filter(show => show !== null && show.air_date)
        .sort((a, b) => new Date(a.air_date).getTime() - new Date(b.air_date).getTime());

    } catch (error) {
      console.error('Error fetching upcoming TV shows:', error);
      return [];
    }
  }

  // Search TV shows
  async searchTVShows(query: string) {
    const params = new URLSearchParams({
      api_key: this.apiKey,
      language: 'ro-RO',
      query: query,
      include_adult: 'false'
    });
    
    const response = await fetch(`${this.baseURL}/search/tv?${params}`);
    if (!response.ok) throw new Error('Failed to search TV shows');
    const data = await response.json();
    return data.results;
  }

  // Get TV show by genre
  async getTVShowsByGenre(genreId: number, page = 1) {
    const response = await fetch(
      `${this.baseURL}/discover/tv?api_key=${this.apiKey}&language=ro-RO&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`
    );
    if (!response.ok) throw new Error('Failed to fetch TV shows by genre');
    const data = await response.json();
    return data.results;
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