import { useState, useEffect } from 'react';
import Container from '@/components/Container';
import { SEO } from '@/seo/SEO';
import CountdownCard from '@/components/cards/CountdownCard';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PopularEvent {
  id: string;
  slug: string;
  title: string;
  starts_at: string;
  image_url?: string;
  city?: string;
  category_name?: string;
  category_slug?: string;
  score: number;
  source?: string; // Add source field
}

export default function Popular() {
  const [events, setEvents] = useState<PopularEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        // Use edge function for popular countdowns
        const { data, error } = await supabase.functions.invoke('popular_countdowns', {
          body: { limit: 50 }
        });
        
        if (error) {
          throw error;
        }
        
        setEvents(data?.events || []);
      } catch (error) {
        console.error('Failed to fetch popular countdowns:', error);
        setError('Nu am putut încărca countdown-urile populare');
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  if (loading) {
    return (
      <>
        <SEO
          title="Cele mai populare countdown-uri | Câte zile până la..."
          description="Descoperă cele mai populare countdown-uri: meciuri, filme, sărbători și evenimente urmărite de comunitatea română."
          path="/populare"
        />
        
        <Container className="py-8">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <h1 className="text-3xl font-bold">Cele mai populare countdown-uri</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Descoperă evenimentele, meciurile, filmele și sărbătorile urmărite de comunitatea română
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
              ))}
            </div>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SEO
          title="Cele mai populare countdown-uri | Câte zile până la..."
          description="Descoperă cele mai populare countdown-uri: meciuri, filme, sărbători și evenimente urmărite de comunitatea română."
          path="/populare"
        />
        
        <Container className="py-8">
          <div className="text-center space-y-4">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h1 className="text-3xl font-bold">Cele mai populare countdown-uri</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO
        title="Cele mai populare countdown-uri | Câte zile până la..."
        description="Descoperă cele mai populare countdown-uri: meciuri, filme, sărbători și evenimente urmărite de comunitatea română."
        path="/populare"
      />
      
      <Container className="py-8">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Cele mai populare countdown-uri</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cele mai urmărite evenimente din ultimele 7 zile - actualizat în timp real
            </p>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nu sunt countdown-uri populare momentan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event, index) => (
                <CountdownCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  slug={event.slug}
                  startDate={event.starts_at}
                  imageUrl={event.image_url}
                  city={event.city}
                  category={event.category_name}
                  categorySlug={event.category_slug}
                  rank={index + 1}
                  score={event.score}
                  source={event.source} // Pass source for correct routing
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </>
  );
}