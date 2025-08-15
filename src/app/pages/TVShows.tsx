import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/seo/SEO';
import Container from '@/components/Container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CountdownTimer from '@/components/CountdownTimer';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Clock, Eye } from 'lucide-react';

interface TVEpisode {
  id: number;
  tvmaze_episode_id: number;
  name?: string;
  season?: number;
  number?: number;
  airstamp: string;
  show_name: string;
  show_genres?: string[];
  show_image_url?: string;
  show_slug?: string;
  network_name?: string;
  runtime?: number;
  summary?: string;
}

export function TVShows() {
  const [episodes, setEpisodes] = useState<TVEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

  useEffect(() => {
    loadUpcomingEpisodes();
  }, [filter]);

  const loadUpcomingEpisodes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('v_tv_episodes_upcoming')
        .select('*')
        .order('airstamp', { ascending: true });

      // Apply filters
      const now = new Date();
      if (filter === 'today') {
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.lte('airstamp', endOfDay.toISOString());
      } else if (filter === 'week') {
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        query = query.lte('airstamp', nextWeek.toISOString());
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error loading episodes:', error);
        return;
      }

      setEpisodes((data || []) as TVEpisode[]);
    } catch (error) {
      console.error('Error loading episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatEpisodeNumber = (season?: number, number?: number) => {
    if (!season || !number) return '';
    return `S${season.toString().padStart(2, '0')}E${number.toString().padStart(2, '0')}`;
  };

  const getTimeUntilAiring = (airstamp: string) => {
    const airDate = new Date(airstamp);
    const now = new Date();
    const diff = airDate.getTime() - now.getTime();
    
    if (diff < 0) return 'Aired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 72) {
      return <CountdownTimer target={airDate} />;
    }
    
    const days = Math.floor(hours / 24);
    return `în ${days} zile`;
  };

  return (
    <>
      <SEO 
        title="Emisiuni TV România - Următoarele Episoade"
        description="Urmărește următoarele episoade din emisiunile TV românești și internaționale. Countdown-uri pentru episoadele favorite."
        path="/tv/emisiuni"
      />
      
      <Container>
        <div className="py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Emisiuni TV România</h1>
            <p className="text-muted-foreground mb-6">
              Următoarele episoade din emisiunile tale favorite. Adaugă reminder-uri pentru a nu rata nimic!
            </p>
            
            {/* Filters */}
            <div className="flex gap-2 mb-6">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                Toate
              </Button>
              <Button
                variant={filter === 'today' ? 'default' : 'outline'}
                onClick={() => setFilter('today')}
              >
                Astăzi
              </Button>
              <Button
                variant={filter === 'week' ? 'default' : 'outline'}
                onClick={() => setFilter('week')}
              >
                Săptămâna aceasta
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="p-4">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : episodes.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nu sunt episoade programate</h3>
              <p className="text-muted-foreground">
                Încercați să schimbați filtrul sau reveniți mai târziu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map((episode) => (
                <Card key={episode.tvmaze_episode_id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  {/* Episode Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary/10 to-primary/5">
                    {episode.show_image_url ? (
                      <img
                        src={episode.show_image_url}
                        alt={episode.show_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Eye className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Countdown overlay */}
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                        {getTimeUntilAiring(episode.airstamp)}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Show title */}
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {episode.show_name}
                    </h3>
                    
                    {/* Episode info */}
                    {(episode.season || episode.number) && (
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {formatEpisodeNumber(episode.season, episode.number)}
                        </Badge>
                        {episode.name && (
                          <span className="text-sm text-muted-foreground truncate">
                            {episode.name}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Air time and network */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(episode.airstamp).toLocaleDateString('ro-RO', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      {episode.network_name && (
                        <Badge variant="secondary" className="text-xs">
                          {episode.network_name}
                        </Badge>
                      )}
                    </div>

                    {/* Summary */}
                    {episode.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {episode.summary}
                      </p>
                    )}

                    {/* Genres */}
                    {episode.show_genres && episode.show_genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {episode.show_genres.slice(0, 3).map((genre, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        Adaugă Reminder
                      </Button>
                      {episode.show_slug && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={`/tv/${episode.show_slug}`}>
                            Detalii
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}