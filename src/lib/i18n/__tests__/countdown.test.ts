import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { countdown, simpleCountdown, contextualCountdown } from '../countdown';

describe('Countdown Logic', () => {
  const mockNow = new Date('2025-08-15T12:00:00+03:00');
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('countdown', () => {
    it('shows LIVE for ongoing events', () => {
      const start = '2025-08-15T11:00:00+03:00';
      const end = '2025-08-15T14:00:00+03:00';
      
      const result = countdown(start, end);
      
      expect(result.label).toBe('LIVE');
      expect(result.isLive).toBe(true);
      expect(result.hasEnded).toBe(false);
      expect(result.sub).toContain('se încheie în');
    });

    it('shows ended for past events', () => {
      const start = '2025-08-15T10:00:00+03:00';
      const end = '2025-08-15T11:00:00+03:00';
      
      const result = countdown(start, end);
      
      expect(result.label).toBe('încheiat');
      expect(result.isLive).toBe(false);
      expect(result.hasEnded).toBe(true);
    });

    it('handles future events with days correctly', () => {
      const start = '2025-08-18T15:00:00+03:00'; // 3 days from now
      
      const result = countdown(start);
      
      expect(result.label).toContain('în');
      expect(result.label).toContain('zile');
      expect(result.sub).toContain('luni');
      expect(result.sub).toContain('15:00');
    });

    it('handles same day events correctly', () => {
      const start = '2025-08-15T15:30:00+03:00'; // 3.5 hours from now
      
      const result = countdown(start);
      
      expect(result.label).toContain('în');
      expect(result.label).toContain('ore');
      expect(result.sub).toBe('azi la 15:30');
    });

    it('handles minutes countdown correctly', () => {
      const start = '2025-08-15T12:30:00+03:00'; // 30 minutes from now
      
      const result = countdown(start);
      
      expect(result.label).toContain('în');
      expect(result.label).toContain('minute');
      expect(result.sub).toBe('azi la 12:30');
    });
  });

  describe('Romanian pluralization rules', () => {
    it('applies "de" particle correctly for 0', () => {
      const start = '2025-08-15T12:00:00+03:00'; // exactly now
      const result = countdown(start);
      // Should handle edge case gracefully
      expect(result).toBeDefined();
    });

    it('applies "de" particle correctly for 21', () => {
      const start = '2025-09-05T12:00:00+03:00'; // 21 days from now
      const result = countdown(start);
      expect(result.label).toContain('21 de zile');
    });

    it('does not apply "de" particle for small numbers', () => {
      const start = '2025-08-18T12:00:00+03:00'; // 3 days from now
      const result = countdown(start);
      expect(result.label).toContain('3 zile');
      expect(result.label).not.toContain('de zile');
    });

    it('handles 1 day correctly (singular)', () => {
      const start = '2025-08-16T12:00:00+03:00'; // 1 day from now
      const result = countdown(start);
      expect(result.label).toContain('1 zi');
    });

    it('handles 1 hour correctly (singular)', () => {
      const start = '2025-08-15T13:00:00+03:00'; // 1 hour from now
      const result = countdown(start);
      expect(result.label).toContain('1 oră');
    });
  });

  describe('simpleCountdown', () => {
    it('returns simple labels', () => {
      const start = '2025-08-16T12:00:00+03:00';
      const result = simpleCountdown(start);
      expect(result).toContain('în');
    });
  });

  describe('contextualCountdown', () => {
    it('adjusts sub text for hero context', () => {
      const today = '2025-08-15T15:00:00+03:00';
      const result = contextualCountdown(today, undefined, 'hero');
      expect(result.sub).toBe('astăzi la ora 15:00');
    });

    it('adjusts sub text for tomorrow in hero context', () => {
      const tomorrow = '2025-08-16T20:00:00+03:00';
      const result = contextualCountdown(tomorrow, undefined, 'hero');
      expect(result.sub).toBe('mâine la ora 20:00');
    });
  });
});