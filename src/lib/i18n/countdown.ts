import { DateTime, Interval } from 'luxon';

const TZ = 'Europe/Bucharest';

// Romanian pluralization helper for "de" particle
const needsDeParticle = (count: number): boolean => {
  return count === 0 || count >= 20;
};

// Format time units in Romanian with proper pluralization
const formatUnit = (count: number, unit: 'zi' | 'ora' | 'minut' | 'secunda'): string => {
  const hasDeParticle = needsDeParticle(count);
  
  switch (unit) {
    case 'zi':
      if (count === 1) return `${count} zi`;
      return `${count}${hasDeParticle ? ' de' : ''} zile`;
    
    case 'ora':
      if (count === 1) return `${count} oră`;
      return `${count}${hasDeParticle ? ' de' : ''} ore`;
    
    case 'minut':
      if (count === 1) return `${count} minut`;
      return `${count}${hasDeParticle ? ' de' : ''} minute`;
    
    case 'secunda':
      if (count === 1) return `${count} secundă`;
      return `${count}${hasDeParticle ? ' de' : ''} secunde`;
  }
};

export interface CountdownResult {
  label: string;
  sub: string;
  isLive: boolean;
  hasEnded: boolean;
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export function countdown(isoStart: string, isoEnd?: string): CountdownResult {
  const now = DateTime.now().setZone(TZ);
  const start = DateTime.fromISO(isoStart, { zone: TZ });
  const end = isoEnd ? DateTime.fromISO(isoEnd, { zone: TZ }) : undefined;

  // Event is live (started but not ended)
  if (end && now >= start && now < end) {
    const remainingMinutes = Math.max(1, Math.round(end.diff(now, 'minutes').minutes));
    return {
      label: 'LIVE',
      sub: `se încheie în ${formatUnit(remainingMinutes, 'minut')}`,
      isLive: true,
      hasEnded: false,
      timeRemaining: {
        days: 0,
        hours: 0,
        minutes: remainingMinutes,
        seconds: 0
      }
    };
  }

  // Event has ended
  if (now >= start) {
    return {
      label: 'încheiat',
      sub: '',
      isLive: false,
      hasEnded: true
    };
  }

  // Event hasn't started yet
  const duration = start.diff(now, ['days', 'hours', 'minutes']).toObject();
  const days = Math.floor(duration.days || 0);
  const hours = Math.floor(duration.hours || 0);
  const minutes = Math.floor(duration.minutes || 0);

  const timeRemaining = { days, hours, minutes, seconds: 0 };

  // More than a day remaining
  if (days > 0) {
    const mainLabel = formatUnit(days, 'zi');
    const hoursPart = hours > 0 ? ` și ${formatUnit(hours, 'ora')}` : '';
    
    return {
      label: `în ${mainLabel}${hoursPart}`,
      sub: start.toFormat("cccc, dd LLLL yyyy 'ora' HH:mm", { locale: 'ro' }),
      isLive: false,
      hasEnded: false,
      timeRemaining
    };
  }

  // Same day - show hours and minutes
  if (hours > 0) {
    const mainLabel = formatUnit(hours, 'ora');
    const minutesPart = minutes > 0 ? ` și ${formatUnit(minutes, 'minut')}` : '';
    
    return {
      label: `în ${mainLabel}${minutesPart}`,
      sub: start.toFormat("'azi la' HH:mm"),
      isLive: false,
      hasEnded: false,
      timeRemaining
    };
  }

  // Less than an hour - show minutes only
  const finalMinutes = Math.max(1, minutes);
  return {
    label: `în ${formatUnit(finalMinutes, 'minut')}`,
    sub: start.toFormat("'azi la' HH:mm"),
    isLive: false,
    hasEnded: false,
    timeRemaining
  };
}

// Simple countdown for cards (short format)
export function simpleCountdown(isoStart: string, isoEnd?: string): string {
  const result = countdown(isoStart, isoEnd);
  
  if (result.isLive) return 'LIVE';
  if (result.hasEnded) return 'încheiat';
  
  return result.label;
}

// Countdown with context for different UI components
export function contextualCountdown(
  isoStart: string, 
  isoEnd?: string, 
  context: 'card' | 'hero' | 'list' = 'card'
): CountdownResult {
  const result = countdown(isoStart, isoEnd);
  
  // Adjust sub text based on context
  if (context === 'hero' && !result.isLive && !result.hasEnded) {
    const start = DateTime.fromISO(isoStart, { zone: TZ });
    const now = DateTime.now().setZone(TZ);
    
    // For hero context, provide more detailed sub text
    if (start.hasSame(now, 'day')) {
      result.sub = start.toFormat("'astăzi la ora' HH:mm");
    } else if (start.hasSame(now.plus({ days: 1 }), 'day')) {
      result.sub = start.toFormat("'mâine la ora' HH:mm");
    }
  }
  
  return result;
}