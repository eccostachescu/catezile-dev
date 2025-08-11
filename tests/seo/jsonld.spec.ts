import { describe, it, expect } from 'vitest';
import { eventJsonLd, sportsEventJsonLd, movieJsonLd } from '@/seo/jsonld';

describe('JSON-LD builders', () => {
  it('builds Event', () => {
    const d = new Date('2025-08-15T19:00:00+03:00');
    expect(eventJsonLd({ name: 'Untold', startDate: d })).toMatchObject({ '@type': 'Event', name: 'Untold' });
  });
  it('builds SportsEvent', () => {
    const d = new Date('2025-08-15T19:00:00+03:00');
    expect(sportsEventJsonLd({ name: 'FCSB vs CFR', homeTeam: 'FCSB', awayTeam: 'CFR', startDate: d })).toMatchObject({ '@type': 'SportsEvent' });
  });
  it('builds Movie', () => {
    const d = new Date('2025-08-15');
    expect(movieJsonLd({ name: 'Moromeții 3', releaseDate: d })).toMatchObject({ '@type': 'Movie' });
  });
});
