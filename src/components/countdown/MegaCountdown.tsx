import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeUnit {
  value: number;
  label: string;
  singular: string;
}

interface MegaCountdownProps {
  targetDate: string;
  title: string;
  timezone?: string;
  className?: string;
}

export default function MegaCountdown({ 
  targetDate, 
  title, 
  timezone = 'Europe/Bucharest',
  className 
}: MegaCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeUnit[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const calculateTimeLeft = (): TimeUnit[] => {
    const target = new Date(targetDate).getTime();
    const now = new Date().getTime();
    const difference = target - now;

    if (difference <= 0) {
      return [
        { value: 0, label: 'zile', singular: 'zi' },
        { value: 0, label: 'ore', singular: 'oră' },
        { value: 0, label: 'minute', singular: 'minut' },
        { value: 0, label: 'secunde', singular: 'secundă' }
      ];
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return [
      { value: days, label: 'zile', singular: 'zi' },
      { value: hours, label: 'ore', singular: 'oră' },
      { value: minutes, label: 'minute', singular: 'minut' },
      { value: seconds, label: 'secunde', singular: 'secundă' }
    ];
  };

  useEffect(() => {
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft());
    };

    // Initial calculation
    updateCountdown();

    // Set up interval - 1s when visible, 60s when hidden
    const interval = setInterval(updateCountdown, isVisible ? 1000 : 60000);

    return () => clearInterval(interval);
  }, [targetDate, isVisible]);

  // Page Visibility API to optimize performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Fullscreen handlers
  const enterFullscreen = async () => {
    if (containerRef.current?.requestFullscreen) {
      try {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    }
  };

  const exitFullscreen = async () => {
    if (document.exitFullscreen) {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const formatNumber = (num: number): string => {
    return num.toString().padStart(2, '0');
  };

  const getLabel = (unit: TimeUnit): string => {
    return unit.value === 1 ? unit.singular : unit.label;
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative",
        isFullscreen && "bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center min-h-screen p-8",
        className
      )}
    >
      <Card className={cn(
        "p-6 sm:p-8 bg-background/80 backdrop-blur-sm border shadow-lg",
        isFullscreen && "bg-background/95 max-w-6xl w-full"
      )}>
        <div className="text-center space-y-6">
          {/* Title */}
          <h1 className={cn(
            "font-bold text-foreground",
            isFullscreen ? "text-4xl sm:text-6xl mb-8" : "text-2xl sm:text-3xl"
          )}>
            {title}
          </h1>

          {/* Countdown Grid */}
          <div className={cn(
            "grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6",
            isFullscreen && "gap-8 sm:gap-12"
          )}>
            {timeLeft.map((unit, index) => (
              <div key={index} className="text-center">
                <div className={cn(
                  "rounded-lg bg-muted/50 p-4 border",
                  isFullscreen && "p-8 text-8xl sm:text-9xl"
                )}>
                  <div className={cn(
                    "font-mono font-bold text-primary",
                    isFullscreen ? "text-6xl sm:text-8xl" : "text-3xl sm:text-4xl"
                  )}>
                    {formatNumber(unit.value)}
                  </div>
                </div>
                <div className={cn(
                  "mt-2 text-muted-foreground font-medium",
                  isFullscreen ? "text-xl sm:text-2xl mt-4" : "text-sm sm:text-base"
                )}>
                  {getLabel(unit)}
                </div>
              </div>
            ))}
          </div>

          {/* Fullscreen Toggle */}
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size={isFullscreen ? "lg" : "default"}
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              className="gap-2"
            >
              {isFullscreen ? (
                <>
                  <Minimize className="h-4 w-4" />
                  Ieși din ecranul complet
                </>
              ) : (
                <>
                  <Maximize className="h-4 w-4" />
                  Ecran complet
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}