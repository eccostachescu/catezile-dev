let __cached: any | undefined;

export function getInitialData<T = any>(): T | null {
  if (__cached !== undefined) return (__cached as T | null);
  if (typeof document === 'undefined') { __cached = null; return null; }
  const el = document.getElementById('prerender-data');
  if (!el) { __cached = null; return null; }
  try {
    __cached = JSON.parse(el.textContent || 'null');
    return __cached as T | null;
  } catch {
    __cached = null;
    return null;
  }
}

