import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import HeroSearchNew from "./HeroSearchNew";
import LiveNowSection from "./LiveNowSection";
import CardCountdown from "./CardCountdown";
import { RailWeekend } from "./RailWeekend";
import { TvNow } from "./TvNow";

interface PopularEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  image_url?: string;
  city?: string;
  category_name?: string;
}

export default function NewHomepage() {
  const [events, setEvents] = useState<PopularEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('popular');

  useEffect(() => {
    const fetchPopularEvents = async () => {
      try {
        // Use the updated endpoint with onlyWithImage=1 filter
        const { data, error } = await supabase.functions.invoke('popular_countdowns', {
          body: { 
            limit: 12, 
            onlyWithImage: true // Only show events with images
          }
        });

        if (error) {
          console.error('Error fetching popular events:', error);
          return;
        }

        const eventData = data?.events || [];
        setEvents(eventData);
      } catch (error) {
        console.error('Error in popular events fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularEvents();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/cauta?q=${encodeURIComponent(query)}`;
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    // TODO: Implement filter logic for popular events
    console.log('Filter changed to:', filter);
  };

  const handleReminderClick = (eventId: string) => {
    console.log('Reminder clicked for event:', eventId);
    // Implement reminder functionality
  };

  const handleCardClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event?.slug) {
      window.location.href = `/countdown/${event.slug}`;
    }
  };

  return (
    <main>
      {/* Hero Section with Search */}
      <HeroSearchNew 
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        activeFilter={activeFilter}
      />

      {/* Live Now Section - only shows if there are live events */}
      <LiveNowSection 
        onCardClick={handleCardClick}
        onReminderClick={handleReminderClick}
      />

      {/* Popular Countdowns Section */}
      <section className="py-12" style={{ backgroundColor: 'var(--cz-bg)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-h2 font-bold text-[--cz-ink]">
              Cele mai populare countdown-uri
            </h2>
            <button
              onClick={() => window.location.href = '/populare'}
              className="text-sm font-medium text-[--cz-primary] hover:text-[--cz-primary-600] transition-colors"
            >
              Vezi toate →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-[--cz-surface] rounded-2xl p-4 border border-[--cz-border] animate-pulse">
                  <div className="aspect-video bg-[--cz-border] rounded-xl mb-4"></div>
                  <div className="h-4 bg-[--cz-border] rounded mb-2"></div>
                  <div className="h-3 bg-[--cz-border] rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event, index) => (
                <CardCountdown
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  slug={event.slug}
                  startDate={event.starts_at}
                  imageUrl={event.image_url}
                  location={event.city}
                  category={event.category_name || 'Evenimente'}
                  rank={index + 1}
                  onReminderClick={() => handleReminderClick(event.id)}
                />
              ))}
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[--cz-ink-muted]">Nu sunt evenimente disponibile momentan.</p>
            </div>
          )}
        </div>
      </section>

      {/* Weekend Section */}
      <RailWeekend events={[]} />

      {/* TV Now Section */}
      <TvNow />
    </main>
  );
}