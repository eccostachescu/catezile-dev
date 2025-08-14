import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';
import CountdownCard from '@/components/cards/CountdownCard';
import { Skeleton } from '@/components/ui/skeleton';

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
}

export default function PopularSection() {
  const [events, setEvents] = useState<PopularEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const response = await fetch('https://ibihfzhrsllndxhfwgvb.supabase.co/functions/v1/popular_countdowns?limit=8');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Popular countdowns data:', data);
        setEvents(data.events || []);
      } catch (error) {
        console.error('Failed to fetch popular countdowns:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopular();
  }, []);

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Cele mai populare</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold">Cele mai populare countdown-uri</h2>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/populare" className="gap-2">
            Vezi toate <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          />
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nu sunt evenimente populare momentan.</p>
        </div>
      )}
    </section>
  );
}