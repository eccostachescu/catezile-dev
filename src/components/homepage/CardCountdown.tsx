import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus } from 'lucide-react';
import { Card, CardMedia } from '@/components/ui/cz-card';
import { Badge } from '@/components/ui/cz-badge';
import { Button } from '@/components/ui/cz-button';
import { PillCountdown } from '@/components/ui/cz-pill-countdown';
import { cn } from '@/lib/utils';

interface CardCountdownProps {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  categorySlug?: string;
  rank?: number;
  status?: 'live' | 'upcoming' | 'past';
  className?: string;
  onReminderClick?: (id: string) => void;
}

export function CardCountdown({
  id,
  title,
  slug,
  startDate,
  imageUrl,
  location,
  category,
  categorySlug,
  rank,
  status = 'upcoming',
  className,
  onReminderClick,
}: CardCountdownProps) {
  const getCategoryVariant = (cat?: string) => {
    if (!cat) return 'neutral';
    const lower = cat.toLowerCase();
    if (lower.includes('sport') || lower.includes('meci')) return 'sport';
    if (lower.includes('film') || lower.includes('cinema')) return 'film';
    if (lower.includes('sărbător') || lower.includes('holiday')) return 'holiday';
    return 'event';
  };

  const handleReminderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onReminderClick?.(id);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ro-RO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Link to={`/countdown/${slug}`} className="group block">
      <Card className={cn("overflow-hidden group", className)}>
        {/* Image / Media */}
        <div className="relative">
          <CardMedia 
            src={imageUrl} 
            alt={title}
            aspectRatio="video"
            className="transition-transform duration-cz-normal group-hover:scale-105"
          />
          
          {/* Rank Badge */}
          {rank && (
            <Badge 
              variant="rank" 
              className="absolute top-3 left-3 text-xs font-bold"
            >
              #{rank}
            </Badge>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <PillCountdown date={startDate} status={status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-heading font-semibold text-cz-foreground line-clamp-2 text-sm leading-tight">
            {title}
          </h3>

          {/* Meta Info */}
          <div className="space-y-2">
            {/* Date & Location */}
            <div className="flex items-center justify-between text-xs text-cz-muted">
              <time>{formatDate(startDate)}</time>
              {location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-20">{location}</span>
                </div>
              )}
            </div>

            {/* Category & Actions */}
            <div className="flex items-center justify-between gap-2">
              {category && (
                <Badge variant={getCategoryVariant(category)} className="text-xs">
                  {category}
                </Badge>
              )}
              
              <Button
                size="sm"
                variant="subtle"
                icon={<Plus className="h-3 w-3" />}
                onClick={handleReminderClick}
                className="text-xs"
              >
                Reminder
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}