import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Bell, Play, Star, Calendar, Clock } from 'lucide-react';

interface CountdownProps {
  title: string;
  subtitle: string;
  targetDate: string;
  category: 'TV' | 'MOVIE' | 'GAME';
  backdropUrl?: string;
  onSetReminder?: () => void;
  onAddToFavorites?: () => void;
  className?: string;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function TVCountdown({ 
  title, 
  subtitle, 
  targetDate, 
  category,
  backdropUrl,
  onSetReminder,
  onAddToFavorites,
  className = ""
}: CountdownProps) {
  const [countdown, setCountdown] = useState<CountdownTime>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  const getCategoryColor = () => {
    switch (category) {
      case 'TV':
        return 'bg-purple-500';
      case 'MOVIE':
        return 'bg-blue-500';
      case 'GAME':
        return 'bg-green-500';
      default:
        return 'bg-purple-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${className}`}>
      {/* Background Image */}
      {backdropUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
      
      <CardContent className="relative p-6 text-white min-h-[300px] flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Badge 
              className={`${getCategoryColor()} text-white border-0 px-3 py-1 font-medium`}
            >
              {category}
            </Badge>
            
            {isExpired && (
              <Badge variant="destructive" className="animate-pulse">
                DISPONIBIL ACUM
              </Badge>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-2 line-clamp-2">
            {title}
          </h2>
          
          <p className="text-white/90 text-base mb-4">
            {subtitle}
          </p>
        </div>

        {/* Countdown Display */}
        {!isExpired ? (
          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 mb-6">
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {countdown.days}
                </div>
                <div className="text-xs text-white/80 uppercase tracking-wide">
                  {countdown.days === 1 ? 'ZI' : 'ZILE'}
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {countdown.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-white/80 uppercase tracking-wide">
                  {countdown.hours === 1 ? 'ORĂ' : 'ORE'}
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {countdown.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-white/80 uppercase tracking-wide">
                  MIN
                </div>
              </div>
              
              <div className="bg-white/10 rounded-lg p-3">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {countdown.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs text-white/80 uppercase tracking-wide">
                  SEC
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4 mb-6 border border-green-500/30">
            <div className="text-center">
              <Play className="w-12 h-12 mx-auto mb-2 text-green-400" />
              <h3 className="text-xl font-bold text-green-400">Disponibil Acum!</h3>
              <p className="text-white/90">Poți viziona episodul acum</p>
            </div>
          </div>
        )}

        {/* Date and Actions */}
        <div>
          <div className="flex items-center text-white/80 text-sm mb-4">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{formatDate(targetDate)}</span>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={onSetReminder}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              Reminder
            </Button>
            
            <Button 
              onClick={onAddToFavorites}
              className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30"
              variant="outline"
            >
              <Star className="w-4 h-4 mr-2" />
              Favorit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Grid layout component for multiple countdowns (like in your reference image)
interface TVCountdownGridProps {
  countdowns: Array<{
    id: string;
    title: string;
    subtitle: string;
    targetDate: string;
    category: 'TV' | 'MOVIE' | 'GAME';
    backdropUrl?: string;
  }>;
  onSetReminder?: (id: string) => void;
  onAddToFavorites?: (id: string) => void;
  maxItems?: number;
}

export function TVCountdownGrid({ 
  countdowns, 
  onSetReminder, 
  onAddToFavorites,
  maxItems = 10 
}: TVCountdownGridProps) {
  const displayedCountdowns = countdowns.slice(0, maxItems);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">🔥 Upcoming Episodes & Releases</h2>
        <p className="text-muted-foreground">
          Countdown-uri live pentru următoarele episoade și lansări
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {displayedCountdowns.map((countdown) => (
          <TVCountdown
            key={countdown.id}
            title={countdown.title}
            subtitle={countdown.subtitle}
            targetDate={countdown.targetDate}
            category={countdown.category}
            backdropUrl={countdown.backdropUrl}
            onSetReminder={() => onSetReminder?.(countdown.id)}
            onAddToFavorites={() => onAddToFavorites?.(countdown.id)}
            className="h-[350px]"
          />
        ))}
      </div>

      {countdowns.length > maxItems && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Vezi Mai Multe ({countdowns.length - maxItems} rămase)
          </Button>
        </div>
      )}
    </div>
  );
}