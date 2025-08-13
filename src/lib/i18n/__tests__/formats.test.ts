import { describe, it, expect } from 'vitest';
import { fmtDate, fmtTime, fmtDateTime, fmtShortDate } from '../formats';

describe('Date and Time Formatting', () => {
  // Test with fixed dates to ensure consistency
  const testDate = '2025-08-15T20:45:00+03:00'; // Summer time in Romania
  const winterDate = '2025-01-15T20:45:00+02:00'; // Winter time in Romania

  describe('fmtDate', () => {
    it('formats dates in Romanian locale', () => {
      const result = fmtDate(testDate);
      expect(result).toContain('august');
      expect(result).toContain('2025');
      expect(result).toContain('15');
    });

    it('handles winter dates correctly', () => {
      const result = fmtDate(winterDate);
      expect(result).toContain('ianuarie');
      expect(result).toContain('2025');
    });
  });

  describe('fmtTime', () => {
    it('formats time in 24-hour format', () => {
      const result = fmtTime(testDate);
      expect(result).toBe('20:45');
    });

    it('handles different times correctly', () => {
      const morningTime = '2025-08-15T09:30:00+03:00';
      const result = fmtTime(morningTime);
      expect(result).toBe('09:30');
    });
  });

  describe('fmtDateTime', () => {
    it('combines date and time with "ora"', () => {
      const result = fmtDateTime(testDate);
      expect(result).toContain('august');
      expect(result).toContain('20:45');
      expect(result).toContain('ora');
    });
  });

  describe('fmtShortDate', () => {
    it('formats short date', () => {
      const result = fmtShortDate(testDate);
      expect(result).toContain('15');
      expect(result).toContain('aug');
    });
  });
});

describe('Romanian weekdays and months', () => {
  it('includes Romanian diacritics in weekdays', () => {
    // Test Tuesday (marți) and Saturday (sâmbătă)
    const tuesday = '2025-08-12T12:00:00+03:00'; // Tuesday
    const saturday = '2025-08-16T12:00:00+03:00'; // Saturday
    
    const tuesdayResult = fmtDate(tuesday);
    const saturdayResult = fmtDate(saturday);
    
    expect(tuesdayResult).toContain('marți');
    expect(saturdayResult).toContain('sâmbătă');
  });

  it('includes Romanian diacritics in months', () => {
    // Test months with diacritics
    const february = '2025-02-15T12:00:00+02:00';
    const june = '2025-06-15T12:00:00+03:00';
    
    const febResult = fmtDate(february);
    const juneResult = fmtDate(june);
    
    expect(febResult).toContain('februarie');
    expect(juneResult).toContain('iunie');
  });
});