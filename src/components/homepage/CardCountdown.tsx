import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Clock, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/cz-badge';
import { formatRoDate } from '@/lib/date';

interface CardCountdownProps {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  rank?: number;
  status?: "live" | "upcoming" | "past";
  onReminderClick?: (id: string) => void;
}

// Real Countdown Component
function RealCountdown({ targetDate, status }: { targetDate: string; status?: string }) {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const countdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!countdownRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(countdownRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        if (status === "live") return "LIVE";
        return "Trecut";
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        return `${days} ${days === 1 ? 'zi' : 'zile'}, ${hours} ${hours === 1 ? 'oră' : 'ore'}`;
      } else if (hours > 0) {
        return `${hours} ${hours === 1 ? 'oră' : 'ore'}, ${minutes} min`;
      } else {
        return `${minutes} min, ${seconds} sec`;
      }
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate, status, isVisible]);

  const getVariant = () => {
    if (status === "live") return "live";
    if (timeLeft === "Trecut") return "neutral";
    if (timeLeft.includes("zile")) return "event";
    return "sport";
  };

  return (
    <div ref={countdownRef}>
      <Badge variant={getVariant()} className="text-xs font-medium bg-black/40 backdrop-blur-sm text-white border-none">
        {timeLeft || "..."}
      </Badge>
    </div>
  );
}

export default function CardCountdown({
  id,
  title,
  slug,
  startDate,
  imageUrl,
  location,
  category,
  rank,
  status = "upcoming",
  onReminderClick,
}: CardCountdownProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Track impression when card becomes visible
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Track impression analytics
            if (typeof window !== 'undefined' && window.plausible) {
              window.plausible('popular_card_impression', {
                props: { 
                  event_id: id,
                  category: category || 'unknown'
                }
              });
            }
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [id, category]);

  const getCategoryVariant = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'sport': return 'sport';
      case 'film': case 'movie': return 'film';
      case 'holiday': case 'sarbatoare': return 'holiday';
      default: return 'event';
    }
  };

  const getImageFallback = () => {
    const fallbackPaths = {
      sport: `/assets/covers/sport-${Math.floor(Math.random() * 5) + 1}.webp`,
      film: `/assets/covers/movie-${Math.floor(Math.random() * 5) + 1}.webp`,
      holiday: `/assets/covers/holiday-${Math.floor(Math.random() * 5) + 1}.webp`,
      event: `/assets/covers/event-${Math.floor(Math.random() * 5) + 1}.webp`,
      default: null
    };
    
    const categoryKey = category?.toLowerCase() || 'default';
    return fallbackPaths[categoryKey as keyof typeof fallbackPaths];
  };

  const getGradientFallback = () => {
    const gradients = {
      sport: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
      film: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #ef4444 100%)',
      holiday: 'linear-gradient(135deg, #166534 0%, #16a34a 50%, #22c55e 100%)',
      event: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
      default: 'linear-gradient(135deg, #1a2440 0%, #10192e 50%, #0b1020 100%)'
    };
    
    const categoryKey = category?.toLowerCase() || 'default';
    return gradients[categoryKey as keyof typeof gradients] || gradients.default;
  };

  const handleReminderClick = () => {
    onReminderClick?.(id);
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('reminder_click', {
        props: { event_id: id, category: category || 'unknown' }
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[--cz-surface] border border-[--cz-border] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[var(--cz-shadow-hover)]"
      style={{ boxShadow: 'var(--cz-shadow-card)' }}
    >
      {/* Image Container */}
      <div className="aspect-video relative overflow-hidden">
        {(imageUrl && !imageError) ? (
          <img
            src={imageUrl}
            alt={`${title} - ${category || 'Eveniment'}`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <>
            {/* Try fallback image first, then gradient */}
            {getImageFallback() ? (
              <img
                src={getImageFallback()!}
                alt={`${title} - ${category || 'Eveniment'}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                onError={() => setImageError(true)}
              />
            ) : (
              /* Gradient fallback */
              <div 
                className="w-full h-full"
                style={{ background: getGradientFallback() }}
              />
            )}
          </>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[--cz-overlay] to-transparent" />
        
        {/* Real Countdown */}
        <div className="absolute top-3 right-3">
          <RealCountdown targetDate={startDate} status={status} />
        </div>
        
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-3 left-3">
            <Badge variant="rank" className="bg-[--cz-accent] text-black font-semibold">
              #{rank}
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 min-h-[128px]">
        {/* Title */}
        <h3 className="font-semibold text-[--cz-ink] line-clamp-2 group-hover:text-[--cz-primary] transition-colors">
          {title}
        </h3>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-[--cz-ink-muted]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatRoDate(new Date(startDate), false)}</span>
          </div>
          
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          {category && (
            <Badge variant={getCategoryVariant(category)} className="text-xs">
              {category}
            </Badge>
          )}
          
          {onReminderClick && (
            <button
              onClick={handleReminderClick}
              className="flex items-center gap-1 text-[--cz-primary] hover:text-[--cz-primary-600] transition-colors text-sm font-medium"
            >
              <Bell className="h-3 w-3" />
              Reminder
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}