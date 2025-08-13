export const mapRo = [
  [/ă/g, 'a'], [/â/g, 'a'], [/î/g, 'i'], 
  [/ș/g, 's'], [/ş/g, 's'], [/ț/g, 't'], [/ţ/g, 't'],
  [/Ă/g, 'A'], [/Â/g, 'A'], [/Î/g, 'I'], 
  [/Ș/g, 'S'], [/Ş/g, 'S'], [/Ț/g, 'T'], [/Ţ/g, 'T']
] as const;

export const stripDiacritics = (text: string): string => {
  return mapRo.reduce(
    (result, [regex, replacement]) => result.replace(regex, replacement),
    text
  );
};

export const normalizeRo = (text: string): string => {
  return stripDiacritics(text.normalize('NFKD')).toLowerCase();
};

export const slugifyRo = (text: string): string => {
  return normalizeRo(text)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

// For search indexing - create both original and normalized versions
export const searchVariants = (text: string): string[] => {
  const normalized = normalizeRo(text);
  const variants = [text, normalized];
  
  // Add unique variants only
  return [...new Set(variants)];
};

// Check if search query matches text (with or without diacritics)
export const matchesSearch = (text: string, query: string): boolean => {
  const normalizedText = normalizeRo(text);
  const normalizedQuery = normalizeRo(query);
  
  return normalizedText.includes(normalizedQuery) || 
         text.toLowerCase().includes(query.toLowerCase());
};

// Create URL-safe slug with fallback
export const createSlug = (title: string, fallback?: string): string => {
  const slug = slugifyRo(title);
  
  if (!slug && fallback) {
    return slugifyRo(fallback);
  }
  
  return slug || 'untitled';
};

// Highlight search matches in text
export const highlightMatches = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const normalizedQuery = normalizeRo(query);
  const normalizedText = normalizeRo(text);
  
  // Find matches in normalized text
  const matchIndex = normalizedText.indexOf(normalizedQuery);
  if (matchIndex === -1) return text;
  
  // Apply highlighting to original text at the same position
  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + query.length);
  const after = text.slice(matchIndex + query.length);
  
  return `${before}<mark>${match}</mark>${after}`;
};