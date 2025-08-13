import { DateTime } from 'luxon';

const TZ = 'Europe/Bucharest';

export const fmtDate = (iso: string) => {
  return DateTime.fromISO(iso, { zone: TZ })
    .setLocale('ro')
    .toLocaleString({ 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
};

export const fmtShortDate = (iso: string) => {
  return DateTime.fromISO(iso, { zone: TZ })
    .setLocale('ro')
    .toLocaleString({ 
      day: '2-digit', 
      month: 'short' 
    });
};

export const fmtTime = (iso: string) => {
  return DateTime.fromISO(iso, { zone: TZ })
    .setLocale('ro')
    .toLocaleString({ 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
};

export const fmtDateTime = (iso: string) => {
  return `${fmtDate(iso)}, ora ${fmtTime(iso)}`;
};

export const fmtShortDateTime = (iso: string) => {
  return `${fmtShortDate(iso)}, ${fmtTime(iso)}`;
};

export const fmtWeekday = (iso: string) => {
  return DateTime.fromISO(iso, { zone: TZ })
    .setLocale('ro')
    .toLocaleString({ weekday: 'long' });
};

export const fmtMonth = (iso: string) => {
  return DateTime.fromISO(iso, { zone: TZ })
    .setLocale('ro')
    .toLocaleString({ month: 'long' });
};

export const fmtYear = (iso: string) => {
  return DateTime.fromISO(iso, { zone: TZ })
    .toLocaleString({ year: 'numeric' });
};

export const fmtCurrencyRON = (n: number) => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON'
  }).format(n);
};

export const fmtNumber = (n: number) => {
  return new Intl.NumberFormat('ro-RO').format(n);
};

// Format duration in Romanian
export const fmtDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} minute`;
  if (mins === 0) return `${hours} ${hours === 1 ? 'oră' : 'ore'}`;
  return `${hours}h ${mins}m`;
};

// Check if date is today in Romania timezone
export const isToday = (iso: string) => {
  const now = DateTime.now().setZone(TZ).startOf('day');
  const date = DateTime.fromISO(iso, { zone: TZ }).startOf('day');
  return now.equals(date);
};

// Check if date is tomorrow in Romania timezone
export const isTomorrow = (iso: string) => {
  const tomorrow = DateTime.now().setZone(TZ).plus({ days: 1 }).startOf('day');
  const date = DateTime.fromISO(iso, { zone: TZ }).startOf('day');
  return tomorrow.equals(date);
};

// Check if date is this weekend (Saturday or Sunday)
export const isThisWeekend = (iso: string) => {
  const date = DateTime.fromISO(iso, { zone: TZ });
  const weekday = date.weekday; // 1 = Monday, 7 = Sunday
  return weekday === 6 || weekday === 7; // Saturday or Sunday
};