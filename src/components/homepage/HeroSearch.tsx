import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Chip } from '@/components/ui/cz-chip';
import { supabase } from '@/integrations/supabase/client';

interface HeroSearchProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  onSearchFocus?: () => void;
  activeFilter?: string;
}

const filters = [
  { key: 'popular', label: 'Populare', default: true },
  { key: 'today', label: 'Astăzi' },
  { key: 'tomorrow', label: 'Mâine' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'month', label: 'Luna asta' },
];

export default function HeroSearch({ onSearch, onFilterChange, onSearchFocus, activeFilter = 'popular' }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleFilterClick = (filterKey: string) => {
    onFilterChange?.(filterKey);
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24" style={{ background: 'var(--cz-hero-grad)' }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="text-[42px] md:text-[56px] leading-[1.05] tracking-[-0.01em] font-bold text-[--cz-ink] mb-4">
            Calendarul României
          </h1>
          
          {/* Subtitle */}
          <p className="text-[18px] md:text-[20px] text-[--cz-ink-muted] mb-8">
            Meciuri, filme, sărbători și evenimente — cu remindere smart.
          </p>

          {/* Search Bar XL */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-[--cz-ink-muted] h-5 w-5" />
              <input
                type="text"
                placeholder="Caută meciuri, filme, evenimente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => onSearchFocus?.()}
                className="w-full pl-14 pr-24 py-4 md:py-5 bg-[--cz-surface] border border-[--cz-border] rounded-full text-lg text-[--cz-ink] placeholder-[--cz-ink-muted] focus:outline-none focus:ring-2 focus:ring-[--cz-primary] focus:border-transparent"
                style={{ boxShadow: 'var(--cz-shadow)' }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[--cz-primary] text-white px-6 py-2 md:py-3 rounded-full hover:bg-[--cz-primary-600] transition-colors font-medium"
              >
                Caută
              </button>
            </div>
          </form>

          {/* Filter Chips */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
            {filters.map((filter) => (
              <Chip
                key={filter.key}
                active={activeFilter === filter.key}
                onClick={() => handleFilterClick(filter.key)}
                className="text-sm md:text-base"
              >
                {filter.label}
              </Chip>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {/* LIVE Button - Only show when live events exist */}
            <LiveNowButton />
            
            <button className="bg-[--cz-accent] text-black px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity">
              Creează countdown
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// LiveNowButton Component
function LiveNowButton() {
  const [hasLiveEvents, setHasLiveEvents] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkLiveEvents() {
      try {
        const { data, error } = await supabase.functions.invoke('live_events_count');
        if (!error && data?.count > 0) {
          setHasLiveEvents(true);
        }
      } catch (err) {
        console.log('Error checking live events:', err);
      } finally {
        setLoading(false);
      }
    }

    checkLiveEvents();
  }, []);

  const handleLiveClick = () => {
    const liveSection = document.getElementById('live-now');
    if (liveSection) {
      liveSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Analytics
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Hero Live Button Click');
    }
  };

  if (loading || !hasLiveEvents) return null;

  return (
    <button
      onClick={handleLiveClick}
      className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-red-500/25"
      style={{ animation: 'live-pulse 1.5s ease-in-out infinite' }}
    >
      LIVE acum
    </button>
  );
}