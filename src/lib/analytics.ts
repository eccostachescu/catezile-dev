import { isGranted } from "./consent";

interface PlausibleEvent {
  name: string;
  url?: string;
  domain?: string;
  props?: Record<string, string | number | boolean>;
}

// Check if we're in development/preview environment
const isDevelopment = 
  window.location.hostname === 'localhost' ||
  window.location.hostname.includes('lovable.app') ||
  window.location.hostname.includes('preview') ||
  import.meta.env.DEV;

// Rate limiting
let eventQueue: PlausibleEvent[] = [];
let lastFlush = 0;
const FLUSH_INTERVAL = 2000; // 2 seconds
const MAX_EVENTS_PER_FLUSH = 5;

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

// Debounced track function
export const track = (eventName: string, props?: Record<string, any>) => {
  try {
    if (!isGranted('analytics_storage')) return;
    
    // Add to queue
    eventQueue.push({
      name: eventName,
      url: window.location.href,
      domain: window.location.hostname,
      props: props || {}
    });

    // Flush periodically
    setTimeout(flushEvents, 100);
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
