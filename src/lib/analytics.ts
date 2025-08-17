import { isGranted } from "./consent";

interface PlausibleEvent {
  name: string;
  url?: string;
  domain?: string;
  props?: Record<string, string | number | boolean>;
}

// Check if we're in development/preview environment (more aggressive)
const isDevelopment = 
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('lovable') ||
    window.location.hostname.includes('preview') ||
    window.location.hostname.includes('127.0.0.1') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.hostname.includes('dev') ||
    window.location.port === '8080' ||
    import.meta.env.DEV ||
    import.meta.env.MODE !== 'production'
  );

// More aggressive rate limiting
let eventQueue: PlausibleEvent[] = [];
let lastFlush = 0;
let eventHistory = new Set<string>();
const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_EVENTS_PER_FLUSH = 2;
const EVENT_DEDUP_TIME = 10000; // 10 seconds

const flushEvents = () => {
  if (isDevelopment) {
    console.log('📊 Analytics (dev mode):', eventQueue);
    eventQueue = [];
    return;
  }

  if (eventQueue.length === 0) return;
  
  const now = Date.now();
  if (now - lastFlush < FLUSH_INTERVAL) return;
  
  const eventsToSend = eventQueue.splice(0, MAX_EVENTS_PER_FLUSH);
  lastFlush = now;

  // Send events to Plausible
  eventsToSend.forEach(event => {
    try {
      window.plausible?.(event.name, {
        props: event.props,
        u: event.url
      });
    } catch (error) {
      console.warn('Analytics error:', error);
    }
  });
};

// Completely disabled track function for development
export const track = (eventName: string, props?: Record<string, any>) => {
  // COMPLETELY DISABLE ANALYTICS IN DEVELOPMENT
  if (isDevelopment) {
    return; // Do nothing, not even logging
  }
  
  try {
    if (!isGranted('analytics_storage')) return;
    
    // Create unique event key for deduplication
    const eventKey = `${eventName}:${JSON.stringify(props || {})}`;
    
    // Skip if same event was recently tracked (extended to 30 seconds)
    if (eventHistory.has(eventKey)) return;
    
    // Add to history with cleanup
    eventHistory.add(eventKey);
    setTimeout(() => eventHistory.delete(eventKey), 30000); // Extended deduplication
    
    // More conservative queue management
    if (eventQueue.length >= 3) {
      return; // Don't add more if queue is getting full
    }
    
    eventQueue.push({
      name: eventName,
      url: window.location.href,
      domain: window.location.hostname,
      props: props || {}
    });

    // Much longer debounced flush
    setTimeout(flushEvents, 5000);
  } catch (error) {
    // Silently ignore all errors
  }
};

// Completely disabled page view tracking for development
export const trackPageView = (url?: string) => {
  // COMPLETELY DISABLE IN DEVELOPMENT
  if (isDevelopment) {
    return; // Do nothing
  }

  try {
    if (!isGranted('analytics_storage')) return;
    
    window.plausible?.('pageview', {
      u: url || window.location.href
    });
  } catch (error) {
    // Silently ignore
  }
};

// COMPLETELY DISABLE analytics initialization in development
export const initAnalytics = () => {
  if (isDevelopment) {
    return; // Do nothing in development
  }

  // Load Plausible script only in production
  if (!window.plausible && !document.querySelector('script[data-domain]')) {
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', 'catezile.ro');
    script.src = 'https://plausible.io/js/script.outbound-links.pageview-props.tagged-events.js';
    
    script.onerror = () => {
      // Silently fail
    };
    
    document.head.appendChild(script);
  }
};

// Export types
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any>; u?: string }) => void;
  }
}
