import { isGranted } from "./consent";

// Rate limiting for analytics events
const eventQueue = new Set<string>();
const recentEvents = new Map<string, number>();
const THROTTLE_DELAY = 2000; // 2 seconds between same events
const MAX_EVENTS_PER_MINUTE = 10; // Maximum events per minute
const MINUTE_MS = 60 * 1000;

export function track(event: string, payload?: Record<string, any>) {
  try {
    if (!isGranted('analytics_storage')) return;
    
    // Create a unique key for this event
    const eventKey = `${event}:${JSON.stringify(payload || {})}`;
    
    // Throttle duplicate events
    if (eventQueue.has(eventKey)) return;
    
    // Check rate limiting - max events per minute
    const now = Date.now();
    const recentEventTimes = Array.from(recentEvents.values()).filter(time => now - time < MINUTE_MS);
    
    if (recentEventTimes.length >= MAX_EVENTS_PER_MINUTE) {
      console.debug('Analytics rate limit exceeded, skipping event:', event);
      return;
    }
    
    eventQueue.add(eventKey);
    recentEvents.set(eventKey, now);
    
    // Clean up old events
    setTimeout(() => {
      eventQueue.delete(eventKey);
      recentEvents.delete(eventKey);
    }, THROTTLE_DELAY);
    
    // Check if plausible is available
    const plausible = (window as any).plausible;
    if (typeof plausible === 'function') {
      // Add a small delay to prevent rapid-fire events
      setTimeout(() => {
        try {
          plausible(event, { props: payload });
        } catch (error) {
          console.debug('Plausible tracking error:', error);
        }
      }, 100);
    }
  } catch (error) {
    // Silently fail analytics errors
    console.debug('Analytics error:', error);
  }
}
