import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MovieHeader } from "@/components/movies/MovieHeader";
import { MovieCard } from "@/components/movies/MovieCard";
import { MovieAdRail } from "@/components/movies/MovieAdRail";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Calendar, Film } from "lucide-react";
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

interface MonthData {
  year: number;
  month: number;
  month_name: string;
  cinema: Movie[];
  streaming: Record<string, Movie[]>;
  total_cinema: number;
  total_streaming: number;
}

export default function MoviesMonth() {
  const { year, month } = useParams<{ year: string; month: string }>();
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (year && month) {
      loadMonthData(year, month);
    }
  }, [year, month]);

  const loadMonthData = async (yearStr: string, monthStr: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the movies_month edge function
      const { data, error: functionError } = await supabase.functions.invoke('movies_month', {
        body: { year: yearStr, month: monthStr }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data) {
        // Add next_date information to movies
        const cinemaMovies = data.cinema?.map((movie: Movie) => ({
          ...movie,
          next_date: movie.cinema_release_ro ? {
            date: movie.cinema_release_ro,
            type: 'cinema' as const,
            platform: 'Cinema'
          } : undefined
        })) || [];

        const streamingMovies: Record<string, Movie[]> = {};
        Object.entries(data.streaming || {}).forEach(([platform, movies]) => {
          streamingMovies[platform] = (movies as any[]).map((movie: any) => ({
            ...movie,
            next_date: {
              date: movie.available_from,
              type: 'streaming' as const,
              platform: movie.platform_name || platform
            }
          }));
        });

        setMonthData({
          ...data,
          cinema: cinemaMovies,
          streaming: streamingMovies
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading month data');
      console.error('Error loading month data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="text-center">Loading...</div>
      </Container>
    );
  }

  if (error || !monthData) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <p className="text-red-500">Error: {error || 'Month data not found'}</p>
          <Link to="/filme">
            <Button className="mt-4">Înapoi la filme</Button>
          </Link>
        </div>
      </Container>
    );
  }

  const monthName = monthData.month_name || new Date(monthData.year, monthData.month - 1).toLocaleDateString('ro-RO', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Generate navigation for adjacent months
  const generateMonthLinks = () => {
    const links = [];
    for (let i = -2; i <= 2; i++) {
      const date = new Date(monthData.year, monthData.month - 1 + i, 1);
      const linkYear = date.getFullYear();
      const linkMonth = String(date.getMonth() + 1).padStart(2, '0');
      const linkName = date.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' });
      
      links.push({
        href: `/filme/${linkYear}-${linkMonth}`,
        label: linkName,
        current: i === 0
      });
    }
    return links;
  };

  const monthLinks = generateMonthLinks();

  return (
    <>
      <SEO
        kind="movie"
        title={`Filme în ${monthName} — România`}
        description={`Premiere la cinema și lansări pe platforme în ${monthName}. ${monthData.total_cinema} filme la cinema, ${monthData.total_streaming} pe streaming.`}
        path={`/filme/${year}-${month}`}
      />
      
      <main>
        <Container className="py-8">
          <MovieHeader
            title={`Filme în ${monthName}`}
            subtitle={`${monthData.total_cinema} premiere la cinema și ${monthData.total_streaming} lansări pe streaming`}
          />

          {/* Month navigation */}
          <div className="mt-8 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              {monthLinks.map((link) => (
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
              {/* Cinema Movies */}
              {monthData.cinema.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Film className="h-6 w-6" />
                    La cinema în {monthName}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {monthData.cinema.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </section>
              )}

              {/* Streaming Platforms */}
              {Object.entries(monthData.streaming).map(([platform, movies]) => (
                <section key={platform}>
                  <h2 className="text-2xl font-bold mb-6">
                    Pe {platform} în {monthName}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {movies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </section>
              ))}

              {/* Empty state */}
              {monthData.total_cinema === 0 && monthData.total_streaming === 0 && (
                <div className="text-center py-12">
                  <Film className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nu sunt filme programate</h3>
                  <p className="text-muted-foreground mb-6">
                    Nu avem încă informații despre filme pentru {monthName}.
                  </p>
                  <Link to="/filme">
                    <Button>
                      Vezi toate filmele
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="xl:col-span-1">
              <MovieAdRail placement="movie-list" />
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}