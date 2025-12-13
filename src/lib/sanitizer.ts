// Server-safe HTML sanitization without jsdom dependency
// This uses a simple regex-based approach for server-side rendering
// For client-side, we can use dompurify directly

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'div', 'span'
];

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  '*': ['class']
};

/**
 * Server-safe HTML sanitization that doesn't require jsdom.
 * Uses regex-based approach for serverless environments.
 */
function sanitizeHtmlServer(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:text\/html/gi, '');

  // Only allow specific tags
  const tagPattern = new RegExp(`</?(?!(${ALLOWED_TAGS.join('|')})\\b)[^>]+>`, 'gi');
  sanitized = sanitized.replace(tagPattern, '');

  // Clean up attributes - only allow safe ones
  const allowedAttrPattern = new RegExp(
    `\\s(?!(${Object.values(ALLOWED_ATTRIBUTES).flat().join('|')})\\s*=\\s*)[a-z-]+\\s*=\\s*["'][^"']*["']`,
    'gi'
  );
  sanitized = sanitized.replace(allowedAttrPattern, '');

  return sanitized;
}

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting.
 * Uses server-safe approach in serverless environments, dompurify on client.
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use simple sanitization without jsdom
    return sanitizeHtmlServer(html);
  } else {
    // Client-side: use dompurify for better sanitization
    try {
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
        FORBID_ATTR: ['onerror', 'onload']
      });
    } catch (e) {
      // Fallback to server-side sanitization if dompurify fails
      return sanitizeHtmlServer(html);
    }
  }
}

/**
 * Alternative sanitizer with stricter rules for high-security contexts.
 * Only allows basic text formatting tags.
 */
export function sanitizeHtmlStrict(html: string): string {
  const STRICT_TAGS = ['p', 'br', 'strong', 'em', 'u'];
  
  if (typeof window === 'undefined') {
    // Server-side: simple sanitization
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
    
    const tagPattern = new RegExp(`</?(?!(${STRICT_TAGS.join('|')})\\b)[^>]+>`, 'gi');
    return sanitized.replace(tagPattern, '');
  } else {
    // Client-side: use dompurify
    try {
      const DOMPurify = require('dompurify');
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: STRICT_TAGS,
        ALLOWED_ATTR: {},
        ALLOW_DATA_ATTR: false
      });
    } catch (e) {
      return html.replace(/<[^>]+>/g, '');
    }
  }
}