export type ConsentKey =
  | 'ad_user_data'
  | 'ad_personalization'
  | 'ad_storage'
  | 'analytics_storage'
  | 'functionality_storage'
  | 'personalization_storage'
  | 'security_storage';

type ConsentState = Record<ConsentKey, 'granted' | 'denied'>;

const KEY = 'catezile_consent_v2';

export const defaultConsent: ConsentState = {
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  ad_storage: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'granted',
  personalization_storage: 'denied',
  security_storage: 'granted',
};

export function getConsent(): ConsentState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultConsent, ...JSON.parse(raw) } : { ...defaultConsent };
  } catch {
    return { ...defaultConsent };
  }
}

export function setConsent(update: Partial<ConsentState>) {
  const next = { ...getConsent(), ...update };
  localStorage.setItem(KEY, JSON.stringify(next));
  try { (window as any).gtag?.('consent', 'update', next); } catch {}
}

export function ensureDefaultConsent() {
  try { (window as any).gtag?.('consent', 'default', getConsent()); } catch {}
}

export function isGranted(key: ConsentKey) {
  return getConsent()[key] === 'granted';
}
