import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/cz-button';
import CardCountdown from './CardCountdown';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface WeekendEvent {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  categorySlug?: string;
}

interface RailWeekendProps {
  events: WeekendEvent[];
  onReminderClick?: (id: string) => void;
  onCardClick?: (eventId: string) => void;
  className?: string;
}

export function RailWeekend({ events, onReminderClick, onCardClick, className }: RailWeekendProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = 320; // Width of card + gap
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  const canScrollLeft = () => scrollRef.current?.scrollLeft > 0;
  const canScrollRight = () => {
    if (!scrollRef.current) return false;
    return scrollRef.current.scrollLeft < (scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
  };

  if (!events.length) {
    return (
      <div className="text-center py-12 text-cz-muted">
        <p>Nu sunt evenimente programate în weekend.</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Navigation Buttons */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronLeft className="h-4 w-4" />}
          onClick={() => scroll('left')}
          className="rounded-full bg-cz-surface/80 backdrop-blur-sm border border-cz-border shadow-lg hover:bg-cz-surface"
          disabled={!canScrollLeft()}
        />
      </div>
      
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
        <Button
          variant="ghost"
          size="sm"
          icon={<ChevronRight className="h-4 w-4" />}
          onClick={() => scroll('right')}
          className="rounded-full bg-cz-surface/80 backdrop-blur-sm border border-cz-border shadow-lg hover:bg-cz-surface"
          disabled={!canScrollRight()}
        />
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth",
          "snap-x snap-mandatory"
        )}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {events.map((event) => (
          <motion.div 
            key={event.id} 
            className="flex-none w-[280px] snap-start"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardCountdown
                  id={event.id}
                  title={event.title}
                  slug={event.slug}
                  startDate={event.startDate}
                  imageUrl={event.imageUrl}
                  location={event.location}
                  category={event.category}
                  onReminderClick={onReminderClick}
            />
          </motion.div>
        ))}
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `
      }} />
    </div>
  );
}