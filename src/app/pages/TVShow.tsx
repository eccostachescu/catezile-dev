import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SEO } from '@/seo/SEO';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  Star, 
  Play, 
  Bell, 
  ArrowLeft, 
  ExternalLink,
  Tv,
  Users,
  Globe
} from 'lucide-react';
import { tmdbService } from '@/services/tmdb';

interface TVShowDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  last_air_date: string;
  genres: Array<{ id: number; name: string }>;
  vote_average: number;
  vote_count: number;
  popularity: number;
  number_of_seasons: number;
  number_of_episodes: number;
  status: string;
  tagline: string;
  networks: Array<{ id: number; name: string; logo_path: string }>;
  created_by: Array<{ id: number; name: string }>;
  next_episode_to_air?: {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
    runtime: number;
  };
  last_episode_to_air?: {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
  };
  external_ids: {
    imdb_id: string;
    facebook_id: string;
    instagram_id: string;
    twitter_id: string;
  };
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function TVShow() {
  const { showId, slug } = useParams<{ showId: string; slug: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState<TVShowDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<CountdownTime | null>(null);
  const [isAiring, setIsAiring] = useState(false);

  useEffect(() => {
    if (showId) {
      loadShowDetails();
    }
  }, [showId]);

  useEffect(() => {
    if (!show?.next_episode_to_air?.air_date) return;

    const updateCountdown = () => {
      const timeData = tmdbService.getTimeUntilAiring(show.next_episode_to_air!.air_date);
      
      if (timeData) {
        setCountdown({
          days: timeData.days,
          hours: timeData.hours,
          minutes: timeData.minutes,
          seconds: timeData.seconds
        });
        setIsAiring(false);
      } else {
        setCountdown(null);
        setIsAiring(true);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [show?.next_episode_to_air?.air_date]);

  const loadShowDetails = async () => {
    try {
      setLoading(true);
      // For now, TV show details are not available via edge functions
      // This would need a new edge function to be implemented
      console.warn('TV show details page not fully implemented - needs edge function');
      setShow(null);
    } catch (error) {
      console.error('Error loading show details:', error);
      setShow(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Returning Series': 'În producție',
      'Ended': 'Terminat',
      'Canceled': 'Anulat',
      'In Production': 'În producție',
      'Planned': 'Planificat'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <Container className="py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!show) {
    return (
      <Container className="py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Serial not found</h1>
          <Button onClick={() => navigate('/tv')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to TV Shows
          </Button>
        </div>
      </Container>
    );
  }

  const posterUrl = tmdbService.getImageURL(show.poster_path, 'w500');
  const backdropUrl = tmdbService.getImageURL(show.backdrop_path, 'w1280');

  return (
    <>
      <SEO 
        title={`${show.name} — Detalii Serial TV`}
        description={show.overview || `Informații complete despre serialul ${show.name}`}
        path={`/tv/show/${showId}/${slug}`}
      />
      
      <div className="min-h-screen">
        {/* Hero Section with Backdrop */}
        <div 
          className="relative h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          
          <Container className="relative h-full flex flex-col justify-between py-8">
            {/* Back Button */}
            <div>
              <Button 
                variant="ghost" 
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/tv')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Înapoi la Seriale
              </Button>
            </div>

            {/* Show Title and Basic Info */}
            <div className="text-white">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white border-0">
                  <Tv className="w-3 h-3 mr-1" />
                  TV Series
                </Badge>
                {isAiring && (
                  <Badge variant="destructive" className="animate-pulse">
                    LIVE ACUM
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{show.name}</h1>
              
              {show.tagline && (
                <p className="text-xl text-white/90 mb-4 italic">"{show.tagline}"</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{show.vote_average.toFixed(1)}</span>
                  <span className="ml-1 text-sm">({show.vote_count} voturi)</span>
                </div>
                <span>•</span>
                <span>{show.number_of_seasons} {show.number_of_seasons === 1 ? 'sezon' : 'sezoane'}</span>
                <span>•</span>
                <span>{show.number_of_episodes} episoade</span>
                <span>•</span>
                <span>{getStatusText(show.status)}</span>
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Next Episode Countdown */}
              {show.next_episode_to_air && (
                <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tv className="w-5 h-5" />
                      Următorul Episod
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          S{show.next_episode_to_air.season_number}E{show.next_episode_to_air.episode_number}: {show.next_episode_to_air.name}
                        </h3>
                        <p className="text-muted-foreground">
                          Difuzare: {formatDate(show.next_episode_to_air.air_date)}
                        </p>
                      </div>

                      {countdown && (
                        <div className="p-4 bg-background rounded-lg border">
                          <p className="text-center text-sm font-medium text-muted-foreground mb-3">
                            Începe în:
                          </p>
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-primary">{countdown.days}</div>
                              <div className="text-sm text-muted-foreground">Zile</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-primary">{countdown.hours}</div>
                              <div className="text-sm text-muted-foreground">Ore</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-primary">{countdown.minutes}</div>
                              <div className="text-sm text-muted-foreground">Min</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-primary">{countdown.seconds}</div>
                              <div className="text-sm text-muted-foreground">Sec</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {show.next_episode_to_air.overview && (
                        <p className="text-sm text-muted-foreground">
                          {show.next_episode_to_air.overview}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Button className="flex-1">
                          <Bell className="w-4 h-4 mr-2" />
                          Setează Reminder
                        </Button>
                        <Button variant="outline">
                          <Star className="w-4 h-4 mr-2" />
                          Adaugă la Favorite
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* What is this show section */}
              <Card>
                <CardHeader>
                  <CardTitle>Ce este {show.name}?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {show.overview || 'Nu există descriere disponibilă pentru acest serial.'}
                  </p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {show.genres.map((genre) => (
                      <Badge key={genre.id} variant="secondary">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Creators */}
              {show.created_by && show.created_by.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Creatori
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {show.created_by.map((creator) => (
                        <Badge key={creator.id} variant="outline">
                          {creator.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Poster */}
              <div className="aspect-[2/3] overflow-hidden rounded-lg border">
                {posterUrl ? (
                  <img 
                    src={posterUrl} 
                    alt={show.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Show Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informații</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Prima difuzare</h4>
                    <p>{formatDate(show.first_air_date)}</p>
                  </div>
                  
                  {show.last_air_date && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground">Ultima difuzare</h4>
                      <p>{formatDate(show.last_air_date)}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Status</h4>
                    <p>{getStatusText(show.status)}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Sezoane</h4>
                    <p>{show.number_of_seasons}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Episoade</h4>
                    <p>{show.number_of_episodes}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Networks */}
              {show.networks && show.networks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rețele</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {show.networks.map((network) => (
                        <div key={network.id} className="flex items-center gap-2">
                          {network.logo_path && (
                            <img 
                              src={tmdbService.getImageURL(network.logo_path, 'w92')}
                              alt={network.name}
                              className="h-6 object-contain"
                            />
                          )}
                          <span>{network.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* External Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Link-uri Externe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {show.external_ids.imdb_id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => window.open(`https://www.imdb.com/title/${show.external_ids.imdb_id}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Vizualizează pe IMDB
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => window.open(`https://www.themoviedb.org/tv/${show.id}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Vizualizează pe TMDB
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </>
  );
}