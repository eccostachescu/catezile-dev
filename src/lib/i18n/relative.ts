import { DateTime } from 'luxon';

const TZ = 'Europe/Bucharest';
const rtf = new Intl.RelativeTimeFormat('ro', { numeric: 'auto' });

export function humanDay(iso: string): string {
  const now = DateTime.now().setZone(TZ).startOf('day');
  const date = DateTime.fromISO(iso, { zone: TZ }).startOf('day');
  const diff = date.diff(now, 'days').days;
  
  if (diff === 0) return 'azi';
  if (diff === 1) return 'mâine';
  if (diff === 2) return 'poimâine';
  if (diff === -1) return 'ieri';
  if (diff === -2) return 'alaltăieri';
  
  return rtf.format(Math.round(diff), 'day');
}

export function relativeFromNow(iso: string): string {
  const now = DateTime.now().setZone(TZ);
  const date = DateTime.fromISO(iso, { zone: TZ });
  const seconds = Math.round(date.diff(now, 'seconds').seconds);
  const absSeconds = Math.abs(seconds);
  
  if (absSeconds < 60) {
    return rtf.format(seconds, 'second');
  }
  
  if (absSeconds < 3600) {
    return rtf.format(Math.round(seconds / 60), 'minute');
  }
  
  if (absSeconds < 86400) {
    return rtf.format(Math.round(seconds / 3600), 'hour');
  }
  
  return rtf.format(Math.round(seconds / 86400), 'day');
}

export function timeUntil(iso: string): {
  value: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
  label: string;
} {
  const now = DateTime.now().setZone(TZ);
  const date = DateTime.fromISO(iso, { zone: TZ });
  const seconds = Math.round(date.diff(now, 'seconds').seconds);
  
  if (seconds <= 0) {
    return { value: 0, unit: 'seconds', label: 'acum' };
  }
  
  if (seconds < 60) {
    return { value: seconds, unit: 'seconds', label: relativeFromNow(iso) };
  }
  
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return { value: minutes, unit: 'minutes', label: relativeFromNow(iso) };
  }
  
  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return { value: hours, unit: 'hours', label: relativeFromNow(iso) };
  }
  
  const days = Math.round(hours / 24);
  return { value: days, unit: 'days', label: relativeFromNow(iso) };
}

// Smart relative time that switches to absolute for far dates
export function smartRelative(iso: string, showTime = false): string {
  const now = DateTime.now().setZone(TZ);
  const date = DateTime.fromISO(iso, { zone: TZ });
  const diffDays = Math.abs(date.diff(now, 'days').days);
  
  // Use relative time for dates within 7 days
  if (diffDays <= 7) {
    const day = humanDay(iso);
    if (showTime && (day === 'azi' || day === 'mâine')) {
      const time = date.toFormat('HH:mm');
      return `${day} la ${time}`;
    }
    return day;
  }
  
  // Use absolute date for far dates
  return date.setLocale('ro').toLocaleString({
    day: 'numeric',
    month: 'long',
    year: diffDays > 365 ? 'numeric' : undefined
  });
}