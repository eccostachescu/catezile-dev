import { createHash } from "https://deno.land/std@0.224.0/hash/mod.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Fonts cache
const fontCache = new Map<string, Uint8Array>();
export async function getFont(name: string) {
  if (fontCache.has(name)) return fontCache.get(name)!;
  const data = await Deno.readFile(new URL(`./fonts/${name}`, import.meta.url));
  fontCache.set(name, data);
  return data;
}

export function okDimensions(w: number, h: number) {
  const allowed = [
    [1200, 630],
    [1080, 1080],
    [1080, 1920],
  ];
  return allowed.some(([aw, ah]) => aw === w && ah === h);
}

export async function etagFor(s: string) {
  const hash = createHash('sha1');
  hash.update(s);
  return `W/"${hash.toString()}"`;
}

export function formatRoDate(input?: string | number | Date | null, withTime?: boolean) {
  if (!input) return '';
  const d = new Date(input);
  return new Intl.DateTimeFormat('ro-RO', {
    timeZone: 'Europe/Bucharest',
    day: '2-digit', month: 'short', year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(d);
}

const WHITELIST = new Set([ 'image.tmdb.org' ]);
export async function imageToDataURL(url?: string | null): Promise<string | null> {
  try {
    if (!url) return null;
    const u = new URL(url);
    if (!WHITELIST.has(u.hostname)) return null;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    const b64 = btoa(String.fromCharCode(...buf));
    const ct = res.headers.get('content-type') || 'image/jpeg';
    return `data:${ct};base64,${b64}`;
  } catch {
    return null;
  }
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out: any = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}
