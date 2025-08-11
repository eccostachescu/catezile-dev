export type Theme = { background: string; fg: string; badge: string };

export const THEMES: Record<'T1'|'T2'|'T3', Theme> = {
  T1: { background: 'linear-gradient(135deg, #0ea5e9, #22d3ee)', fg: '#ffffff', badge: 'T1' },
  T2: { background: 'linear-gradient(135deg, #6d28d9, #9333ea)', fg: '#ffffff', badge: 'T2' },
  T3: { background: 'linear-gradient(135deg, #111827, #1f2937)', fg: '#f8fafc', badge: 'T3' },
};

export function chooseTheme(input?: 'T1'|'T2'|'T3') {
  return input ? THEMES[input] : THEMES.T2;
}
