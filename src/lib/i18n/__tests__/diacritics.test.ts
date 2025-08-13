import { describe, it, expect } from 'vitest';
import { 
  stripDiacritics, 
  normalizeRo, 
  slugifyRo, 
  matchesSearch, 
  createSlug,
  searchVariants 
} from '../diacritics';

describe('Diacritics Handling', () => {
  describe('stripDiacritics', () => {
    it('removes Romanian diacritics correctly', () => {
      expect(stripDiacritics('Țară Știință')).toBe('Tara Stiinta');
      expect(stripDiacritics('Mâine în București')).toBe('Maine in Bucuresti');
      expect(stripDiacritics('Sărbătoare românească')).toBe('Sarbatoare romaneasca');
      expect(stripDiacritics('Împărăteasă')).toBe('Imparateasa');
    });

    it('handles both new and old diacritic forms', () => {
      expect(stripDiacritics('ș')).toBe('s');
      expect(stripDiacritics('ş')).toBe('s'); // old form
      expect(stripDiacritics('ț')).toBe('t');
      expect(stripDiacritics('ţ')).toBe('t'); // old form
    });

    it('preserves non-diacritic characters', () => {
      expect(stripDiacritics('123 ABC xyz')).toBe('123 ABC xyz');
    });
  });

  describe('normalizeRo', () => {
    it('normalizes and lowercases text', () => {
      expect(normalizeRo('ȚARĂ ȘTIINȚĂ')).toBe('tara stiinta');
      expect(normalizeRo('MâINE')).toBe('maine');
    });

    it('handles mixed text correctly', () => {
      expect(normalizeRo('Liga 1 — FCSB vs CFR')).toBe('liga 1 — fcsb vs cfr');
    });
  });

  describe('slugifyRo', () => {
    it('creates URL-safe slugs', () => {
      expect(slugifyRo('Liga 1 — FCSB vs CFR')).toBe('liga-1-fcsb-vs-cfr');
      expect(slugifyRo('Crăciun în România')).toBe('craciun-in-romania');
      expect(slugifyRo('Teatrul Național "I.L. Caragiale"')).toBe('teatrul-national-i-l-caragiale');
    });

    it('removes special characters', () => {
      expect(slugifyRo('Test!@#$%^&*()_+')).toBe('test');
      expect(slugifyRo('Multiple   spaces')).toBe('multiple-spaces');
    });

    it('trims hyphens from start and end', () => {
      expect(slugifyRo('---start and end---')).toBe('start-and-end');
      expect(slugifyRo('!@#test!@#')).toBe('test');
    });
  });

  describe('matchesSearch', () => {
    it('matches text with or without diacritics', () => {
      expect(matchesSearch('Știință', 'stiinta')).toBe(true);
      expect(matchesSearch('Știință', 'Stiinta')).toBe(true);
      expect(matchesSearch('Știință', 'știință')).toBe(true);
      expect(matchesSearch('stiinta', 'Știință')).toBe(true);
    });

    it('performs partial matches', () => {
      expect(matchesSearch('Liga 1 România', 'liga')).toBe(true);
      expect(matchesSearch('Liga 1 România', 'romania')).toBe(true);
      expect(matchesSearch('Liga 1 România', 'Liga 1')).toBe(true);
    });

    it('returns false for non-matches', () => {
      expect(matchesSearch('Fotbal', 'tenis')).toBe(false);
      expect(matchesSearch('București', 'paris')).toBe(false);
    });
  });

  describe('createSlug', () => {
    it('creates slug from title', () => {
      expect(createSlug('Concertul de Crăciun')).toBe('concertul-de-craciun');
    });

    it('uses fallback for empty results', () => {
      expect(createSlug('!@#$%', 'fallback-title')).toBe('fallback-title');
    });

    it('returns default for completely empty input', () => {
      expect(createSlug('')).toBe('untitled');
      expect(createSlug('!@#$%')).toBe('untitled');
    });
  });

  describe('searchVariants', () => {
    it('returns unique variants', () => {
      const variants = searchVariants('Știință');
      expect(variants).toContain('Știință');
      expect(variants).toContain('stiinta');
      expect(variants.length).toBeGreaterThan(0);
    });

    it('handles text without diacritics', () => {
      const variants = searchVariants('Romania');
      expect(variants).toContain('Romania');
      expect(variants).toContain('romania');
    });
  });
});