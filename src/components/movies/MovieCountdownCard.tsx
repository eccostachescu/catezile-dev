import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Film, Calendar, Clock, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieCountdownCardProps {
  movie: {
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
  };
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

export function MovieCountdownCard({ movie, className }: MovieCountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0 });
  const releaseDate = movie.cinema_release_ro || movie.next_date?.date;

  const calculateTimeLeft = (): TimeLeft => {
    if (!releaseDate) return { days: 0, hours: 0, minutes: 0 };
    
    const target = new Date(releaseDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  useEffect(() => {
    if (!releaseDate) return;

    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [releaseDate]);

  const posterUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Europe/Bucharest'
    };
    return date.toLocaleDateString('ro-RO', options);
  };

  const getCountdownText = (): string => {
    if (!releaseDate) return 'Data necunoscută';
    
    const now = new Date();
    const target = new Date(releaseDate);
    
    if (target <= now) {
      return 'În cinema acum';
    }
    
    if (timeLeft.days > 0) {
      return `${timeLeft.days} ${timeLeft.days === 1 ? 'zi' : 'zile'}`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours} ${timeLeft.hours === 1 ? 'oră' : 'ore'}`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes} ${timeLeft.minutes === 1 ? 'minut' : 'minute'}`;
    } else {
      return 'În curând';
    }
  };

  const getStatusBadge = () => {
    if (!releaseDate) return null;
    
    const now = new Date();
    const target = new Date(releaseDate);
    
    if (target <= now) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          În cinema
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="bg-orange-100 text-orange-800 border-orange-200">
        Premieră
      </Badge>
    );
  };

  const handleReminderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Track reminder click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'movie_reminder_set', {
        movie_id: movie.id,
        movie_title: movie.title,
        release_date: releaseDate
      });
    }
    
    console.log('Set reminder for movie:', movie.title);
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <Link 
        to={`/filme/${movie.slug}`}
        className="block"
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Film className="h-16 w-16 text-primary/30" />
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>
          
          {/* Countdown Badge */}
          {releaseDate && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-background/90 text-foreground border font-bold">
                {getCountdownText()}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>

          {/* Release Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            {releaseDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(releaseDate)}</span>
              </div>
            )}
            
            {movie.runtime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{movie.runtime} min</span>
              </div>
            )}
          </div>

          {/* Genres */}
          {movie.genres && movie.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((genre) => (
                <Badge key={genre} variant="outline" className="text-xs">
                  {genre}
                </Badge>
              ))}
            </div>
          )}

          {/* Overview */}
          {movie.overview && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {movie.overview}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Badge variant="secondary" className="text-xs">
              <Film className="h-3 w-3 mr-1" />
              Film
            </Badge>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={handleReminderClick}
              className="text-xs gap-1 h-7 px-2"
            >
              <Bell className="h-3 w-3" />
              Reminder
            </Button>
          </div>
        </div>
      </Link>
    </Card>
  );
}