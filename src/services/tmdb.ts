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
}

// Export singleton instance
export const tmdbService = new TMDBService();