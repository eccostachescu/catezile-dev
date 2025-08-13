// Edge Shield - Comprehensive security utilities for CateZile.ro
// Provides WAF-like protection, rate limiting, and security logging

export interface SecurityConfig {
  maxRequestsPerWindow: number;
  windowSizeSeconds: number;
  maxPayloadSize: number;
  blockedUserAgents: string[];
  allowedDomains: string[];
}

export const DEFAULT_SECURITY_CONFIG: SecurityConfig = {
  maxRequestsPerWindow: 30,
  windowSizeSeconds: 60,
  maxPayloadSize: 1024 * 1024, // 1MB
  blockedUserAgents: [
    'curl', 'wget', 'python-requests', 'bot', 'crawler', 'spider',
    'scanner', 'nikto', 'sqlmap', 'nmap', 'masscan'
  ],
  allowedDomains: [
    'catezile.ro', 'www.catezile.ro', 'app.catezile.ro',
    'localhost', '127.0.0.1'
  ]
};

// Hash IP address with salt for privacy-preserving storage
export async function hashIp(ip: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extract client IP from request headers
export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  const xRealIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  
  if (xForwardedFor) {
    // Take the first IP in the chain
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (cfConnectingIp) return cfConnectingIp;
  if (xRealIp) return xRealIp;
  
  return '127.0.0.1'; // Fallback
}

// Check if User-Agent looks suspicious
export function isSuspiciousUserAgent(ua: string): boolean {
  if (!ua || ua.length < 10) return true;
  
  const lowerUA = ua.toLowerCase();
  return DEFAULT_SECURITY_CONFIG.blockedUserAgents.some(blocked => 
    lowerUA.includes(blocked.toLowerCase())
  );
}

// Validate request payload size
export function isPayloadTooLarge(req: Request, maxSize: number = DEFAULT_SECURITY_CONFIG.maxPayloadSize): boolean {
  const contentLength = req.headers.get('content-length');
  if (!contentLength) return false;
  
  return parseInt(contentLength, 10) > maxSize;
}

// Security event logging
export async function logSecurityEvent(
  supabase: any,
  ipHash: string,
  route: string,
  userAgent: string | null,
  kind: string,
  meta: Record<string, any> = {}
) {
  try {
    await supabase
      .from('security_event')
      .insert({
        ip_hash: ipHash,
        route,
        user_agent: userAgent,
        kind,
        meta
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

// Check if IP is blocked
export async function isIpBlocked(supabase: any, ip: string): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('is_ip_blocked', { ip_address: ip });
    return data || false;
  } catch (error) {
    console.error('Error checking IP blocklist:', error);
    return false;
  }
}

// Check if IP is allowlisted
export async function isIpAllowlisted(supabase: any, ip: string): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('is_ip_allowlisted', { ip_address: ip });
    return data || false;
  } catch (error) {
    console.error('Error checking IP allowlist:', error);
    return false;
  }
}

// Rate limiting check and update
export async function checkRateLimit(
  supabase: any,
  route: string,
  ipHash: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): Promise<{ allowed: boolean; retryAfter?: number }> {
  try {
    const windowStart = new Date();
    windowStart.setSeconds(windowStart.getSeconds() - config.windowSizeSeconds);
    
    // Count existing requests in the current window
    const { data: count } = await supabase.rpc('count_rate_limit', {
      route_in: route,
      ip_hash_in: ipHash,
      since_in: windowStart.toISOString()
    });
    
    const requestCount = count || 0;
    
    if (requestCount >= config.maxRequestsPerWindow) {
      return { 
        allowed: false, 
        retryAfter: config.windowSizeSeconds 
      };
    }
    
    // Add this request to the rate limit table
    const currentWindow = new Date();
    currentWindow.setSeconds(currentWindow.getSeconds() - (currentWindow.getSeconds() % config.windowSizeSeconds));
    
    await supabase
      .from('rate_limit')
      .upsert({
        route,
        ip_hash: ipHash,
        window_start: currentWindow.toISOString(),
        request_count: 1
      }, {
        onConflict: 'route,ip_hash,window_start',
        ignoreDuplicates: false
      });
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    return { allowed: true }; // Fail open for availability
  }
}

// Comprehensive security middleware
export async function securityShield(
  req: Request,
  supabase: any,
  route: string,
  config: SecurityConfig = DEFAULT_SECURITY_CONFIG
): Promise<Response | null> {
  const clientIp = getClientIp(req);
  const userAgent = req.headers.get('user-agent');
  const securitySalt = Deno.env.get('SECURITY_SALT') || 'fallback-salt-change-me';
  const ipHash = await hashIp(clientIp, securitySalt);
  
  // Check if IP is allowlisted (skip all checks)
  if (await isIpAllowlisted(supabase, clientIp)) {
    return null; // Allow through
  }
  
  // Check if IP is blocked
  if (await isIpBlocked(supabase, clientIp)) {
    await logSecurityEvent(supabase, ipHash, route, userAgent, 'BLOCKED', {
      reason: 'IP in blocklist',
      ip_type: 'blocked'
    });
    
    return new Response(JSON.stringify({ error: 'Access denied' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Check User-Agent for suspicious patterns
  if (userAgent && isSuspiciousUserAgent(userAgent)) {
    await logSecurityEvent(supabase, ipHash, route, userAgent, 'WAF_PATTERN', {
      reason: 'Suspicious User-Agent',
      pattern: 'blocked_ua'
    });
    
    return new Response(JSON.stringify({ error: 'Request blocked' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Check payload size for POST requests
  if (req.method === 'POST' && isPayloadTooLarge(req, config.maxPayloadSize)) {
    await logSecurityEvent(supabase, ipHash, route, userAgent, 'WAF_PATTERN', {
      reason: 'Payload too large',
      pattern: 'oversized_payload'
    });
    
    return new Response(JSON.stringify({ error: 'Payload too large' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Rate limiting check
  const rateCheck = await checkRateLimit(supabase, route, ipHash, config);
  if (!rateCheck.allowed) {
    await logSecurityEvent(supabase, ipHash, route, userAgent, 'RATE_LIMIT', {
      reason: 'Rate limit exceeded',
      window_seconds: config.windowSizeSeconds
    });
    
    return new Response(JSON.stringify({ 
      error: 'Too many requests',
      retryAfter: rateCheck.retryAfter 
    }), {
      status: 429,
      headers: { 
        'Content-Type': 'application/json',
        'Retry-After': rateCheck.retryAfter?.toString() || '60'
      }
    });
  }
  
  return null; // All checks passed, allow request
}

// Validate Cloudflare Turnstile token
export async function validateTurnstile(token: string): Promise<boolean> {
  const secretKey = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY not configured, skipping validation');
    return true; // Skip validation if not configured
  }
  
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: secretKey,
        response: token
      })
    });
    
    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return false;
  }
}

// Validate file upload security
export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
  mimeType?: string;
}

export async function validateFileUpload(file: File): Promise<FileValidationResult> {
  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'File too large (max 2MB)' };
  }
  
  // Check MIME type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type (only JPEG, PNG, WebP allowed)' };
  }
  
  // Generate secure filename
  const extension = file.type.split('/')[1];
  const sanitizedName = `${crypto.randomUUID()}.${extension}`;
  
  return {
    valid: true,
    sanitizedName,
    mimeType: file.type
  };
}

// Clean up old rate limit entries (should be called periodically)
export async function cleanupOldRateLimits(supabase: any): Promise<void> {
  try {
    await supabase.rpc('cleanup_rate_limit');
  } catch (error) {
    console.error('Error cleaning up rate limits:', error);
  }
}