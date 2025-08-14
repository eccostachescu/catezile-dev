import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/cz-button";
import { supabase } from "@/integrations/supabase/client";

interface HeroSearchNewProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
}

const filters = [
  { key: 'popular', label: 'Populare' },
  { key: 'today', label: 'Astăzi' },
  { key: 'tomorrow', label: 'Mâine' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'month', label: 'Luna asta' },
];

export default function HeroSearchNew({ onSearch, onFilterChange, activeFilter = 'popular' }: HeroSearchNewProps) {
  const [query, setQuery] = useState('');
  const [showLiveButton, setShowLiveButton] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleFilterClick = (filterKey: string) => {
    if (onFilterChange) {
      onFilterChange(filterKey);
    }
  };

  const handleLiveClick = () => {
    // Scroll to live section
    const liveSection = document.getElementById('live-now');
    if (liveSection) {
      liveSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative py-16 px-4" style={{ 
      background: 'var(--cz-hero-grad)',
      backgroundColor: 'var(--cz-bg)'
    }}>
      <div className="container mx-auto max-w-4xl text-center">
        {/* Main heading */}
        <h1 className="text-hero font-bold text-[--cz-ink] mb-4">
          Calendarul României
        </h1>
        
        {/* Subheading */}
        <p className="text-subtitle text-[--cz-ink-muted] mb-8 max-w-2xl mx-auto">
          Meciuri, filme, sărbători și evenimente — cu remindere smart.
        </p>

        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[--cz-ink-muted]" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Caută evenimente, meciuri, filme..."
              className="w-full pl-12 pr-32 py-4 text-lg rounded-full border border-[--cz-border] bg-[--cz-surface] text-[--cz-ink] placeholder-[--cz-ink-muted] focus:outline-none focus:ring-2 focus:ring-[--cz-primary] shadow-lg"
              style={{ boxShadow: 'var(--cz-shadow)' }}
            />
            <button
              type="submit"
              className="absolute right-2 top-2 bottom-2 px-6 bg-[--cz-primary] text-white rounded-full hover:bg-[--cz-primary-600] transition-colors font-medium"
            >
              Caută
            </button>
          </div>
        </form>

        {/* Filter chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === filter.key
                  ? 'bg-[--cz-primary] text-white shadow-md'
                  : 'bg-[--cz-surface] text-[--cz-ink] hover:bg-[--cz-border] border border-[--cz-border]'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <LiveNowButton onLiveClick={handleLiveClick} />
          <Button 
            variant="accent" 
            size="lg"
            onClick={() => {
              window.location.href = '/creeaza';
            }}
          >
            Creează countdown
          </Button>
        </div>
      </div>
    </section>
  );
}

// Component to conditionally show LIVE button
function LiveNowButton({ onLiveClick }: { onLiveClick: () => void }) {
  const [liveCount, setLiveCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLiveEvents = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('live_events_count');
        if (!error && data) {
          setLiveCount(data.count || 0);
        }
      } catch (error) {
        console.error('Error checking live events:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLiveEvents();
  }, []);

  // Don't show button if no live events or still loading
  if (loading || liveCount === 0) {
    return null;
  }

  return (
    <Button 
      variant="accent" 
      size="lg"
      onClick={onLiveClick}
      className="bg-red-600 hover:bg-red-700 text-white"
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        LIVE acum
      </div>
    </Button>
  );
}