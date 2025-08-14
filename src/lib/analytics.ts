import { isGranted } from "./consent";

// Rate limiting for analytics events
const eventQueue = new Set<string>();
const THROTTLE_DELAY = 1000; // 1 second between same events

export function track(event: string, payload?: Record<string, any>) {
  try {
    if (!isGranted('analytics_storage')) return;
    
    // Create a unique key for this event
    const eventKey = `${event}:${JSON.stringify(payload || {})}`;
    
    // Throttle duplicate events
    if (eventQueue.has(eventKey)) return;
    
    eventQueue.add(eventKey);
    setTimeout(() => eventQueue.delete(eventKey), THROTTLE_DELAY);
    
    // Check if plausible is available and not rate limited
    const plausible = (window as any).plausible;
    if (typeof plausible === 'function') {
      plausible(event, { props: payload });
    }
  } catch (error) {
    // Silently fail analytics errors
    console.debug('Analytics error:', error);
  }
}
