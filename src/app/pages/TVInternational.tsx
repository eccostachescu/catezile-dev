import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/seo/SEO";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tv, Clock } from "lucide-react";
import { MediaCard } from "@/components/media";

interface InternationalShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  genres: string[];
  vote_average: number;
  popularity: number;
  poster_url: string;
  backdrop_url: string;
  slug: string;
  status?: string;
  next_episode_to_air?: {
    air_date: string;
    episode_number: number;
    season_number: number;
    name: string;
  };
}

export function TVInternational() {
  const navigate = useNavigate();
  const [shows, setShows] = useState<InternationalShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('');

  const genres = [
    { key: '', label: 'Toate' },
    { key: 'drama', label: 'Drama' },
    { key: 'comedy', label: 'Comedy' },
    { key: 'crime', label: 'Crime' },
    { key: 'sci-fi', label: 'Sci-Fi' },
    { key: 'fantasy', label: 'Fantasy' },
    { key: 'action', label: 'Acțiune' },
    { key: 'thriller', label: 'Thriller' },
    { key: 'animation', label: 'Animație' },
    { key: 'documentary', label: 'Documentar' },
  ];

  useEffect(() => {
    loadShows();
  }, [selectedGenre]);

  const loadShows = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('tmdb_popular_tv', {
        body: { 
          genre: selectedGenre,
          limit: 24 
        }
      });

      if (error) throw error;
      setShows(data?.shows || []);
    } catch (error) {
      console.error('Error loading shows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowClick = (show: InternationalShow) => {
    navigate(`/tv/emisiuni/${show.slug || show.id}`);
  };

  const getNextEpisodeDate = (show: InternationalShow) => {
    if (show.next_episode_to_air?.air_date) {
      return new Date(show.next_episode_to_air.air_date);
    }
    return null;
  };

  return (
    <>
      <SEO 
        title="Seriale TV Internaționale — Netflix, HBO, Amazon Prime"
        description="Descoperă cele mai populare seriale TV internaționale disponibile pe Netflix, HBO Max, Amazon Prime și alte platforme de streaming."
        path="/tv"
      />
      
      <Container className="py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Seriale TV Internaționale
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/5 blur-3xl -z-10 rounded-full opacity-30"></div>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Descoperă cele mai urmărite seriale TV din întreaga lume. 
            De la producții Netflix la seriale HBO și Amazon Prime Video.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span>Live Updates</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Countdowns în timp real</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative mb-12">
          <div className="flex flex-wrap gap-3 justify-center p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg">
            {genres.map((genre) => (
              <Button
                key={genre.key}
                variant={selectedGenre === genre.key ? 'default' : 'ghost'}
                size="sm"
                className={`
                  relative overflow-hidden transition-all duration-300 rounded-full px-4 py-2
                  ${selectedGenre === genre.key 
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105' 
                    : 'hover:bg-primary/10 hover:scale-105'
                  }
                `}
                onClick={() => setSelectedGenre(genre.key)}
              >
                {selectedGenre === genre.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 -z-10"></div>
                )}
                <span className="relative z-10">{genre.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {[...Array(24)].map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {shows.map((show) => {
                const nextEpisodeDate = getNextEpisodeDate(show);
                const hasUpcomingEpisode = nextEpisodeDate && nextEpisodeDate > new Date() && show.status !== "Ended";
                
                // Skip shows without images in the "Populare" section
                if (!show.poster_url) return null;
                
                return (
                  <MediaCard
                    key={show.id}
                    id={show.id.toString()}
                    href={`/tv/emisiuni/${show.slug || show.id}`}
                    title={show.name}
                    year={new Date(show.first_air_date).getFullYear()}
                    genres={show.genres}
                    rating={show.vote_average}
                    imageUrl={show.poster_url}
                    status={show.status === "Ended" ? "ended" : hasUpcomingEpisode ? "scheduled" : "ended"}
                    nextEpisode={hasUpcomingEpisode && show.next_episode_to_air ? {
                      season: show.next_episode_to_air.season_number,
                      episode: show.next_episode_to_air.episode_number,
                      title: show.next_episode_to_air.name,
                      startsAt: show.next_episode_to_air.air_date
                    } : undefined}
                    canRemind={hasUpcomingEpisode}
                    tmdbId={show.id}
                  />
                );
              })}
            </div>

            {shows.length === 0 && !loading && (
              <div className="text-center py-12">
                <Tv className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nu s-au găsit seriale</h3>
                <p className="text-muted-foreground">
                  Încearcă să schimbi filtrul de gen pentru a vedea mai multe seriale.
                </p>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-20 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm rounded-3xl p-12 border border-border/50 shadow-2xl">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-primary/25">
                    <Tv className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Explorează Programul TV
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                    Vezi ce este la TV acum și ce urmează în program. Găsește serialele tale preferate pe canalele românești și internaționale.
                  </p>
                  <div className="flex gap-4 justify-center flex-wrap">
                    <Button 
                      onClick={() => navigate('/tv/program')} 
                      size="lg"
                      className="h-12 px-8 rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                    >
                      <Tv className="w-5 h-5 mr-3" />
                      Program TV Live
                    </Button>
                    <Button 
                      onClick={() => navigate('/tv/emisiuni')} 
                      variant="outline" 
                      size="lg"
                      className="h-12 px-8 rounded-full border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                    >
                      Emisiuni Românești
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  );
}