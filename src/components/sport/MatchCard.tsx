import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/cz-badge";
import TVChips from "@/components/sport/TVChips";
import LivePill from "@/components/sport/LivePill";
import Scoreboard from "@/components/sport/Scoreboard";
import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { formatRoDate } from '@/lib/date';

export type SportMatchItem = {
  id: string;
  home: string;
  away: string;
  kickoff_at: string | Date;
  tv_channels?: string[] | null;
  is_derby?: boolean | null;
  status?: string | null;
  score?: any;
};

// Countdown Component for matches
function MatchCountdown({ targetDate, status }: { targetDate: string | Date; status?: string }) {
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
        if (status === "LIVE") {
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

export default function MatchCard({ m, onClick }: { m: SportMatchItem; onClick?: (id: string) => void }) {
  const date = new Date(m.kickoff_at);
  let time = '--:--';
  
  // Safe time formatting with error handling
  try {
    if (!isNaN(date.getTime())) {
      time = Intl.DateTimeFormat('ro-RO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Bucharest' }).format(date);
    }
  } catch (error) {
    console.warn('Time formatting error for match:', m.id, error);
  }

  const getGradientFallback = () => {
    return 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)';
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-[--cz-surface] border border-[--cz-border] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-[var(--cz-shadow-hover)]"
      style={{ boxShadow: 'var(--cz-shadow-card)' }}
    >
      {/* Clickable Image/Header Container */}
      <Link to={`/sport/${m.id}`} onClick={() => onClick?.(m.id)} className="block">
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
              <div className="text-lg font-semibold mb-1">{m.home} vs {m.away}</div>
              <div className="text-sm opacity-80">SuperLiga</div>
            </div>
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[--cz-overlay] to-transparent" />
          
          {/* Status Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge variant="sport">SuperLiga</Badge>
            {m.is_derby && <Badge variant="event">Derby</Badge>}
          </div>
          
          {m.status === 'LIVE' && (
            <div className="absolute top-3 right-3">
              <LivePill minute={m?.score?.elapsed || m?.score?.minute} />
            </div>
          )}
        </div>
      </Link>

      {/* Hero Countdown Display */}
      <div className="p-4">
        <MatchCountdown targetDate={m.kickoff_at} status={m.status || undefined} />
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3 min-h-[100px]">
        {/* Clickable Title */}
        <Link to={`/sport/${m.id}`} onClick={() => onClick?.(m.id)}>
          <h3 className="font-semibold text-[--cz-ink] line-clamp-2 group-hover:text-[--cz-primary] transition-colors cursor-pointer">
            {m.home} vs {m.away}
          </h3>
        </Link>
        
        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-[--cz-ink-muted]">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatRoDate(date, false)} • {time}</span>
          </div>
        </div>
        
        {/* TV Channels and Score */}
        <div className="flex items-center justify-between">
          <TVChips channels={m.tv_channels || []} />
          <Scoreboard status={m.status || undefined} score={m.score} />
        </div>
      </div>
    </motion.div>
  );
}
