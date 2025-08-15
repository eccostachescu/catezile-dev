import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/cz-badge";
import { Button } from "@/components/ui/cz-button";
import { MapPin, Clock, Bell } from "lucide-react";
import ReminderButton from "@/components/ReminderButton";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { fmtShortDate, fmtTime } from "@/lib/i18n/formats";
import { simpleCountdown } from "@/lib/i18n/countdown";
import { motion } from 'framer-motion';
import { getEventImageSmart } from '@/lib/images';
import { formatRoDate } from '@/lib/date';
import React, { useState, useEffect, useRef } from 'react';

interface Event {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  starts_at: string;
  ends_at?: string;
  image_url?: string;
  city?: { name: string; slug: string };
  venue?: { name: string };
  category?: { name: string; slug: string };
  tickets_affiliate_link_id?: string;
}

interface EventCardProps {
  event: Event;
  className?: string;
}

// Countdown Component matching homepage design
function RealCountdown({ targetDate, status }: { targetDate: string; status?: string }) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number, status: string}>({
    days: 0, hours: 0, minutes: 0, seconds: 0, status: 'loading'
  });
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
        if (status === "live") {
          return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "LIVE" };
        }
        return { days: 0, hours: 0, minutes: 0, seconds: 0, status: "Trecut" };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, status: "countdown" };
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate, status, isVisible]);

  const { days, hours, minutes, seconds, status: countdownStatus } = timeLeft;

  return (
    <div ref={countdownRef} className="w-full">
      {countdownStatus === "LIVE" && (
        <div className="bg-red-600 text-white px-3 py-2 rounded-lg text-center font-bold">
          <div className="flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        </div>
      )}
      
      {countdownStatus === "Trecut" && (
        <div className="bg-gray-500 text-white px-3 py-2 rounded-lg text-center font-bold">
          Trecut
        </div>
      )}
      
      {countdownStatus === "countdown" && (
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg py-2 px-1">
            <div className="text-lg font-bold leading-none">{String(days).padStart(2, '0')}</div>
            <div className="text-xs opacity-80">Zile</div>
          </div>
          <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg py-2 px-1">
            <div className="text-lg font-bold leading-none">{String(hours).padStart(2, '0')}</div>
            <div className="text-xs opacity-80">Ore</div>
          </div>
          <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg py-2 px-1">
            <div className="text-lg font-bold leading-none">{String(minutes).padStart(2, '0')}</div>
            <div className="text-xs opacity-80">Min</div>
          </div>
          <div className="bg-black/80 backdrop-blur-sm text-white rounded-lg py-2 px-1">
            <div className="text-lg font-bold leading-none">{String(seconds).padStart(2, '0')}</div>
            <div className="text-xs opacity-80">Sec</div>
          </div>
        </div>
      )}
      
      {countdownStatus === "loading" && (
        <div className="bg-gray-300 animate-pulse rounded-lg py-4 text-center">
          <div className="text-gray-500 text-sm">...</div>
        </div>
      )}
    </div>
  );
}

export default function EventCard({ event, className }: EventCardProps) {
  const { t } = useI18n();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [smartImage, setSmartImage] = useState<string | null>(event.image_url || null);

  const startDate = new Date(event.starts_at);
  const endDate = event.ends_at ? new Date(event.ends_at) : null;

  // Get smart images if we don't have one
  useEffect(() => {
    if (!event.image_url && event.title && event.category?.name) {
      getEventImageSmart({ title: event.title, category: event.category.name }).then(setSmartImage);
    }
  }, [event.title, event.category?.name, event.image_url]);

  const formatLocation = () => {
    const parts = [];
    if (event.venue?.name) parts.push(event.venue.name);
    if (event.city?.name) parts.push(event.city.name);
    return parts.join(', ');
  };

  const getCategoryVariant = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'sport': return 'sport';
      case 'film': case 'movie': return 'film';
      case 'holiday': case 'sarbatoare': return 'holiday';
      case 'religioasa': return 'holiday';
      default: return 'event';
    }
  };

  const getGradientFallback = () => {
    const gradients = {
      sport: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
      film: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #ef4444 100%)',
      holiday: 'linear-gradient(135deg, #166534 0%, #16a34a 50%, #22c55e 100%)',
      event: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
      default: 'linear-gradient(135deg, #1a2440 0%, #10192e 50%, #0b1020 100%)'
    };
    
    const categoryKey = event.category?.name?.toLowerCase() || 'default';
    return gradients[categoryKey as keyof typeof gradients] || gradients.default;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative bg-[--cz-surface] border border-[--cz-border] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[var(--cz-shadow-hover)]",
        className
      )}
      style={{ boxShadow: 'var(--cz-shadow-card)' }}
    >
      {/* Clickable Image Container */}
      <Link to={`/evenimente/${event.slug}`} className="block">
        <div className="aspect-video relative overflow-hidden">
          {(smartImage || event.image_url) && !imageError ? (
            <img
              src={smartImage || event.image_url}
              alt={`${event.title} - ${event.category?.name || 'Eveniment'}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              onLoad={() => {
                setImageLoaded(true);
              }}
              onError={(e) => {
                setImageError(true);
              }}
            />
          ) : (
            <div 
              className="w-full h-full relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{ 
                background: getGradientFallback(),
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Overlay pattern */}
              <div className="absolute inset-0 bg-black/10" />
              
              {/* Content overlay */}
              <div className="relative text-center text-white/90 p-4">
                <div className="text-lg font-semibold mb-1 line-clamp-2">{event.title}</div>
                <div className="text-sm opacity-80">{event.category?.name || 'Eveniment'}</div>
              </div>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[--cz-overlay] to-transparent" />
        </div>
      </Link>

      {/* Hero Countdown Display */}
      <div className="p-4">
        <RealCountdown targetDate={event.starts_at} />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3 min-h-[100px]">
        {/* Category Badge */}
        {event.category && (
          <Badge variant={getCategoryVariant(event.category.name)} className="text-xs">
            {event.category.name}
          </Badge>
        )}
        
        {/* Clickable Title */}
        <Link to={`/evenimente/${event.slug}`}>
          <h3 className="font-semibold text-[--cz-ink] line-clamp-2 group-hover:text-[--cz-primary] transition-colors cursor-pointer">
            {event.title}
          </h3>
        </Link>
        
        {event.subtitle && (
          <p className="text-sm text-[--cz-ink-muted] line-clamp-2">
            {event.subtitle}
          </p>
        )}
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-[--cz-ink-muted]">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatRoDate(startDate, false)}</span>
          </div>
          
          {formatLocation() && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{formatLocation()}</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <ReminderButton 
            when={startDate}
            kind="event"
            entityId={event.id}
          />
          
          <Link to={`/evenimente/${event.slug}`}>
            <Button variant="outline" size="sm">
              Detalii
            </Button>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}