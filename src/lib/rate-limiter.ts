/**
 * Simple in-memory rate limiter for API routes
 * In production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiter configurations for different endpoints
 */
export const RATE_LIMITS = {
  // General API requests - more permissive
  DEFAULT: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes
  
  // Authentication sensitive
  AUTH: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 login attempts per 15 minutes
  
  // Data creation/modification
  CREATE: { windowMs: 5 * 60 * 1000, maxRequests: 10 }, // 10 creates per 5 minutes
  UPLOAD: { windowMs: 10 * 60 * 1000, maxRequests: 5 }, // 5 uploads per 10 minutes
  
  // Admin actions
  ADMIN: { windowMs: 5 * 60 * 1000, maxRequests: 20 }, // 20 admin actions per 5 minutes
  
  // Search and read operations
  READ: { windowMs: 1 * 60 * 1000, maxRequests: 50 }, // 50 reads per minute
} as const;

/**
 * Creates a unique key for rate limiting based on IP and optionally user ID
 */
function createRateLimitKey(ip: string, userId?: string, endpoint?: string): string {
  const baseKey = userId ? `user:${userId}` : `ip:${ip}`;
  return endpoint ? `${baseKey}:${endpoint}` : baseKey;
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const headers = request.headers;
  
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('x-client-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('x-forwarded') ||
    'unknown'
  );
}

/**
 * Check if request is within rate limit
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig,
  userId?: string,
  endpoint?: string
): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
} {
  const ip = getClientIP(request);
  const key = createRateLimitKey(ip, userId, endpoint);
  const now = Date.now();
  
  let entry = rateLimitStore.get(key);
  
  // Create new entry or reset if window expired
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }
  
  // Increment request count
  entry.count++;
  rateLimitStore.set(key, entry);
  
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    message: config.message || 'Too many requests. Please try again later.',
  };
}

/**
 * Middleware wrapper for rate limiting API routes
 */
export function withRateLimit(config: RateLimitConfig, endpoint?: string) {
  return function rateLimitMiddleware(
    handler: (request: Request, context?: any) => Promise<Response> | Response
  ) {
    return async function (request: Request, context?: any): Promise<Response> {
      // Extract user ID from Authorization header if available
      let userId: string | undefined;
      try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          // In a real implementation, you'd verify and decode the JWT
          // For now, we'll create a simple hash of the token for rate limiting
          const token = authHeader.substring(7);
          userId = Buffer.from(token.substring(0, 20)).toString('base64');
        }
      } catch {
        // Ignore JWT decode errors for rate limiting purposes
      }
      
      const rateCheck = checkRateLimit(request, config, userId, endpoint);
      
      if (!rateCheck.allowed) {
        return new Response(
          JSON.stringify({
            error: rateCheck.message,
            type: 'RateLimitExceeded',
            retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': rateCheck.remaining.toString(),
              'X-RateLimit-Reset': rateCheck.resetTime.toString(),
              'Retry-After': Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }
      
      // Add rate limit headers to successful responses
      const response = await handler(request, context);
      
      // Clone response to add headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
      
      newResponse.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      newResponse.headers.set('X-RateLimit-Remaining', rateCheck.remaining.toString());
      newResponse.headers.set('X-RateLimit-Reset', rateCheck.resetTime.toString());
      
      return newResponse;
    };
  };
}

/**
 * Simple helper to apply rate limiting to existing API routes
 */
export function applyRateLimit(
  request: Request,
  config: RateLimitConfig,
  userId?: string,
  endpoint?: string
): Response | null {
  const rateCheck = checkRateLimit(request, config, userId, endpoint);
  
  if (!rateCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: rateCheck.message,
        type: 'RateLimitExceeded',
        retryAfter: Math.ceil((rateCheck.resetTime - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': rateCheck.remaining.toString(),
          'X-RateLimit-Reset': rateCheck.resetTime.toString(),
          'Retry-After': Math.ceil((rateCheck.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  return null; // Rate limit check passed
}