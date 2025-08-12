import { isGranted } from "./consent";
export function track(event: string, payload?: Record<string, any>) {
  try {
    if (!isGranted('analytics_storage')) return;
    (window as any).plausible?.(event, { props: payload });
  } catch {}
}
