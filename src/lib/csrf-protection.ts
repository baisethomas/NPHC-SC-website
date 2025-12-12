/**
 * CSRF Protection utility for forms and state-changing operations
 * Implements double-submit cookie pattern with additional security measures
 */

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// CSRF token configuration
const CSRF_TOKEN_LENGTH = 32;
const CSRF_TOKEN_COOKIE_NAME = '__csrf_token';
const CSRF_TOKEN_HEADER_NAME = 'x-csrf-token';
const CSRF_TOKEN_FORM_FIELD = '_csrf_token';

/**
 * Generates a cryptographically secure random string
 */
function generateSecureToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  // Use crypto.getRandomValues for secure randomness
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    // Fallback for older environments (less secure)
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  
  return result;
}

/**
 * Generate a new CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(CSRF_TOKEN_LENGTH);
}

/**
 * Set CSRF token in cookie (server-side)
 */
export function setCSRFTokenCookie(token: string): void {
  const cookieStore = cookies();
  
  cookieStore.set(CSRF_TOKEN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

/**
 * Get CSRF token from cookie (server-side)
 */
export function getCSRFTokenFromCookie(): string | null {
  try {
    const cookieStore = cookies();
    return cookieStore.get(CSRF_TOKEN_COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Get CSRF token from request headers or form data
 */
export async function getCSRFTokenFromRequest(request: NextRequest): Promise<string | null> {
  // Try to get from header first
  const headerToken = request.headers.get(CSRF_TOKEN_HEADER_NAME);
  if (headerToken) {
    return headerToken;
  }

  // Try to get from form data
  try {
    const formData = await request.formData();
    return formData.get(CSRF_TOKEN_FORM_FIELD) as string || null;
  } catch {
    // If not form data, try JSON body
    try {
      const body = await request.json();
      return body[CSRF_TOKEN_FORM_FIELD] || null;
    } catch {
      return null;
    }
  }
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(cookieToken: string | null, requestToken: string | null): boolean {
  if (!cookieToken || !requestToken) {
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  if (cookieToken.length !== requestToken.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ requestToken.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Middleware for CSRF protection
 */
export async function validateCSRF(request: NextRequest): Promise<{
  valid: boolean;
  error?: string;
}> {
  // Only check CSRF for state-changing operations
  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return { valid: true };
  }

  // Skip CSRF check for API routes with Bearer tokens (they have their own security)
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return { valid: true };
  }

  const cookieToken = getCSRFTokenFromCookie();
  const requestToken = await getCSRFTokenFromRequest(request);

  if (!verifyCSRFToken(cookieToken, requestToken)) {
    return {
      valid: false,
      error: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    };
  }

  return { valid: true };
}

/**
 * React hook for CSRF token management (client-side)
 */
export function useCSRFToken() {
  const getTokenFromCookie = (): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === CSRF_TOKEN_COOKIE_NAME) {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  const addCSRFTokenToFormData = (formData: FormData): FormData => {
    const token = getTokenFromCookie();
    if (token) {
      formData.append(CSRF_TOKEN_FORM_FIELD, token);
    }
    return formData;
  };

  const getCSRFHeaders = (): Record<string, string> => {
    const token = getTokenFromCookie();
    return token ? { [CSRF_TOKEN_HEADER_NAME]: token } : {};
  };

  return {
    getToken: getTokenFromCookie,
    addToFormData: addCSRFTokenToFormData,
    getHeaders: getCSRFHeaders,
  };
}

/**
 * Generate and set a CSRF token for a session
 */
export function initializeCSRFProtection(): string {
  const token = generateCSRFToken();
  setCSRFTokenCookie(token);
  return token;
}

/**
 * CSRF-protected form component helper
 */
export function getCSRFTokenForForm(): string | null {
  return getCSRFTokenFromCookie();
}

/**
 * Helper to create CSRF error response
 */
export function createCSRFErrorResponse(): Response {
  return new Response(
    JSON.stringify({
      error: 'Invalid or missing CSRF token. Please refresh the page and try again.',
      type: 'CSRFTokenError',
    }),
    {
      status: 403,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}