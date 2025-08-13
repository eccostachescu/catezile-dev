import { describe, it, expect } from 'vitest';
import { DateTime } from 'luxon';

describe('Timezone Handling', () => {
  const TZ = 'Europe/Bucharest';

  describe('Daylight Saving Time', () => {
    it('handles summer time correctly (UTC+3)', () => {
      const summerDate = '2025-08-15T12:00:00Z'; // UTC time
      const dt = DateTime.fromISO(summerDate, { zone: TZ });
      
      // In summer, Romania is UTC+3
      expect(dt.hour).toBe(15);
      expect(dt.offset).toBe(180); // 3 hours * 60 minutes
    });

    it('handles winter time correctly (UTC+2)', () => {
      const winterDate = '2025-01-15T12:00:00Z'; // UTC time
      const dt = DateTime.fromISO(winterDate, { zone: TZ });
      
      // In winter, Romania is UTC+2
      expect(dt.hour).toBe(14);
      expect(dt.offset).toBe(120); // 2 hours * 60 minutes
    });

    it('handles DST transition correctly', () => {
      // Last Sunday in March 2025 (DST starts)
      const beforeDST = DateTime.fromObject(
        { year: 2025, month: 3, day: 30, hour: 2, minute: 30 },
        { zone: TZ }
      );
      
      const afterDST = DateTime.fromObject(
        { year: 2025, month: 3, day: 30, hour: 4, minute: 30 },
        { zone: TZ }
      );

      expect(beforeDST.offset).toBe(120); // UTC+2
      expect(afterDST.offset).toBe(180); // UTC+3
    });
  });

  describe('Romanian locale formatting', () => {
    it('uses Romanian day names', () => {
      const monday = DateTime.fromObject(
        { year: 2025, month: 8, day: 11 }, // Monday
        { zone: TZ }
      );
      
      const dayName = monday.setLocale('ro').toLocaleString({ weekday: 'long' });
      expect(dayName).toBe('luni');
    });

    it('uses Romanian month names', () => {
      const august = DateTime.fromObject(
        { year: 2025, month: 8, day: 15 },
        { zone: TZ }
      );
      
      const monthName = august.setLocale('ro').toLocaleString({ month: 'long' });
      expect(monthName).toBe('august');
    });

    it('includes Romanian diacritics in weekdays', () => {
      const tuesday = DateTime.fromObject(
        { year: 2025, month: 8, day: 12 }, // Tuesday
        { zone: TZ }
      );
      
      const saturday = DateTime.fromObject(
        { year: 2025, month: 8, day: 16 }, // Saturday  
        { zone: TZ }
      );
      
      expect(tuesday.setLocale('ro').toLocaleString({ weekday: 'long' })).toBe('marți');
      expect(saturday.setLocale('ro').toLocaleString({ weekday: 'long' })).toBe('sâmbătă');
    });
  });

  describe('Time comparisons', () => {
    it('correctly compares times in Romanian timezone', () => {
      const now = DateTime.now().setZone(TZ);
      const future = now.plus({ hours: 1 });
      const past = now.minus({ hours: 1 });
      
      expect(future > now).toBe(true);
      expect(past < now).toBe(true);
    });

    it('handles start of day correctly', () => {
      const dateTime = DateTime.fromISO('2025-08-15T14:30:00+03:00', { zone: TZ });
      const startOfDay = dateTime.startOf('day');
      
      expect(startOfDay.hour).toBe(0);
      expect(startOfDay.minute).toBe(0);
      expect(startOfDay.second).toBe(0);
    });
  });
});