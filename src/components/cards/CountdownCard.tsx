import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownCardProps {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  imageUrl?: string;
  city?: string;
  category?: string;
  categorySlug?: string;
  rank?: number;
  score?: number;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

export default function CountdownCard({
  id,
  title,
  slug,
  startDate,
  imageUrl,
  city,
  category,
  categorySlug,
  rank,
  score,
  className
}: CountdownCardProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0 });

  const calculateTimeLeft = (): TimeLeft => {
    const target = new Date(startDate).getTime();
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
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute for cards

    return () => clearInterval(interval);
  }, [startDate]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Bucharest'
    };
    return date.toLocaleDateString('ro-RO', options);
  };

  const handleCardClick = () => {
    // Track card click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'popular_card_click', {
        event_id: id,
        event_title: title,
        rank: rank || 0
      });
    }
  };

  const handleReminderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Track reminder click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'reminder_set', {
        event_id: id,
        event_title: title,
        source: 'popular_card'
      });
    }
    
    // TODO: Open reminder modal or handle reminder logic
    console.log('Set reminder for:', title);
  };

  const getCountdownText = (): string => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days} ${timeLeft.days === 1 ? 'zi' : 'zile'}`;
    } else if (timeLeft.hours > 0) {
      return `${timeLeft.hours} ${timeLeft.hours === 1 ? 'oră' : 'ore'}`;
    } else if (timeLeft.minutes > 0) {
      return `${timeLeft.minutes} ${timeLeft.minutes === 1 ? 'minut' : 'minute'}`;
    } else {
      return 'Acum';
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
      className
    )}>
      <Link 
        to={`/evenimente/${slug}`}
        onClick={handleCardClick}
        className="block"
      >
        {/* Rank Badge */}
        {rank && rank <= 10 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge 
              variant="secondary" 
              className="bg-primary/90 text-primary-foreground font-bold text-xs px-2 py-1"
            >
              #{rank}
            </Badge>
          </div>
        )}

        {/* Image or Placeholder */}
        <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Clock className="h-12 w-12 text-primary/30" />
            </div>
          )}
          
          {/* Countdown Overlay */}
          <div className="absolute top-3 right-3">
            <Badge className="bg-background/90 text-foreground border">
              {getCountdownText()}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Meta Information */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(startDate)}</span>
            </div>
            
            {city && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{city}</span>
              </div>
            )}
          </div>

          {/* Category and Actions */}
          <div className="flex items-center justify-between pt-2">
            {category && (
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            )}
            
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