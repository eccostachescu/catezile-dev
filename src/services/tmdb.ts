export class TMDBService {
  private apiKey: string = '';
  private baseURL = 'https://api.themoviedb.org/3';
  private imageBaseURL = 'https://image.tmdb.org/t/p';

  constructor() {
    // Note: API key will be available in edge functions via Supabase secrets
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

  // Extract best trailer
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

// Export singleton instance
export const tmdbService = new TMDBService();