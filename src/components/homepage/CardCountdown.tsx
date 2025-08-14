import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/cz-badge';
import { Button } from '@/components/ui/cz-button';
import { PillCountdown } from '@/components/ui/cz-pill-countdown';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

  const getImageFallback = (category?: string) => {
    if (!category) return 'gradient-default';
    const lower = category.toLowerCase();
    if (lower.includes('sport') || lower.includes('meci')) return 'gradient-sport';
    if (lower.includes('film') || lower.includes('cinema')) return 'gradient-movie';
    if (lower.includes('sărbător') || lower.includes('holiday')) return 'gradient-holiday';
    if (lower.includes('eveniment')) return 'gradient-event';
    return 'gradient-default';
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

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Track card impression at 50% visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            window.plausible?.('popular_card_impression', { 
              props: { eventId: id, category: category || 'unknown' } 
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`card-${id}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [id, category]);

  return (
    <motion.div
      id={`card-${id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -2, scale: 1.01 }}
      className={cn("group", className)}
    >
      <Link to={`/countdown/${slug}`} className="block">
        <div className={cn(
          "rounded-2xl bg-cz-card border border-cz-border overflow-hidden",
          "hover:shadow-[0_12px_40px_rgba(0,0,0,.35)] transition-all duration-300",
          "flex flex-col"
        )}>
          {/* Image / Media */}
          <div className="relative aspect-video">
            {imageUrl && !imageError ? (
              <>
                <img 
                  src={imageUrl}
                  alt={`${title} - ${category || 'Eveniment'}`}
                  className={cn(
                    "w-full h-full object-cover transition-opacity duration-300",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width:1280px) 25vw, (min-width:768px) 33vw, 100vw"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
                {!imageLoaded && (
                  <div className={cn("w-full h-full animate-pulse", getImageFallback(category))} />
                )}
              </>
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center", getImageFallback(category))}>
                <div className="text-center text-white/80">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-60" />
                  <span className="text-sm font-medium opacity-80">{category || 'Eveniment'}</span>
                </div>
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-cz-overlay to-transparent" />
            
            {/* Rank Badge */}
            {rank && (
              <Badge 
                className="absolute top-3 left-3 bg-cz-accent text-black font-semibold text-xs border-0"
              >
                #{rank}
              </Badge>
            )}
            
            {/* Status Pill */}
            <div className="absolute top-3 right-3">
              <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1">
                <PillCountdown date={startDate} status={status} />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 min-h-[128px] flex flex-col justify-between">
            {/* Title */}
            <h3 className="font-heading font-semibold text-cz-foreground line-clamp-2 text-sm leading-tight mb-3">
              {title}
            </h3>

            {/* Meta Info */}
            <div className="space-y-3 mt-auto">
              {/* Date & Location */}
              <div className="flex items-center justify-between text-xs text-cz-muted">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <time>{formatDate(startDate)}</time>
                </div>
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
                  className="text-xs flex-shrink-0"
                >
                  Reminder
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}