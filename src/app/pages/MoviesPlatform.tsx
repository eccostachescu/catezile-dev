import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MovieCardEnhanced } from "@/components/movies/MovieCardEnhanced";
import { GridSkeleton } from "@/components/movies/Skeletons";

const platformInfo = {
  netflix: {
    name: "Netflix",
    title: "Filme pe Netflix România",
    description: "Filmele disponibile pe Netflix în România. Descoperă ce filme noi au apărut recent.",
    color: "destructive",
    field: "Netflix"
  },
  "prime-video": {
    name: "Prime Video", 
    title: "Filme pe Prime Video România",
    description: "Filmele disponibile pe Amazon Prime Video în România. Vezi ce filme noi poți urmări.",
    color: "secondary",
    field: "Prime Video"
  },
  "hbo-max": {
    name: "HBO Max",
    title: "Filme pe HBO Max România", 
    description: "Filmele disponibile pe HBO Max în România. Explorează catalogul de filme.",
    color: "outline",
    field: "HBO Max"
  }
};

export default function MoviesPlatform() {
  const { platform } = useParams<{ platform: string }>();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<any[]>([]);

  const info = platform ? platformInfo[platform as keyof typeof platformInfo] : null;

  useEffect(() => {
    async function loadMovies() {
      if (!platform || !info) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Query movies that have the platform in their streaming_ro data
        const { data, error } = await supabase
          .from('movie')
          .select('*')
          .not('streaming_ro', 'is', null)
          .order('popularity', { ascending: false })
          .limit(50);

        if (error) throw error;

        // Filter movies that have the specific platform
        const platformMovies = (data || []).filter((movie: any) => {
          return movie.streaming_ro && movie.streaming_ro[info.field];
        });

        setMovies(platformMovies);
      } catch (error) {
        console.error('Error loading platform movies:', error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
  }, [platform, info]);

  if (!platform || !info) {
    return (
      <Container className="py-6">
        <h1 className="text-2xl font-semibold mb-4">Platformă necunoscută</h1>
        <p>Platforma solicitată nu a fost găsită.</p>
      </Container>
    );
  }

  return (
    <>
      <SEO 
        kind="category" 
        title={info.title} 
        description={info.description} 
        path={`/filme/${platform}`} 
      />
      <Container className="py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{info.title}</h1>
          <p className="text-muted-foreground">{info.description}</p>
        </div>

        {loading ? (
          <GridSkeleton />
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => (
              <MovieCardEnhanced
                key={movie.id}
                movie={{
                  id: movie.id,
                  title: movie.title,
                  slug: movie.slug,
                  poster_url: movie.poster_url,
                  poster_path: movie.poster_path,
                  cinema_release_ro: movie.cinema_release_ro,
                  streaming_ro: movie.streaming_ro,
                  overview: movie.overview,
                  genres: movie.genres,
                  runtime: movie.runtime,
                  popularity: movie.popularity,
                  status: movie.status
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Nu am găsit filme</h3>
            <p className="text-muted-foreground">
              Nu avem încă filme confirmate pe {info.name} în baza noastră de date.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}