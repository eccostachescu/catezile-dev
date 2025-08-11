export function track(event: string, payload?: Record<string, any>) {
  try {
    // Use plausible if available
    (window as any).plausible?.(event, { props: payload });
  } catch {}
}
