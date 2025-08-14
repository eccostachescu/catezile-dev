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

      // Always show DD:HH:MM:SS format
      return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
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
      <Badge variant={getVariant()} className="text-sm font-bold px-3 py-1.5 bg-black/60 backdrop-blur-sm text-white border-none min-w-[120px] text-center">
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

  // Track impression when card becomes visible (throttled)
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Track impression analytics with throttling
            if (typeof window !== 'undefined' && window.plausible) {
              // Only track if we haven't tracked this card recently
              const trackingKey = `card_impression_${id}`;
              const lastTracked = sessionStorage.getItem(trackingKey);
              const now = Date.now();
              
              if (!lastTracked || now - parseInt(lastTracked) > 10000) { // 10 second throttle
                try {
                  window.plausible('popular_card_impression', {
                    props: { 
                      event_id: id,
                      category: category || 'unknown'
                    }
                  });
                  sessionStorage.setItem(trackingKey, now.toString());
                } catch (error) {
                  // Silently ignore analytics errors
                }
              }
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
    // Use Unsplash images as fallbacks instead of non-existent local files
    const fallbackImages = {
      sport: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop',
      film: 'https://images.unsplash.com/photo-1489599510072-12d66b9ac1ae?w=800&h=600&fit=crop',
      holiday: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
      event: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'
    };
    
    const categoryKey = category?.toLowerCase() || 'default';
    return fallbackImages[categoryKey as keyof typeof fallbackImages] || fallbackImages.default;
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
      try {
        window.plausible('reminder_click', {
          props: { event_id: id, category: category || 'unknown' }
        });
      } catch (error) {
        // Silently ignore analytics errors
      }
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
            {/* Use fallback image directly */}
            <img
              src={getImageFallback()}
              alt={`${title} - ${category || 'Eveniment'}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
              onError={() => {
                // If even the fallback fails, show gradient
                setImageError(true);
              }}
            />
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