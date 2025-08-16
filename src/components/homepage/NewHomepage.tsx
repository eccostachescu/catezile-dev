import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeroSearchNew from "./HeroSearchNew";
import LiveNowSection from "./LiveNowSection";
import CardCountdown from "./CardCountdown";
import { RailWeekend } from "./RailWeekend";
import { TvNow } from "./TvNow";
import PopularShows from "@/components/tv/PopularShows";

interface PopularEvent {
  id: string;
  title: string;
  slug: string;
  starts_at: string;
  image_url?: string;
  city?: string;
  category_name?: string;
  category_slug?: string;
  source?: string;
}

export default function NewHomepage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PopularEvent[]>([]);
  const [weekendEvents, setWeekendEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('popular');

  useEffect(() => {
    const fetchPopularEvents = async () => {
      try {
        // Get popular countdowns (now with sample data that has images)
        const { data, error } = await supabase.functions.invoke('popular_countdowns', {
          body: { 
            limit: 12, 
            onlyWithImage: false, // We'll handle fallbacks in the component
            exclude_past: true // Exclude past events from popular section
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

    const fetchWeekendEvents = async () => {
      try {
        const now = new Date();
        const nextSaturday = new Date(now);
        const daysUntilSaturday = (6 - now.getDay()) % 7;
        nextSaturday.setDate(now.getDate() + daysUntilSaturday);
        nextSaturday.setHours(0, 0, 0, 0);
        
        const nextSunday = new Date(nextSaturday);
        nextSunday.setDate(nextSaturday.getDate() + 1);
        nextSunday.setHours(23, 59, 59, 999);

        // Get weekend matches
        const { data: matches } = await supabase
          .from('match')
          .select('id, home, away, kickoff_at, image_url, slug')
          .gte('kickoff_at', nextSaturday.toISOString())
          .lte('kickoff_at', nextSunday.toISOString())
          .order('kickoff_at')
          .limit(8);

        // Get weekend events
        const { data: weekendEvs } = await supabase
          .from('event')
          .select('id, title, start_at, image_url, slug, city, category_id')
          .eq('status', 'PUBLISHED')
          .gte('start_at', nextSaturday.toISOString())
          .lte('start_at', nextSunday.toISOString())
          .order('start_at')
          .limit(8);

        // Transform and combine data
        const transformedMatches = (matches || []).map(match => ({
          id: match.id,
          title: `${match.home} vs ${match.away}`,
          slug: match.slug || `/sport/${match.id}`,
          startDate: match.kickoff_at,
          imageUrl: match.image_url,
          category: 'Sport',
          categorySlug: 'sport'
        }));

        const transformedEvents = (weekendEvs || []).map(event => ({
          id: event.id,
          title: event.title,
          slug: event.slug || `/evenimente/${event.id}`,
          startDate: event.start_at,
          imageUrl: event.image_url,
          location: event.city,
          category: 'Evenimente',
          categorySlug: 'evenimente'
        }));

        const allWeekendEvents = [...transformedMatches, ...transformedEvents]
          .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
          .slice(0, 12);

        setWeekendEvents(allWeekendEvents);
      } catch (error) {
        console.error('Error fetching weekend events:', error);
      }
    };

    fetchPopularEvents();
    fetchWeekendEvents();
  }, []);

  // Debug effect to log event data structure
  useEffect(() => {
    console.log('🔍 Events loaded:', events);
    console.log('🔍 First event structure:', events[0]);
    if (events.length > 0) {
      console.log('🔍 Event properties:', Object.keys(events[0]));
      console.log('🔍 Event slug:', events[0].slug);
      console.log('🔍 Event id:', events[0].id);
    }
  }, [events]);

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
    if (event) {
      // Debug logging to see what we have
      console.log('Clicking event:', event);
      console.log('Event source:', event.source);
      console.log('Event category:', event.category_slug);
      
      // Route based on event source/type
      let path;
      if (event.source === 'match_api' || event.category_slug === 'sport') {
        // Sports matches go to /sport/ route
        path = `/sport/${event.slug || eventId}`;
      } else if (event.source === 'movie_api' || event.category_slug === 'filme') {
        // Movies go to /filme/ route  
        path = `/filme/${event.slug || eventId}`;
      } else {
        // Regular events go to /evenimente/ route
        path = `/evenimente/${event.slug || eventId}`;
      }
      
      console.log('Navigating to:', path);
      navigate(path);
    } else {
      console.error('Event not found for ID:', eventId);
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
                  source={event.source}
                  category_slug={event.category_slug}
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
      <section className="py-12" style={{ backgroundColor: 'var(--cz-surface)' }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-h2 font-bold text-[--cz-ink]">
              În acest weekend
            </h2>
          </div>
          <RailWeekend events={weekendEvents} />
        </div>
      </section>

      {/* TV Now Section */}
      <TvNow />
      
      {/* Popular TV Shows Section */}
      <PopularShows />
    </main>
  );
}