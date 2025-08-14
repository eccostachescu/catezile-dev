import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import HeroSearch from './HeroSearch';
import CardCountdown from './CardCountdown';
import { RailWeekend } from './RailWeekend';
import { TvNow } from './TvNow';
import { SkeletonCard } from '@/components/ui/cz-skeleton';

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
    async function fetchPopularEvents() {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('popular_countdowns', {
          body: { 
            limit: 12, 
            offset: 0,
            onlyWithImage: true // Only show events with images
          }
        });

        if (error) throw error;
        
        setEvents(data?.events || []);
        
        // Track homepage view
        if (typeof window !== 'undefined' && window.plausible) {
          window.plausible('Homepage View');
        }
      } catch (err) {
        console.error('Error fetching popular events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPopularEvents();
  }, []);

  const handleReminderClick = (id: string) => {
    console.log('Setting reminder for:', id);
    
    // Track reminder click
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('reminder_click', {
        props: { source: 'homepage', event_id: id }
      });
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    
    // Track filter selection
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('hero_chip_select', {
        props: { filter }
      });
    }
  };

  const handleCardClick = (type: 'popular' | 'weekend', eventId: string) => {
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible(`${type}_card_click`, {
        props: { eventId }
      });
    }
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    
    // Track search
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('search_submit', {
        props: { query: query.substring(0, 50) } // Limit query length for privacy
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSearch
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onSearchFocus={() => console.log('Search focused')}
        activeFilter={activeFilter}
      />

      {/* Live Now Section - Only show when live events exist */}
      <LiveNowSection />

      {/* Popular Countdowns */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-h2 font-semibold text-[--cz-ink]">
              Cele mai populare countdown-uri
            </h2>
            <button className="text-[--cz-ink-muted] hover:text-[--cz-ink] text-sm font-medium transition-colors">
              Vezi toate →
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.18, 
                    delay: index * 0.05,
                    ease: [0.2, 0.8, 0.2, 1] 
                  }}
                  onClick={() => handleCardClick('popular', event.id)}
                >
                  <CardCountdown
                    id={event.id}
                    title={event.title}
                    slug={event.slug}
                    startDate={event.starts_at}
                    imageUrl={event.image_url}
                    location={event.city}
                    category={event.category_name}
                    rank={index + 1}
                    onReminderClick={handleReminderClick}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Weekend Section */}
      <section className="py-12 bg-[--cz-surface]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-h2 font-semibold text-[--cz-ink]">În weekend</h2>
            <button className="text-[--cz-ink-muted] hover:text-[--cz-ink] text-sm font-medium transition-colors">
              Vezi tot weekendul →
            </button>
          </div>
          
          <RailWeekend 
            events={[]} // Would be populated with weekend events
            onReminderClick={handleReminderClick}
            onCardClick={(eventId) => handleCardClick('weekend', eventId)}
          />
        </div>
      </section>

      {/* TV Now Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <TvNow />
        </div>
      </section>
    </div>
  );
}

// Live Now Section Component
function LiveNowSection() {
  const [liveEvents, setLiveEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLiveEvents() {
      try {
        const { data, error } = await supabase.functions.invoke('live_events');
        if (!error && data?.events?.length > 0) {
          setLiveEvents(data.events);
        }
      } catch (err) {
        console.log('Error fetching live events:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLiveEvents();
  }, []);

  if (loading || liveEvents.length === 0) return null;

  return (
    <section id="live-now" className="py-8 bg-red-50 dark:bg-red-950/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 font-semibold text-[--cz-ink] flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            LIVE acum
          </h2>
          <a 
            href="/sport/live" 
            className="text-[--cz-ink-muted] hover:text-[--cz-ink] text-sm font-medium transition-colors"
          >
            Vezi toate live →
          </a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {liveEvents.slice(0, 4).map((event: any, index) => (
            <CardCountdown
              key={event.id}
              id={event.id}
              title={event.title}
              slug={event.slug}
              startDate={event.start_date}
              imageUrl={event.image_url}
              location={event.location}
              category={event.category}
              status="live"
              rank={index + 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}