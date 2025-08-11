type OgType = 'home'|'event'|'match'|'movie'|'category'|'generic'|'bf';

type BuildOgParams = {
  type: OgType;
  slug?: string;
  id?: string;
  merchant?: string;
  title?: string;
  theme?: 'T2'|'T3'|'T1';
  w?: number;
  h?: number;
};

export function buildOgUrl(params: BuildOgParams) {
  const { type, slug, id, merchant, title, theme = 'T2', w, h } = params;
  const base = typeof window !== 'undefined' ? window.location.origin : 'https://catezile.ro';
  const url = new URL(base + '/og');
  url.searchParams.set('type', type);
  if (slug) url.searchParams.set('slug', slug);
  if (id) url.searchParams.set('id', id);
  if (merchant) url.searchParams.set('merchant', merchant);
  if (title) url.searchParams.set('title', title);
  if (theme) url.searchParams.set('theme', theme);
  if (w) url.searchParams.set('w', String(w));
  if (h) url.searchParams.set('h', String(h));
  return url.toString();
}
