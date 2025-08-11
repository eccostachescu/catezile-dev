type OgType = 'home'|'event'|'match'|'movie'|'category'|'generic';

export function buildOgUrl({ type, slug, title, theme = 'T2' }: { type: OgType; slug?: string; title?: string; theme?: 'T2'|'T3' }) {
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro';
  const url = new URL(base + '/og');
  url.searchParams.set('type', type);
  if (slug) url.searchParams.set('slug', slug);
  if (title) url.searchParams.set('title', title);
  if (theme) url.searchParams.set('theme', theme);
  return url.toString();
}
