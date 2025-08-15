import { Film, Calendar, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReminderButton from "@/components/ReminderButton";
import { Link } from "react-router-dom";

interface MovieCardEnhancedProps {
  movie: {
    id: string;
    title: string;
    slug?: string;
    poster_path?: string;
    poster_url?: string;
    cinema_release_ro?: string;
    streaming_ro?: Record<string, string | null>;
    overview?: string;
    genres?: string[];
    runtime?: number;
    popularity?: number;
    status?: string;
    next_date?: {
      date: string;
      type: 'cinema' | 'streaming' | 'released';
      platform: string;
    };
  };
  showReminder?: boolean;
  className?: string;
}

export function MovieCardEnhanced({ movie, showReminder = true, className = "" }: MovieCardEnhancedProps) {
  const posterUrl = movie.poster_url || (movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null);

  const getStreamingProviders = () => {
    const providers = [];
    
    // Check if movie is in cinema
    if (movie.cinema_release_ro) {
      const cinemaDate = new Date(movie.cinema_release_ro);
      const today = new Date();
      if (cinemaDate <= today) {
        providers.push({ name: 'Cinema', variant: 'default' as const });
      }
    }
    
    // Check streaming providers
    if (movie.streaming_ro) {
      if (movie.streaming_ro['Netflix']) {
        providers.push({ name: 'Netflix', variant: 'destructive' as const });
      }
      if (movie.streaming_ro['Prime Video']) {
        providers.push({ name: 'Prime Video', variant: 'secondary' as const });
      }
      if (movie.streaming_ro['HBO Max']) {
        providers.push({ name: 'HBO Max', variant: 'outline' as const });
      }
    }
    
    return providers;
  };

  const getDateLabel = () => {
    if (!movie.next_date) {
      // Fallback for cinema release
      if (movie.cinema_release_ro) {
        const date = new Date(movie.cinema_release_ro);
        const today = new Date();
        if (date > today) {
          return `La cinema din ${date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}`;
        } else {
          return "În cinema acum";
        }
      }
      return null;
    }
    
    const date = new Date(movie.next_date.date);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (movie.next_date.type === 'cinema' && diffDays > 0) {
      return `La cinema din ${date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}`;
    } else if (movie.next_date.type === 'streaming' && diffDays > 0) {
      return `Pe ${movie.next_date.platform} din ${date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}`;
    } else if (movie.next_date.type === 'released') {
      return "În cinema acum";
    }
    
    return null;
  };

  const getBadgeVariant = () => {
    if (!movie.next_date) return "secondary";
    
    if (movie.next_date.type === 'cinema') return "default";
    if (movie.next_date.type === 'streaming') return "outline";
    return "secondary";
  };

  const movieSlug = movie.slug || movie.id;

  return (
    <Card className={`group overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}>
      <Link to={`/filme/${movieSlug}`} className="block">
        <div className="relative aspect-[2/3] overflow-hidden">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Film className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Date badge */}
          {getDateLabel() && (
            <div className="absolute top-2 left-2">
              <Badge variant={getBadgeVariant()} className="text-xs">
                {getDateLabel()}
              </Badge>
            </div>
          )}
          
          {/* Popularity badge */}
          {movie.popularity && movie.popularity > 50 && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="text-xs">
                <Star className="mr-1 h-3 w-3" />
                Popular
              </Badge>
            </div>
          )}

          {/* Streaming provider badges */}
          <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
            {getStreamingProviders().map((provider) => (
              <Badge key={provider.name} variant={provider.variant} className="text-xs">
                {provider.name}
              </Badge>
            ))}
          </div>
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/filme/${movieSlug}`}>
          <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {movie.title}
          </h3>
        </Link>
        
        {movie.overview && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {movie.overview}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          {movie.runtime && (
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3" />
              {movie.runtime} min
            </div>
          )}
          
          {movie.cinema_release_ro && (
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {new Date(movie.cinema_release_ro).getFullYear()}
            </div>
          )}
        </div>
        
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genres.slice(0, 2).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        )}
        
        {showReminder && movie.next_date && (
          <div className="mt-4">
            <ReminderButton
              when={movie.next_date.date}
              kind="movie"
              entityId={movie.id}
            />
          </div>
        )}
      </div>
    </Card>
  );
}