import { useParams } from "react-router-dom";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { MovieCountdownCard } from "@/components/movies/MovieCountdownCard";
import { MovieHeader } from "@/components/movies/MovieHeader";
import { MovieAdRail } from "@/components/movies/MovieAdRail";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Platform() {
  const { platform } = useParams();
  const { isAdmin } = useAuth();
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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

  const platformName = platformNames[platform || ""] || (platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "Unknown Platform");

  async function loadPlatformMovies() {
    if (!platform) return;
    
    try {
      // First try to get movies that have streaming data for this platform
      const { data, error } = await supabase
        .from('movie')
        .select('*')
        .not('streaming_ro', 'is', null)
        .order('popularity', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter movies that have the platform in their streaming_ro JSON
      const platformMovies = (data || []).filter(movie => {
        if (!movie.streaming_ro) return false;
        const streamingData = typeof movie.streaming_ro === 'string' 
          ? JSON.parse(movie.streaming_ro) 
          : movie.streaming_ro;
        return streamingData && streamingData[platform];
      });

      // If no platform-specific movies found, show some popular movies
      if (platformMovies.length === 0) {
        const { data: allMovies } = await supabase
          .from('movie')
          .select('*')
          .order('popularity', { ascending: false })
          .limit(20);
        
        // Format all movies for display
        const formattedMovies = (allMovies || []).map(movie => ({
          ...movie,
          next_date: movie.cinema_release_ro ? {
            date: movie.cinema_release_ro,
            type: 'cinema' as const,
            platform: 'Cinema'
          } : null
        }));
        
        setMovies(formattedMovies);
      } else {
        // Format platform movies with streaming dates
        const formattedMovies = platformMovies.map(movie => {
          const streamingData = typeof movie.streaming_ro === 'string' 
            ? JSON.parse(movie.streaming_ro) 
            : movie.streaming_ro;
          
          return {
            ...movie,
            next_date: streamingData[platform] ? {
              date: streamingData[platform],
              type: 'streaming' as const,
              platform: platformName
            } : movie.cinema_release_ro ? {
              date: movie.cinema_release_ro,
              type: 'cinema' as const,
              platform: 'Cinema'
            } : null
          };
        });
        
        setMovies(formattedMovies);
      }
    } catch (error) {
      console.error('Error loading platform movies:', error);
    } finally {
      setLoading(false);
    }
  }

  async function syncFromTMDB() {
    if (!platform || syncing) return;
    
    setSyncing(true);
    try {
      console.log('Syncing platform:', platform);
      const { data, error } = await supabase.functions.invoke('sync-platform-movies', {
        body: { platform, limit: 20 }
      });

      if (error) throw error;
      
      console.log('Sync result:', data);
      
      // Reload movies after sync
      await loadPlatformMovies();
    } catch (error) {
      console.error('Error syncing from TMDB:', error);
    } finally {
      setSyncing(false);
    }
  }

  useEffect(() => {
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
        <div className="flex items-center justify-between mb-6">
          <MovieHeader
            title={`Filme pe ${platformName}`}
            subtitle={`Următoarele filme care vor apărea pe ${platformName} în România`}
          />
          
          {isAdmin && (
            <Button 
              onClick={syncFromTMDB}
              disabled={syncing}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizare...' : 'Actualizează din TMDB'}
            </Button>
          )}
        </div>

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
                <p className="text-muted-foreground mb-4">
                  Nu am găsit filme programate pe {platformName} în perioada următoare.
                </p>
                {isAdmin && (
                  <Button 
                    onClick={syncFromTMDB}
                    disabled={syncing}
                    variant="default"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Sincronizare...' : 'Importă din TMDB'}
                  </Button>
                )}
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