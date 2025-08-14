import { useParams } from "react-router-dom";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { MovieCountdownCard } from "@/components/movies/MovieCountdownCard";
import { MovieHeader } from "@/components/movies/MovieHeader";
import { MovieAdRail } from "@/components/movies/MovieAdRail";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Platform() {
  const { platform } = useParams();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const platformNames: Record<string, string> = {
    netflix: "Netflix",
    prime: "Amazon Prime Video", 
    max: "Max",
    "hbo-max": "HBO Max",
    disney: "Disney+",
    "apple-tv": "Apple TV+"
  };

  const platformName = platformNames[platform || ""] || platform;

  useEffect(() => {
    async function loadPlatformMovies() {
      if (!platform) return;
      
      try {
        // Get movies from this platform with upcoming dates
        const { data: moviePlatforms } = await supabase
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
              popularity,
              cinema_release_ro
            )
          `)
          .eq('platform_id', (await supabase
            .from('ott_platform')
            .select('id')
            .eq('slug', platform)
            .single()
          ).data?.id)
          .gte('available_from', new Date().toISOString().split('T')[0])
          .order('available_from', { ascending: true })
          .limit(20);

        const formattedMovies = moviePlatforms?.map(mp => ({
          ...mp.movie,
          next_date: {
            date: mp.available_from,
            type: 'streaming' as const,
            platform: platformName
          }
        })) || [];

        setMovies(formattedMovies);
      } catch (error) {
        console.error('Error loading platform movies:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlatformMovies();
  }, [platform, platformName]);

  const title = `Filme pe ${platformName} — Noutăți și date de lansare`;
  const description = `Descoperă filmele care vor apărea pe ${platformName} în România. Data de lansare, trailere și reminder-e pentru noile filme.`;

  return (
    <>
      <SEO 
        title={title}
        description={description} 
        path={`/filme/${platform}`}
      />
      
      <Container className="py-8">
        <MovieHeader
          title={`Filme pe ${platformName}`}
          subtitle={`Următoarele filme care vor apărea pe ${platformName} în România`}
        />

        <div className="grid lg:grid-cols-4 gap-6 mt-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {movies.map((movie) => (
                  <MovieCountdownCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Nu am găsit filme programate pe {platformName} în perioada următoare.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <MovieAdRail placement="movie-hub" />
          </div>
        </div>
      </Container>
    </>
  );
}