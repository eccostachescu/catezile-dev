import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/cz-badge';
import { Calendar, MapPin, Bell } from 'lucide-react';
import { formatRoDate } from '@/lib/date';

interface CountdownDisplayProps {
  id: string;
  title: string;
  slug: string;
  startDate: string;
  location?: string;
  category?: string;
  imageUrl?: string;
  description?: string;
  onReminderClick?: (id: string) => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export default function CountdownDisplay({
  id,
  title,
  slug,
  startDate,
  location,
  category,
  imageUrl,
  description,
  onReminderClick,
}: CountdownDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date(startDate);
      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds, total: diff };
    };

    const updateTimer = () => {
      setTimeLeft(calculateTimeLeft());
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  const getCategoryVariant = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'sport': return 'sport';
      case 'film': case 'movie': return 'film';
      case 'holiday': case 'sarbatoare': return 'holiday';
      case 'religioasa': return 'holiday';
      default: return 'event';
    }
  };

  const handleReminderClick = () => {
    onReminderClick?.(id);
  };

  const timeSegment = (value: number, label: string) => (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-[--cz-ink] tabular-nums">
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs text-[--cz-ink-muted] mt-1">{label}</div>
    </div>
  );

  return (
    <Card className="p-6 bg-[--cz-surface] border border-[--cz-border] rounded-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-[--cz-ink] mb-2">{title}</h3>
          <div className="flex items-center gap-2 text-sm text-[--cz-ink-muted] mb-2">
            <Calendar className="h-4 w-4" />
            <span>{formatRoDate(new Date(startDate), false)}</span>
          </div>
          {location && (
            <div className="flex items-center gap-2 text-sm text-[--cz-ink-muted]">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>
        {category && (
          <Badge variant={getCategoryVariant(category)} className="text-xs">
            {category}
          </Badge>
        )}
      </div>

      {/* Countdown */}
      {timeLeft.total > 0 ? (
        <div className="grid grid-cols-4 gap-4 mb-4">
          {timeSegment(timeLeft.days, 'Zile')}
          {timeSegment(timeLeft.hours, 'Ore')}
          {timeSegment(timeLeft.minutes, 'Minute')}
          {timeSegment(timeLeft.seconds, 'Secunde')}
        </div>
      ) : (
        <div className="text-center py-4 text-[--cz-ink-muted]">
          Evenimentul a trecut
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[--cz-border]">
        <span className="text-sm font-medium text-[--cz-ink]">{title}</span>
        {onReminderClick && (
          <button
            onClick={handleReminderClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[--cz-primary] hover:text-[--cz-primary-600] transition-colors"
          >
            <Bell className="h-4 w-4" />
            Reminder
          </button>
        )}
      </div>

      {description && (
        <p className="text-sm text-[--cz-ink-muted] mt-3 line-clamp-2">
          {description}
        </p>
      )}
    </Card>
  );
}