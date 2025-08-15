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
    prime: "Prime Video",
    "prime-video": "Prime Video", 
    max: "HBO Max",
    "hbo-max": "HBO Max",
    disney: "Disney+",
    "disney-plus": "Disney+",
    "apple-tv": "Apple TV+"
  };

  const platformName = platformNames[platform || ""] || "undefined";

  useEffect(() => {
    async function loadPlatformMovies() {
      if (!platform) return;
      
      try {
        // Query movies that have the platform in their streaming_ro data
        const { data, error } = await supabase
          .from('movie')
          .select('*')
          .not('streaming_ro', 'is', null)
          .order('popularity', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Filter movies that have the specific platform based on the platform mapping
        const platformMapping: Record<string, string> = {
          netflix: "Netflix",
          prime: "Prime Video",
          "prime-video": "Prime Video",
          max: "HBO Max",
          "hbo-max": "HBO Max",
          disney: "Disney+",
          "disney-plus": "Disney+",
          "apple-tv": "Apple TV+"
        };

        const platformField = platformMapping[platform] || platform;
        
        const platformMovies = (data || []).filter((movie: any) => {
          return movie.streaming_ro && movie.streaming_ro[platformField];
        });

        // Format movies with next_date for compatibility
        const formattedMovies = platformMovies.map(movie => ({
          ...movie,
          next_date: movie.cinema_release_ro ? {
            date: movie.cinema_release_ro,
            type: 'cinema' as const,
            platform: 'Cinema'
          } : null
        }));

        setMovies(formattedMovies);
      } catch (error) {
        console.error('Error loading platform movies:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPlatformMovies();
  }, [platform]);

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