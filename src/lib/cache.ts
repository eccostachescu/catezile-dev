// Cache version injection for client-side fetches
const cacheVersion = import.meta.env.VITE_CACHE_VERSION || '1';

// Utility to append cache version to URLs
export const withCacheVersion = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${cacheVersion}`;
};

// Fetch wrapper that automatically adds cache version
export const fetchWithCache = async (url: string, options?: RequestInit): Promise<Response> => {
  const cachedUrl = withCacheVersion(url);
  return fetch(cachedUrl, options);
};

// Get current cache version
export const getCacheVersion = (): string => cacheVersion;

// Cache headers for different content types
export const cacheHeaders = {
  // For listings that update slowly (sitemaps, RSS)
  listings: {
    'Cache-Control': 'public, max-age=900, stale-while-revalidate=600',
    'Vary': 'Accept-Encoding'
  },
  
  // For search suggestions
  search: {
    'Cache-Control': 'public, max-age=60',
    'Vary': 'Accept-Encoding'
  },
  
  // For live data (scores, TV status)
  live: {
    'Cache-Control': 'no-store'
  },
  
  // For fast-changing data with short cache
  dynamic: {
    'Cache-Control': 'public, max-age=15, stale-while-revalidate=30',
    'Vary': 'Accept-Encoding'
  },
  
  // For OG images and assets
  assets: {
    'Cache-Control': 'public, max-age=3600, immutable',
    'Vary': 'Accept-Encoding'
  }
};

export default {
  withCacheVersion,
  fetchWithCache,
  getCacheVersion,
  cacheHeaders
};