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
      
      // Get current date for filtering
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
      
      // Format dates for query
      const currentMonthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const currentMonthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
      const nextMonthStart = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;
      const nextMonthEnd = new Date(nextYear, nextMonth, 0).toISOString().split('T')[0];

      // Fetch movies currently in cinema (released in last 60 days)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      
      const { data: inCinema, error: cinemaError } = await supabase
        .from('movie')
        .select('*')
        .lte('cinema_release_ro', today.toISOString().split('T')[0])
        .gte('cinema_release_ro', sixtyDaysAgo.toISOString().split('T')[0])
        .order('popularity', { ascending: false })
        .limit(20);

      if (cinemaError) {
        console.error('Error fetching cinema movies:', cinemaError);
      } else {
        setCinemaMovies(inCinema || []);
      }

      // Fetch upcoming cinema movies (current + next month)
      const { data: upcoming, error: upcomingError } = await supabase
        .from('movie')
        .select('*')
        .gte('cinema_release_ro', today.toISOString().split('T')[0])
        .lte('cinema_release_ro', nextMonthEnd)
        .order('cinema_release_ro', { ascending: true })
        .limit(20);

      if (upcomingError) {
        console.error('Error fetching upcoming movies:', upcomingError);
      } else {
        setUpcomingMovies(upcoming || []);
      }

      // Fetch streaming movies from platforms
      const { data: streamingData, error: streamingError } = await supabase
        .from('movie_platform')
        .select(`
          available_from,
          movie:movie_id (
            id,
            title,
            slug,
            poster_path,
            overview,
            genres,
            runtime,
            popularity
          ),
          platform:platform_id (
            slug,
            name
          )
        `)
        .gte('available_from', today.toISOString().split('T')[0])
        .lte('available_from', new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('available_from', { ascending: true });

      if (streamingError) {
        console.error('Error fetching streaming movies:', streamingError);
      } else {
        // Group by platform
        const grouped: Record<string, Movie[]> = {};
        (streamingData || []).forEach((item: any) => {
          if (item.movie && item.platform) {
            const platformName = item.platform.name;
            if (!grouped[platformName]) {
              grouped[platformName] = [];
            }
            grouped[platformName].push({
              ...item.movie,
              next_date: {
                date: item.available_from,
                type: 'streaming',
                platform: platformName
              }
            });
          }
        });
        setStreamingMovies(grouped);
      }

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
                  movies={cinemaMovies.map(movie => ({
                    ...movie,
                    next_date: {
                      date: movie.cinema_release_ro!,
                      type: 'released' as const,
                      platform: 'Cinema'
                    }
                  }))}
                />
              )}

              {/* Upcoming in Cinema */}
              {upcomingMovies.length > 8 && (
                <MovieRail
                  title={`Toate premierele din ${new Date().toLocaleDateString('ro-RO', { month: 'long' })}`}
                  movies={upcomingMovies.slice(8).map(movie => ({
                    ...movie,
                    next_date: movie.cinema_release_ro ? {
                      date: movie.cinema_release_ro,
                      type: 'cinema' as const,
                      platform: 'Cinema'
                    } : undefined
                  }))}
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