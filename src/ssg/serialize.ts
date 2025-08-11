export function getInitialData<T = any>(): T | null {
  if (typeof document === 'undefined') return null;
  const el = document.getElementById('prerender-data');
  if (!el) return null;
  try {
    return JSON.parse(el.textContent || 'null') as T;
  } catch {
    return null;
  }
}
