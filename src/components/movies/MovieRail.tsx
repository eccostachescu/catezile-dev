import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MovieCountdownCard } from "./MovieCountdownCard";
import { useRef } from "react";

interface MovieRailProps {
  title: string;
  movies: Array<{
    id: string;
    title: string;
    slug: string;
    poster_path?: string;
    cinema_release_ro?: string;
    overview?: string;
    genres?: string[];
    runtime?: number;
    popularity?: number;
    next_date?: {
      date: string;
      type: 'cinema' | 'streaming' | 'released';
      platform: string;
    };
  }>;
  showReminder?: boolean;
  className?: string;
}

export function MovieRail({ title, movies, showReminder = true, className = "" }: MovieRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        
        {movies.length > 4 && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex-none w-80">
            <MovieCountdownCard
              movie={movie}
            />
          </div>
        ))}
      </div>
    </section>
  );
}