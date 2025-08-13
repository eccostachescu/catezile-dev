// Client-side security utilities and validation schemas for CateZile.ro
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// Validation schemas using Zod for strict input validation

// Basic text validation with XSS protection
const safeString = z.string()
  .min(1)
  .refine(
    (val) => !containsSuspiciousPatterns(val),
    { message: "Input contains invalid patterns" }
  )
  .refine(
    (val) => val.length <= 1000,
    { message: "Input too long" }
  );

const safeOptionalString = z.string()
  .optional()
  .refine(
    (val) => !val || !containsSuspiciousPatterns(val),
    { message: "Input contains invalid patterns" }
  )
  .refine(
    (val) => !val || val.length <= 1000,
    { message: "Input too long" }
  );

// Email validation
export const emailSchema = z.string()
  .email()
  .refine(
    (val) => val.length <= 254,
    { message: "Email too long" }
  )
  .transform(val => val.toLowerCase());

// URL validation for trusted domains only
export const urlSchema = z.string()
  .url()
  .refine(
    (url) => {
      try {
        const urlObj = new URL(url);
        const allowedDomains = [
          'catezile.ro',
          'youtube.com',
          'youtu.be',
          'youtube-nocookie.com',
          'image.tmdb.org',
          'tmdb.org'
        ];
        return allowedDomains.some(domain => 
          urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
        );
      } catch {
        return false;
      }
    },
    { message: "URL not from allowed domain" }
  );

// UGC Event validation schema
export const ugcEventSchema = z.object({
  title: z.string().min(1).max(200).refine(
    (val) => !containsSuspiciousPatterns(val),
    { message: "Title contains invalid patterns" }
  ),
  description: z.string().max(2000).optional().refine(
    (val) => !val || !containsSuspiciousPatterns(val),
    { message: "Description contains invalid patterns" }
  ),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  city: z.string().max(100).optional().refine(
    (val) => !val || !containsSuspiciousPatterns(val),
    { message: "City contains invalid patterns" }
  ),
  category: z.string().uuid().optional(),
  ticketsUrl: urlSchema.optional(),
  officialUrl: urlSchema.optional(),
  turnstileToken: z.string().optional()
});

// Newsletter subscription schema
export const newsletterSchema = z.object({
  email: emailSchema,
  turnstileToken: z.string().optional()
});

// Search query validation
export const searchSchema = z.object({
  q: z.string()
    .min(1)
    .max(100)
    .refine(
      (val) => !containsSQLPatterns(val),
      { message: "Invalid search query" }
    ),
  limit: z.number().min(1).max(50).optional(),
  offset: z.number().min(0).optional()
});

// Countdown creation schema
export const countdownSchema = z.object({
  title: z.string().min(1).max(100).refine(
    (val) => !containsSuspiciousPatterns(val),
    { message: "Title contains invalid patterns" }
  ),
  targetDate: z.string().datetime(),
  description: z.string().max(500).optional().refine(
    (val) => !val || !containsSuspiciousPatterns(val),
    { message: "Description contains invalid patterns" }
  ),
  privacy: z.enum(['PUBLIC', 'PRIVATE']),
  turnstileToken: z.string().optional()
});

// Admin IP management schemas
export const ipBlockSchema = z.object({
  ip: z.string().ip(),
  reason: z.string().min(1).max(200).refine(
    (val) => !containsSuspiciousPatterns(val),
    { message: "Reason contains invalid patterns" }
  ),
  duration: z.number().min(1).max(8760) // Max 1 year in hours
});

export const ipAllowSchema = z.object({
  ip: z.string().ip(),
  note: z.string().max(200).optional().refine(
    (val) => !val || !containsSuspiciousPatterns(val),
    { message: "Note contains invalid patterns" }
  )
});

// Security pattern detection
function containsSuspiciousPatterns(input: string): boolean {
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /data:.*base64/gi,
    /on\w+\s*=/gi, // onload=, onclick=, etc.
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /<form\b/gi,
    /vbscript:/gi,
    /expression\s*\(/gi
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

function containsSQLPatterns(input: string): boolean {
  const sqlPatterns = [
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /update\s+\w+\s+set/gi,
    /--\s*$/gm,
    /\/\*.*\*\//g,
    /'\s*;\s*--/g,
    /'\s*or\s+'1'\s*=\s*'1/gi
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

// Safe HTML sanitization
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
  });
}

// Rate limiting helper for client-side
export class ClientRateLimit {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
  
  getRemainingTime(key: string): number {
    const requests = this.requests.get(key) || [];
    if (requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...requests);
    const remaining = this.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, remaining);
  }
}

// Validate file uploads client-side
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (maximum 2MB)' };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
  }
  
  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const typeExtensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp']
  };
  
  const allowedExtensions = typeExtensionMap[file.type] || [];
  if (!extension || !allowedExtensions.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' };
  }
  
  return { valid: true };
}

// Content Security Policy generator
export function generateCSP(): string {
  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://plausible.io https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://image.tmdb.org https://plausible.io",
    "media-src 'self'",
    "frame-src https://www.youtube-nocookie.com https://challenges.cloudflare.com",
    "connect-src 'self' https://*.supabase.co https://plausible.io https://challenges.cloudflare.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ];
  
  return directives.join('; ');
}

// Security headers for responses
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
};

// Export all schemas for use in components
export const schemas = {
  ugcEvent: ugcEventSchema,
  newsletter: newsletterSchema,
  search: searchSchema,
  countdown: countdownSchema,
  ipBlock: ipBlockSchema,
  ipAllow: ipAllowSchema,
  email: emailSchema,
  url: urlSchema
};