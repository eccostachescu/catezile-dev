import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/cz-badge';
import { formatRoDate } from '@/lib/date';
import { getEventImageSmart } from '@/lib/images';
import ReminderButton from '@/components/ReminderButton';

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
  isMatch?: boolean;
  isDerby?: boolean;
  source?: string; // Added to help with routing
  category_slug?: string; // Added to help with routing
}

// Real Countdown Component with prominent display
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
  isMatch = false,
  isDerby = false,
  source,
  category_slug,
}: CardCountdownProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [smartImage, setSmartImage] = useState<string | null>(imageUrl || null);

  // Obține imagini smart dacă nu avem una
  useEffect(() => {
    if (!imageUrl && title && category) {
      getEventImageSmart({ title, category }).then(setSmartImage);
    }
  }, [title, category, imageUrl]);

  // COMPLETELY DISABLED analytics tracking for card impressions
  useEffect(() => {
    // Disabled - no analytics tracking in development
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
    // Improved category-specific images with better matching
    const fallbackImages = {
      sport: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop', // Football stadium
      fotbal: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
      film: 'https://images.unsplash.com/photo-1489599510072-12d66b9ac1ae?w=800&h=600&fit=crop',
      movie: 'https://images.unsplash.com/photo-1489599510072-12d66b9ac1ae?w=800&h=600&fit=crop',
      holiday: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop', // Christmas tree
      craciun: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop',
      sarbatoare: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&h=600&fit=crop',
      tv: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=600&fit=crop',
      muzica: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      event: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      default: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=600&fit=crop'
    };
    
    // Check for specific keywords in title or category for better matching
    const lowerTitle = title?.toLowerCase() || '';
    const lowerCategory = category?.toLowerCase() || '';
    
    if (lowerTitle.includes('craciun') || lowerCategory.includes('craciun')) {
      return fallbackImages.craciun;
    }
    if (lowerTitle.includes('fotbal') || lowerCategory.includes('fotbal') || lowerCategory.includes('sport')) {
      return fallbackImages.fotbal;
    }
    
    const categoryKey = lowerCategory || 'default';
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

  const getCorrectRoute = () => {
    console.log('🔧 Determining route for:', { title, source, category_slug, category, isMatch });
    
    // Route based on source first
    if (source === 'match_api' || category_slug === 'sport' || category?.toLowerCase() === 'sport') {
      return `/sport/${slug}`;
    }
    
    if (source === 'movie_api' || category_slug === 'filme' || category?.toLowerCase() === 'filme') {
      return `/filme/${slug}`;
    }
    
    if (source === 'user_countdown' || category_slug === 'countdown') {
      return `/c/${id}`;
    }
    
    // Default to events
    return `/evenimente/${slug}`;
  };

  const handleCardClick = () => {
    const route = getCorrectRoute();
    console.log('🔧 Navigating to:', route);
    navigate(route);
  };

  const handleReminderClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
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
      <div className="aspect-video relative overflow-hidden cursor-pointer" onClick={handleCardClick}>
        {(smartImage || imageUrl) && !imageError ? (
          <img
            src={smartImage || imageUrl}
            alt={`${title} - ${category || 'Eveniment'}`}
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
              <div className="text-lg font-semibold mb-1 line-clamp-2">{title}</div>
              <div className="text-sm opacity-80">{category || 'Eveniment'}</div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[--cz-overlay] to-transparent" />
        
        {/* Rank Badge */}
        {rank && (
          <div className="absolute top-3 left-3">
            <Badge variant="rank" className="bg-[--cz-accent] text-black font-semibold">
              #{rank}
            </Badge>
          </div>
        )}
      </div>

      {/* Hero Countdown Display */}
      <div className="p-4">
        <RealCountdown targetDate={startDate} status={status} />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3 min-h-[100px]">
        {/* Title with Derby Badge */}
        <div className="space-y-2">
          <h3 className="font-semibold text-[--cz-ink] line-clamp-2 group-hover:text-[--cz-primary] transition-colors cursor-pointer" onClick={handleCardClick}>
            {title}
          </h3>
          {isDerby && (
            <div className="flex items-center gap-2">
              <Badge variant="sport" className="text-xs bg-red-600 text-white">
                Derby
              </Badge>
            </div>
          )}
        </div>
        
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
          
          {status !== "past" && new Date(startDate) > new Date() && (
            <div onClick={handleReminderClick}>
              <ReminderButton 
                when={startDate}
                kind={source === 'match_api' ? 'match' : 'event'}
                entityId={id}
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}