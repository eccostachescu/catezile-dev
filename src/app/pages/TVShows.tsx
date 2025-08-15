import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/seo/SEO';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TVEpisodeCard } from '@/components/cards/TVEpisodeCard';
import { CalendarDays } from 'lucide-react';

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

  // Filter out past episodes to avoid showing them in popular
  const filteredEpisodes = episodes.filter(episode => {
    const airDate = new Date(episode.airstamp);
    const now = new Date();
    
    if (filter === 'all') {
      // Only show future episodes for "all" to match popular behavior
      return airDate.getTime() >= now.getTime();
    }
    
    return true; // Keep existing logic for other filters
  });

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
                <div key={index} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nu sunt episoade programate</h3>
              <p className="text-muted-foreground">
                Încercați să schimbați filtrul sau reveniți mai târziu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEpisodes.map((episode) => (
                <TVEpisodeCard 
                  key={episode.tvmaze_episode_id} 
                  episode={episode}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}