interface EventImageOptions {
  title: string;
  category?: string;
  force?: boolean;
}

// Improved default images with better category matching
const DEFAULT_IMAGES = {
  'Conferințe': 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
  'Sport': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop', // Football stadium
  'Fotbal': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop',
  'Teatru': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
  'Concerte': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
  'Festival': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
  'Sărbători': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop', // Christmas tree
  'Crăciun': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop',
  'Holiday': 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&h=600&fit=crop',
  'Film': 'https://images.unsplash.com/photo-1489599510072-12d66b9ac1ae?w=800&h=600&fit=crop',
  'TV': 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&h=600&fit=crop',
  'Muzică': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
  'Guvern': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a08b?w=800&h=600&fit=crop',
  'Black Friday': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'
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
  
  // Improved keyword matching based on title content
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category?.toLowerCase() || '';
  
  // Specific keyword mapping for better image matching
  let specificKeywords = '';
  if (lowerTitle.includes('craciun') || lowerTitle.includes('christmas')) {
    specificKeywords = 'christmas tree santa decorations holiday';
  } else if (lowerTitle.includes('fotbal') || lowerTitle.includes('football') || lowerCategory.includes('sport')) {
    specificKeywords = 'football stadium soccer field players';
  } else if (lowerTitle.includes('film') || lowerTitle.includes('movie') || lowerCategory.includes('film')) {
    specificKeywords = 'cinema movie theater film screening';
  } else if (lowerTitle.includes('concert') || lowerTitle.includes('muzica')) {
    specificKeywords = 'concert stage music performance microphone';
  } else {
    specificKeywords = categoryKeywords[category as keyof typeof categoryKeywords] || 'event celebration';
  }
  
  // Extract meaningful words from title (avoiding common words)
  const stopWords = ['vs', 'si', 'la', 'din', 'cu', 'pe', 'in', 'de', 'a', 'al', 'ale', 'sau'];
  const titleKeywords = title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 2)
    .join(' ');
    
  return `${titleKeywords} ${specificKeywords}`.trim();
}

function getDefaultCategoryImage(category?: string, title?: string): string {
  // Smart category detection based on title content
  if (title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('craciun') || lowerTitle.includes('christmas')) {
      return DEFAULT_IMAGES['Crăciun'];
    }
    if (lowerTitle.includes('fotbal') || lowerTitle.includes('football')) {
      return DEFAULT_IMAGES['Fotbal'];
    }
    if (lowerTitle.includes('film') || lowerTitle.includes('movie')) {
      return DEFAULT_IMAGES['Film'];
    }
  }
  
  return DEFAULT_IMAGES[category as keyof typeof DEFAULT_IMAGES] || DEFAULT_IMAGES['Festival'];
}

async function getUnsplashImage(title: string, category?: string): Promise<string | null> {
  try {
    const keywords = generateKeywords(title, category);
    const cacheKey = `unsplash:${keywords}`;
    
    console.log(`Searching for image: "${keywords}" for event: "${title}"`);
    
    // Check cache primul
    if (imageCache.has(cacheKey)) {
      console.log(`Found cached image for: ${keywords}`);
      return imageCache.get(cacheKey)!;
    }
    
    const response = await fetch(`${window.location.origin}/functions/v1/unsplash-image?query=${encodeURIComponent(keywords)}`);
    
    if (!response.ok) {
      console.warn('Unsplash API failed:', response.status, response.statusText);
      return null;
    }
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      console.warn('Unsplash API returned non-JSON response:', contentType);
      return null;
    }
    
    const data = await response.json();
    const imageUrl = data.imageUrl;
    
    if (imageUrl) {
      console.log(`Got image from Unsplash: ${imageUrl}`);
      imageCache.set(cacheKey, imageUrl);
      return imageUrl;
    }
    
    console.log(`No image found for: ${keywords}`);
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
  
  console.log(`Getting smart image for: "${title}" (${category})`);
  
  // Check cache dacă nu forțam refresh
  if (!force && imageCache.has(cacheKey)) {
    console.log(`Using cached image for: ${title}`);
    return imageCache.get(cacheKey)!;
  }
  
  try {
    // 1. Încearcă Unsplash
    const unsplashImage = await getUnsplashImage(title, category);
    
    if (unsplashImage && !isGenericImage(unsplashImage)) {
      console.log(`Using Unsplash image for: ${title}`);
      imageCache.set(cacheKey, unsplashImage);
      return unsplashImage;
    }
  } catch (error) {
    console.warn('Failed to get image from Unsplash:', error);
  }
  
  // 2. Fallback la imagine default
  const defaultImage = getDefaultCategoryImage(category, title);
  console.log(`Using default image for: ${title} -> ${defaultImage}`);
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