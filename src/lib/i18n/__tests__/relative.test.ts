import { describe, it, expect } from 'vitest';
import { humanDay, relativeFromNow, smartRelative } from '../relative';

describe('Relative Time', () => {
  // Mock current time for consistent testing
  const mockNow = new Date('2025-08-15T12:00:00+03:00');
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('humanDay', () => {
    it('returns "azi" for today', () => {
      const today = '2025-08-15T15:30:00+03:00';
      expect(humanDay(today)).toBe('azi');
    });

    it('returns "mâine" for tomorrow', () => {
      const tomorrow = '2025-08-16T10:00:00+03:00';
      expect(humanDay(tomorrow)).toBe('mâine');
    });

    it('returns "poimâine" for day after tomorrow', () => {
      const dayAfter = '2025-08-17T10:00:00+03:00';
      expect(humanDay(dayAfter)).toBe('poimâine');
    });

    it('returns "ieri" for yesterday', () => {
      const yesterday = '2025-08-14T10:00:00+03:00';
      expect(humanDay(yesterday)).toBe('ieri');
    });

    it('returns "alaltăieri" for day before yesterday', () => {
      const dayBefore = '2025-08-13T10:00:00+03:00';
      expect(humanDay(dayBefore)).toBe('alaltăieri');
    });
  });

  describe('relativeFromNow', () => {
    it('handles seconds correctly', () => {
      const in30Seconds = '2025-08-15T12:00:30+03:00';
      const result = relativeFromNow(in30Seconds);
      expect(result).toContain('secund');
    });

    it('handles minutes correctly', () => {
      const in5Minutes = '2025-08-15T12:05:00+03:00';
      const result = relativeFromNow(in5Minutes);
      expect(result).toContain('minut');
    });

    it('handles hours correctly', () => {
      const in3Hours = '2025-08-15T15:00:00+03:00';
      const result = relativeFromNow(in3Hours);
      expect(result).toContain('or');
    });

    it('handles past times correctly', () => {
      const past = '2025-08-15T11:30:00+03:00';
      const result = relativeFromNow(past);
      expect(result).toContain('minut');
    });
  });

  describe('smartRelative', () => {
    it('uses relative time for near dates', () => {
      const tomorrow = '2025-08-16T15:00:00+03:00';
      const result = smartRelative(tomorrow, true);
      expect(result).toBe('mâine la 15:00');
    });

    it('uses absolute date for far dates', () => {
      const farFuture = '2025-12-25T12:00:00+02:00';
      const result = smartRelative(farFuture);
      expect(result).toContain('decembrie');
    });
  });
});