import { describe, it, expect } from 'vitest';
import { formatRoDate } from '@/lib/date';

describe('formatRoDate', () => {
  it('formats Romanian date with time', () => {
    const d = new Date('2025-08-12T18:45:00+03:00');
    expect(formatRoDate(d, true)).toBe('12 aug. 2025, 18:45');
  });
});
