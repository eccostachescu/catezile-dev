import { describe, it, expect } from "vitest";
import { defaultConsent, getConsent, setConsent, isGranted } from "@/lib/consent";

describe('Consent utils', () => {
  it('defaults to denied analytics', () => {
    localStorage.clear();
    expect(isGranted('analytics_storage')).toBe(false);
  });
  it('can grant analytics', () => {
    localStorage.clear();
    setConsent({ analytics_storage: 'granted' });
    expect(isGranted('analytics_storage')).toBe(true);
  });
});
