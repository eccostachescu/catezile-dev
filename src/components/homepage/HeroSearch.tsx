import React, { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { Chip } from '@/components/ui/cz-chip';
import { cn } from '@/lib/utils';

interface HeroSearchProps {
  onSearch?: (query: string) => void;
  onFilterChange?: (filter: string) => void;
  activeFilter?: string;
}

const filters = [
  { key: 'popular', label: 'Populare', default: true },
  { key: 'today', label: 'Astăzi' },
  { key: 'tomorrow', label: 'Mâine' },
  { key: 'weekend', label: 'Weekend' },
  { key: 'month', label: 'Luna asta' },
];

export function HeroSearch({ onSearch, onFilterChange, activeFilter = 'popular' }: HeroSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const handleFilterClick = (filterKey: string) => {
    onFilterChange?.(filterKey);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Title */}
      <div className="text-center space-y-3">
        <h1 className="text-hero font-heading font-bold text-cz-foreground">
          Calendarul României
        </h1>
        <p className="text-lg text-cz-muted max-w-2xl mx-auto">
          Meciuri, filme, sărbători și evenimente — cu remindere smart
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cz-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută evenimente, filme, sport..."
            className={cn(
              "w-full h-14 pl-12 pr-6 rounded-full",
              "bg-cz-surface border border-cz-border",
              "text-cz-foreground placeholder:text-cz-muted",
              "focus:outline-none focus:ring-2 focus:ring-cz-accent focus:ring-offset-2 focus:ring-offset-cz-bg",
              "transition-all duration-cz-fast ease-cz-smooth"
            )}
          />
        </div>
      </form>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-3 justify-center">
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            active={activeFilter === filter.key}
            onClick={() => handleFilterClick(filter.key)}
            className="transition-all duration-cz-fast"
          >
            {filter.label}
          </Chip>
        ))}
      </div>

      {/* Live Indicator */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-red-400">LIVE acum</span>
          <TrendingUp className="h-3 w-3 text-red-400" />
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <button className="text-sm text-cz-muted hover:text-cz-foreground transition-colors duration-cz-fast">
          Descoperă în weekend →
        </button>
      </div>
    </div>
  );
}