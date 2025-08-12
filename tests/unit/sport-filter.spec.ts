import { describe, it, expect } from 'vitest';
import { filterMatch } from '@/components/sport/filter';

describe('sport filter', () => {
  const base = {
    id: '1', home: 'FCSB', away: 'CFR Cluj', kickoff_at: new Date().toISOString(),
    tv_channels: ['Digi Sport 1', 'Prima Sport 1'], status: 'SCHEDULED', score: {}
  };

  it('filters by team', () => {
    expect(filterMatch(base, 'FCSB', [], '')).toBe(true);
    expect(filterMatch(base, 'Universitatea Craiova', [], '')).toBe(false);
  });

  it('filters by tv', () => {
    expect(filterMatch(base, null, ['Digi Sport 1'], '')).toBe(true);
    expect(filterMatch(base, null, ['Orange Sport 1'], '')).toBe(false);
  });

  it('quick search matches team and tv', () => {
    expect(filterMatch(base, null, [], 'cfr')).toBe(true);
    expect(filterMatch(base, null, [], 'digi')).toBe(true);
    expect(filterMatch(base, null, [], 'netflix')).toBe(false);
  });
});
