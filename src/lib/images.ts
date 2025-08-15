interface EventImageOptions {
  title: string;
  category?: string;
  force?: boolean;
}

// Default images pentru fiecare categorie
const DEFAULT_IMAGES = {
  'Conferințe': '/images/defaults/conference.jpg',
  'Sport': '/images/defaults/sports.jpg',
  'Teatru': '/images/defaults/theater.jpg',
  'Concerte': '/images/defaults/concert.jpg',
  'Festival': '/images/defaults/festival.jpg',
  'Sărbători': '/images/defaults/holidays.jpg',
  'Guvern': '/images/defaults/government.jpg',
  'Black Friday': '/images/defaults/shopping.jpg'
} as const;

// Cache pentru imagini ca să nu repetăm request-uri
const imageCache = new Map<string, string>();

function generateKeywords(title: string, category?: string): string {
  const categoryKeywords = {
    'Conferințe': 'conference tech business presentation meeting',
    'Sport': 'sports stadium football soccer romania',
    'Teatru': 'theater stage performance drama art',
    'Concerte': 'concert music festival stage performance',
    'Festival': 'festival crowd celebration music romania',
    'Sărbători': 'celebration holiday romania traditions',
    'Guvern': 'government romania bucharest official',
    'Black Friday': 'shopping sale discount black friday'
  };
  
  const baseKeywords = categoryKeywords[category as keyof typeof categoryKeywords] || 'event celebration';
  
  // Extrage keywords din titlu
  const titleKeywords = title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 2)
    .join(' ');
    
  return `${titleKeywords} ${baseKeywords}`.trim();
}

function getDefaultCategoryImage(category?: string): string {
  return DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES] || DEFAULT_IMAGES['Festival'];
}

async function getUnsplashImage(title: string, category?: string): Promise<string | null> {
  try {
    const keywords = generateKeywords(title, category);
    const cacheKey = `unsplash:${keywords}`;
    
    // Check cache primul
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }
    
    const response = await fetch(`/api/unsplash-image?query=${encodeURIComponent(keywords)}`);
    
    if (!response.ok) {
      console.warn('Unsplash API failed:', response.status);
      return null;
    }
    
    const data = await response.json();
    const imageUrl = data.imageUrl;
    
    if (imageUrl) {
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.warn('Error fetching image from Unsplash:', error);
    return null;
  }
}

function isGenericImage(url: string): boolean {
  // Simple check pentru imagini prea generice
  const genericTerms = ['placeholder', 'generic', 'default'];
  return genericTerms.some(term => url.includes(term));
}

/**
 * Obține o imagine pentru eveniment folosind strategia hibridă:
 * 1. Încearcă Unsplash cu keywords relevante
 * 2. Fallback la imagini default per categorie
 */
export async function getEventImageSmart({ title, category, force = false }: EventImageOptions): Promise<string> {
  const cacheKey = `event:${title}:${category}`;
  
  // Check cache dacă nu forțam refresh
  if (!force && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }
  
  try {
    // 1. Încearcă Unsplash
    const unsplashImage = await getUnsplashImage(title, category);
    
    if (unsplashImage && !isGenericImage(unsplashImage)) {
      imageCache.set(cacheKey, unsplashImage);
      return unsplashImage;
    }
  } catch (error) {
    console.warn('Failed to get image from Unsplash:', error);
  }
  
  // 2. Fallback la imagine default
  const defaultImage = getDefaultCategoryImage(category);
  imageCache.set(cacheKey, defaultImage);
  return defaultImage;
}

/**
 * Preîncarcă imagini pentru o listă de evenimente
 */
export async function preloadEventImages(events: EventImageOptions[]): Promise<void> {
  const promises = events.map(event => getEventImageSmart(event));
  await Promise.allSettled(promises);
}

/**
 * Clear cache dacă devine prea mare
 */
export function clearImageCache(): void {
  imageCache.clear();
}

/**
 * Get cache size pentru debugging
 */
export function getImageCacheSize(): number {
  return imageCache.size;
}