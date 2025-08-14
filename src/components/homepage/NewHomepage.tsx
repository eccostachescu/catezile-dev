import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { HeroSearch } from './HeroSearch';
import { CardCountdown } from './CardCountdown';
import { RailWeekend } from './RailWeekend';
import { TvNow } from './TvNow';
import { Section } from '@/components/ui/cz-section';
import { Button } from '@/components/ui/cz-button';
import { Chip } from '@/components/ui/cz-chip';
import { SkeletonCard } from '@/components/ui/cz-skeleton';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}

export function NewHomepage() {
  const [popularEvents, setPopularEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('popular');

  useEffect(() => {
    // Track homepage view
    window.plausible?.('home_view');
    
    const fetchPopularEvents = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('popular_countdowns', {
          body: { limit: 12 }
        });
        
        if (error) throw error;
        setPopularEvents(data?.events || []);
      } catch (error) {
        console.error('Failed to fetch popular events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularEvents();
  }, []);

  const handleReminderClick = (id: string) => {
    window.plausible?.('reminder_set', { props: { source: 'homepage', eventId: id } });
    console.log('Setting reminder for:', id);
  };

  const handleFilterChange = (filter: string) => {
    window.plausible?.('chip_filter_select', { props: { filter } });
    setActiveFilter(filter);
  };

  const handleCardClick = (type: 'popular' | 'weekend', eventId: string) => {
    window.plausible?.(`${type}_card_click`, { props: { eventId } });
  };

  return (
    <div className="min-h-screen bg-cz-bg">
      {/* Hero Section */}
      <section className="relative bg-cz-hero py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <HeroSearch 
            activeFilter={activeFilter}
            onFilterChange={handleFilterChange}
            onSearch={(query) => window.plausible?.('search_submit', { props: { query } })}
            onSearchFocus={() => window.plausible?.('search_focus')}
          />
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Popular Countdowns */}
        <Section
          title="Cele mai populare countdown-uri"
          action={
            <Link to="/populare" className="inline-flex items-center gap-2 text-sm text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast">
              Vezi toate <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
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
              {popularEvents.map((event: any, index) => (
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
        </Section>

        {/* Weekend Events */}
        <Section
          title="În weekend"
          action={
            <Link to="/weekend" className="inline-flex items-center gap-2 text-sm text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast">
              Vezi tot weekendul <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <RailWeekend 
            events={[]} // Would be populated with weekend events
            onReminderClick={handleReminderClick}
            onCardClick={(eventId) => handleCardClick('weekend', eventId)}
          />
        </Section>

        {/* TV Now */}
        <Section>
          <TvNow 
            liveMatches={[]} // Would be populated with live matches
            upcomingPrograms={[]} // Would be populated with upcoming programs
            onTvClick={() => window.plausible?.('tvnow_click')}
          />
        </Section>
      </div>
    </div>
  );
}