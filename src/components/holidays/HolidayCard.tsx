import { Calendar, Download, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/cz-badge";
import { Button } from "@/components/ui/cz-button";
import { formatRoDate } from "@/lib/date";
import ReminderButton from "@/components/ReminderButton";
import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";

interface HolidayCardProps {
  holiday: {
    id: string;
    name: string;
    slug: string;
    kind: string;
    description?: string;
  };
  instance: {
    date: string;
    date_end?: string;
    is_weekend: boolean;
    year: number;
  };
  showYear?: boolean;
}

// Countdown Component for holidays matching homepage design
function HolidayCountdown({ targetDate, status }: { targetDate: string | Date; status?: string }) {
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

export function HolidayCard({ holiday, instance, showYear = false }: HolidayCardProps) {
  const date = new Date(instance.date);
  const isMultiDay = instance.date_end && instance.date_end !== instance.date;
  
  const handleICSDownload = () => {
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro';
    const icsUrl = `${siteUrl}/functions/v1/ics_event/${holiday.id}?kind=holiday`;
    window.open(icsUrl, '_blank');
  };

  const getKindLabel = (kind: string) => {
    const labels = {
      legal: 'Legală',
      religious: 'Religioasă', 
      national: 'Națională',
      observance: 'Comemorare'
    };
    return labels[kind as keyof typeof labels] || kind;
  };

  const getCategoryVariant = (kind: string) => {
    switch (kind?.toLowerCase()) {
      case 'legal': return 'holiday';
      case 'religious': case 'religioasa': return 'holiday';
      case 'national': case 'nationala': return 'holiday';
      default: return 'event';
    }
  };

  const getGradientFallback = () => {
    const gradients = {
      legal: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
      religious: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
      national: 'linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
      observance: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 50%, #a855f7 100%)',
      default: 'linear-gradient(135deg, #166534 0%, #16a34a 50%, #22c55e 100%)'
    };
    
    const kindKey = holiday.kind?.toLowerCase() || 'default';
    return gradients[kindKey as keyof typeof gradients] || gradients.default;
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[--cz-surface] border border-[--cz-border] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[var(--cz-shadow-hover)]"
      style={{ boxShadow: 'var(--cz-shadow-card)' }}
      data-testid="holiday-card"
    >
      {/* Clickable Image/Header Container */}
      <Link to={`/sarbatori/${holiday.slug}`} className="block">
        <div className="aspect-video relative overflow-hidden">
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
              <div className="text-lg font-semibold mb-1 line-clamp-2">{holiday.name}</div>
              <div className="text-sm opacity-80">{getKindLabel(holiday.kind)}</div>
            </div>
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[--cz-overlay] to-transparent" />
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant={getCategoryVariant(holiday.kind)}>
              {getKindLabel(holiday.kind)}
            </Badge>
            {instance.is_weekend && (
              <Badge variant="neutral">Weekend</Badge>
            )}
            {isMultiDay && (
              <Badge variant="neutral">2 zile</Badge>
            )}
          </div>
        </div>
      </Link>

      {/* Hero Countdown Display */}
      {date > new Date() && (
        <div className="p-4">
          <HolidayCountdown targetDate={date} />
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-4 space-y-3 min-h-[100px]">
        {/* Clickable Title */}
        <Link to={`/sarbatori/${holiday.slug}`}>
          <h3 className="font-semibold text-[--cz-ink] line-clamp-2 group-hover:text-[--cz-primary] transition-colors cursor-pointer">
            {holiday.name}
          </h3>
        </Link>
        
        {holiday.description && (
          <p className="text-sm text-[--cz-ink-muted] line-clamp-2">
            {holiday.description}
          </p>
        )}
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-[--cz-ink-muted]">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {formatRoDate(date, false)}
              {showYear && ` ${instance.year}`}
              {isMultiDay && ` - ${formatRoDate(new Date(instance.date_end!), false)}`}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          <ReminderButton
            when={date}
            kind="event"
            entityId={holiday.id}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleICSDownload}
          >
            <Download className="h-3 w-3 mr-1" />
            ICS
          </Button>
        </div>
      </div>
    </motion.article>
  );
}