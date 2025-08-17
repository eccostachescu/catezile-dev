import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/seo/SEO";
import Container from "@/components/Container";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, Play, Calendar, Tv, ExternalLink, Clock } from "lucide-react";
import CountdownTimer from "@/components/CountdownTimer";
import ReminderButton from "@/components/ReminderButton";

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Seriale TV Internaționale
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descoperă cele mai urmărite seriale TV din întreaga lume. 
            De la producții Netflix la seriale HBO și Amazon Prime Video.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {genres.map((genre) => (
            <Button
              key={genre.key}
              variant={selectedGenre === genre.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGenre(genre.key)}
            >
              {genre.label}
            </Button>
          ))}
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
                const hasUpcomingEpisode = nextEpisodeDate && nextEpisodeDate > new Date();
                
                return (
                  <div 
                    key={show.id} 
                    className="group bg-card rounded-lg overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => handleShowClick(show)}
                  >
                    <div className="aspect-[2/3] relative overflow-hidden">
                      {show.poster_url ? (
                        <img 
                          src={show.poster_url} 
                          alt={show.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Play className="w-8 h-8 text-primary/60" />
                        </div>
                      )}
                      
                      {/* Rating badge */}
                      <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-xs flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {show.vote_average.toFixed(1)}
                      </div>

                      {/* Next episode badge */}
                      {hasUpcomingEpisode && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs">
                          Episod nou
                        </div>
                      )}

                      {/* Overlay with play button */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                    
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                        {show.name}
                      </h3>
                      
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{new Date(show.first_air_date).getFullYear()}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {show.genres.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs px-1 py-0">
                            {genre}
                          </Badge>
                        ))}
                      </div>

                      {/* Countdown for next episode */}
                      {hasUpcomingEpisode && nextEpisodeDate && (
                        <div className="mb-3 p-2 bg-primary/10 rounded-lg border border-primary/20">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-primary">Următorul episod:</span>
                            {show.next_episode_to_air && (
                              <Badge variant="default" className="text-xs">
                                S{show.next_episode_to_air.season_number}E{show.next_episode_to_air.episode_number}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mb-2">
                            {show.next_episode_to_air?.name}
                          </div>
                          <CountdownTimer 
                            target={nextEpisodeDate}
                            className="text-center text-xs font-mono"
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        {hasUpcomingEpisode && nextEpisodeDate && (
                          <ReminderButton
                            when={nextEpisodeDate}
                            kind="event"
                            entityId={`tv-${show.id}`}
                          />
                        )}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://www.themoviedb.org/tv/${show.id}`, '_blank');
                          }}
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Vezi pe TMDB
                        </Button>
                      </div>
                    </div>
                  </div>
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
            <div className="mt-16 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Explorează Programul TV</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Vezi ce este la TV acum și ce urmează în program. Găsește serialele tale preferate pe canalele românești.
              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={() => navigate('/tv/program')} size="lg">
                  <Tv className="w-5 h-5 mr-2" />
                  Program TV
                </Button>
                <Button onClick={() => navigate('/tv/emisiuni')} variant="outline" size="lg">
                  Emisiuni Românești
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  );
}