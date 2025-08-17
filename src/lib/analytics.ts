import { isGranted } from "./consent";

interface PlausibleEvent {
  name: string;
  url?: string;
  domain?: string;
  props?: Record<string, string | number | boolean>;
}

// Check if we're in development/preview environment
const isDevelopment = 
  typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname.includes('lovable.app') ||
    window.location.hostname.includes('preview') ||
    window.location.hostname.includes('127.0.0.1') ||
    window.location.hostname.includes('vercel.app') ||
    window.location.port === '8080' ||
    import.meta.env.DEV
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

// Debounced track function with deduplication
export const track = (eventName: string, props?: Record<string, any>) => {
  try {
    // Early return for development
    if (isDevelopment) {
      console.log('📊 Analytics (dev mode):', eventName, props);
      return;
    }
    
    if (!isGranted('analytics_storage')) return;
    
    // Create unique event key for deduplication
    const eventKey = `${eventName}:${JSON.stringify(props || {})}`;
    const now = Date.now();
    
    // Skip if same event was recently tracked
    if (eventHistory.has(eventKey)) return;
    
    // Add to history with cleanup
    eventHistory.add(eventKey);
    setTimeout(() => eventHistory.delete(eventKey), EVENT_DEDUP_TIME);
    
    // Add to queue with limits
    if (eventQueue.length >= 10) {
      eventQueue.shift(); // Remove oldest if queue is full
    }
    
    eventQueue.push({
      name: eventName,
      url: window.location.href,
      domain: window.location.hostname,
      props: props || {}
    });

    // Debounced flush
    setTimeout(flushEvents, 1000);
  } catch (error) {
    console.debug('Analytics error:', error);
  }
};

// Track page views with rate limiting
export const trackPageView = (url?: string) => {
  if (isDevelopment) {
    console.log('📊 Page view (dev mode):', url || window.location.href);
    return;
  }

  try {
    if (!isGranted('analytics_storage')) return;
    
    window.plausible?.('pageview', {
      u: url || window.location.href
    });
  } catch (error) {
    console.warn('Page view tracking error:', error);
  }
};

// Initialize analytics only in production
export const initAnalytics = () => {
  if (isDevelopment) {
    console.log('📊 Analytics initialized in development mode (tracking disabled)');
    return;
  }

  // Load Plausible script only in production
  if (!window.plausible && !document.querySelector('script[data-domain]')) {
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', 'catezile.ro');
    script.src = 'https://plausible.io/js/script.outbound-links.pageview-props.tagged-events.js';
    
    script.onerror = () => {
      console.warn('Failed to load Plausible analytics');
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
