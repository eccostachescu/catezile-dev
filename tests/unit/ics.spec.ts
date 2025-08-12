import { describe, it, expect } from 'vitest';
import { buildIcs } from '@/lib/ics';

describe('buildIcs', () => {
  it('generates a valid VCALENDAR with VEVENT', () => {
    const start = new Date('2025-08-12T15:00:00Z');
    const end = new Date('2025-08-12T16:00:00Z');
    const ics = buildIcs({ title: 'Test Event', start, end, url: 'https://catezile.ro/e/test' });
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('SUMMARY:Test Event');
    expect(ics).toContain('DTSTART:');
    expect(ics).toContain('DTEND:');
    expect(ics).toContain('URL:https://catezile.ro/e/test');
    expect(ics).toContain('END:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });
});
