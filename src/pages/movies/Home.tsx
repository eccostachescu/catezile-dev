import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MovieHeader } from "@/components/movies/MovieHeader";
import { MovieRail } from "@/components/movies/MovieRail";
import { MovieFilters } from "@/components/movies/MovieFilters";
import { MovieAdRail } from "@/components/movies/MovieAdRail";
import { MovieCountdownCard } from "@/components/movies/MovieCountdownCard";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Calendar, Film, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Movie {
  id: string;
  title: string;
  slug: string;
  poster_path?: string;
  cinema_release_ro?: string;
  overview?: string;
  genres?: string[];
  runtime?: number;
  popularity?: number;
  next_date?: {
    date: string;
    type: 'cinema' | 'streaming' | 'released';
    platform: string;
  };
}

export default function MoviesHome() {
  const [cinemaMovies, setCinemaMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [streamingMovies, setStreamingMovies] = useState<Record<string, Movie[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>();

  useEffect(() => {
    loadMoviesData();
  }, []);

  const loadMoviesData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading movies data from TMDB...');
      
      // Import tmdb service
      const { tmdbService } = await import('@/services/tmdb');
      
      // Get fresh movie data from TMDB API via edge function
      const popularMovies = await tmdbService.getPopularMovies(40);
      console.log('🔧 Got popular movies:', popularMovies.length);
      
      if (popularMovies.length === 0) {
        console.warn('No movies returned from TMDB, falling back to database');
        // Fallback to database if TMDB fails
        const { data: dbMovies } = await supabase
          .from('movie')
          .select('*')
          .order('popularity', { ascending: false })
          .limit(40);
        
        const fallbackMovies = (dbMovies || []).map(movie => ({
          ...movie,
          next_date: movie.cinema_release_ro ? {
            date: movie.cinema_release_ro,
            type: movie.cinema_release_ro <= new Date().toISOString().split('T')[0] ? 'released' as const : 'cinema' as const,
            platform: 'Cinema'
          } : undefined
        }));
        
        // Split fallback movies
        const today = new Date().toISOString().split('T')[0];
        setCinemaMovies(fallbackMovies.filter(m => m.cinema_release_ro && m.cinema_release_ro <= today));
        setUpcomingMovies(fallbackMovies.filter(m => m.cinema_release_ro && m.cinema_release_ro > today));
        return;
      }

      // Process movies from TMDB
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const futureDate = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Split into categories
      const cinema: Movie[] = [];
      const upcoming: Movie[] = [];
      const streaming: Record<string, Movie[]> = {};
      
      popularMovies.forEach((movie: any) => {
        const processedMovie = {
          id: movie.tmdb_id?.toString() || movie.id?.toString(),
          title: movie.title,
          slug: movie.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || movie.tmdb_id?.toString(),
          poster_path: movie.poster_url,
          cinema_release_ro: movie.cinema_release_ro,
          overview: movie.overview,
          genres: movie.genres || [],
          runtime: movie.runtime,
          popularity: movie.popularity,
          next_date: movie.cinema_release_ro ? {
            date: movie.cinema_release_ro,
            type: movie.cinema_release_ro <= todayStr ? 'released' as const : 'cinema' as const,
            platform: 'Cinema'
          } : undefined
        };

        // Categorize movies
        if (movie.cinema_release_ro) {
          if (movie.cinema_release_ro <= todayStr) {
            // Released in cinema (within last 60 days)
            const releaseDate = new Date(movie.cinema_release_ro);
            const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
            if (releaseDate >= sixtyDaysAgo) {
              cinema.push(processedMovie);
            }
          } else if (movie.cinema_release_ro <= futureDate) {
            // Upcoming in cinema
            upcoming.push(processedMovie);
          }
        }

        // Check for streaming info
        if (movie.streaming_ro && Object.keys(movie.streaming_ro).length > 0) {
          Object.entries(movie.streaming_ro).forEach(([platform, info]: [string, any]) => {
            if (!streaming[platform]) streaming[platform] = [];
            streaming[platform].push({
              ...processedMovie,
              next_date: {
                date: todayStr, // Assume available now if no specific date
                type: 'streaming',
                platform
              }
            });
          });
        }
      });

      // Sort by popularity and release date
      cinema.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      upcoming.sort((a, b) => {
        if (a.cinema_release_ro && b.cinema_release_ro) {
          return new Date(a.cinema_release_ro).getTime() - new Date(b.cinema_release_ro).getTime();
        }
        return (b.popularity || 0) - (a.popularity || 0);
      });

      console.log('🔧 Processed categories:', {
        cinema: cinema.length,
        upcoming: upcoming.length,
        streaming: Object.keys(streaming).length
      });

      setCinemaMovies(cinema);
      setUpcomingMovies(upcoming);
      setStreamingMovies(streaming);

    } catch (error) {
      console.error('Error loading movies data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique genres and years for filters
  const allMovies = [...cinemaMovies, ...upcomingMovies, ...Object.values(streamingMovies).flat()];
  const uniqueGenres = Array.from(new Set(allMovies.flatMap(m => m.genres || [])));
  const uniqueYears = Array.from(new Set(allMovies
    .map(m => m.cinema_release_ro ? new Date(m.cinema_release_ro).getFullYear() : null)
    .filter(Boolean)
  )).sort((a, b) => b! - a!);
  const availablePlatforms = Object.keys(streamingMovies);

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedPlatforms([]);
    setSelectedYear(undefined);
  };

  // Generate monthly navigation
  const monthlyLinks = [];
  for (let i = 0; i < 6; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const monthName = date.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
    
    monthlyLinks.push({
      href: `/filme/${year}-${month}`,
      label: monthName,
      current: i === 0
    });
  }

  return (
    <>
      <SEO
        kind="movie"
        title="Filme în România — Premiere la cinema și pe Netflix/Prime/Max"
        description="Calendar de premiere la cinema în România și date de apariție pe Netflix, Prime Video sau Max. Setează remindere ușor."
        path="/filme"
      />
      
      <main>
        <Container className="py-8">
          <MovieHeader
            title="Filme"
            subtitle="Calendar de premiere la cinema în România și lansări pe platforme de streaming"
            platforms={[
              { slug: 'netflix', name: 'Netflix' },
              { slug: 'prime', name: 'Prime Video' },
              { slug: 'max', name: 'Max' },
              { slug: 'la-cinema', name: 'La Cinema' }
            ]}
          />

          {/* Monthly navigation */}
          <div className="mt-8 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              {monthlyLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Button 
                    variant={link.current ? "default" : "outline"} 
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            <div className="xl:col-span-3 space-y-12">
              {/* Popular Movies as Countdown Cards */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Cele mai așteptate premiere</h2>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {upcomingMovies.slice(0, 8).map((movie) => (
                      <MovieCountdownCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                )}
              </section>

              {/* Filters */}
              <MovieFilters
                genres={uniqueGenres}
                platforms={availablePlatforms}
                years={uniqueYears}
                selectedGenres={selectedGenres}
                selectedPlatforms={selectedPlatforms}
                selectedYear={selectedYear}
                onGenreChange={setSelectedGenres}
                onPlatformChange={setSelectedPlatforms}
                onYearChange={setSelectedYear}
                onClearAll={clearFilters}
              />

              {/* In Cinema Now */}
              {cinemaMovies.length > 0 && (
                <MovieRail
                  title="În cinema acum"
                  movies={cinemaMovies}
                />
              )}

              {/* Upcoming in Cinema */}
              {upcomingMovies.length > 8 && (
                <MovieRail
                  title={`Toate premierele din ${new Date().toLocaleDateString('ro-RO', { month: 'long' })}`}
                  movies={upcomingMovies.slice(8)}
                />
              )}

              {/* Streaming Platforms */}
              {Object.entries(streamingMovies).map(([platform, movies]) => (
                <MovieRail
                  key={platform}
                  title={`Pe ${platform} din curând`}
                  movies={movies}
                />
              ))}

              {/* Call to Action */}
              <div className="text-center py-8">
                <Link to="/filme/la-cinema">
                  <Button size="lg" className="mr-4">
                    <Film className="mr-2 h-5 w-5" />
                    Vezi toate filmele la cinema
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <MovieAdRail placement="movie-hub" />
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}