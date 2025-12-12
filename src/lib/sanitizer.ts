import DOMPurify from 'dompurify';

// Configuration for HTML sanitization to prevent XSS attacks
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'div', 'span'
];

const ALLOWED_ATTRIBUTES = {
  'a': ['href', 'title', 'target', 'rel'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  '*': ['class'] // Allow class on all elements for styling
};

/**
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting.
 * This should be used for all user-generated content that needs to be rendered as HTML.
 * 
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === 'undefined') {
    // Server-side: Use isomorphic-dompurify for Node.js compatibility
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const purify = DOMPurify(window as any);
    
    return purify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
      ALLOW_DATA_ATTR: false,
      FORBID_SCRIPT_TAGS: true,
      FORBID_ON_ATTRS: true, // Forbid on* attributes (onclick, onload, etc.)
      USE_PROFILES: { html: true }
    });
  }
  
  // Client-side sanitization
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRIBUTES,
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT_TAGS: true,
    FORBID_ON_ATTRS: true, // Forbid on* attributes (onclick, onload, etc.)
    USE_PROFILES: { html: true }
  });
}

/**
 * Alternative sanitizer with stricter rules for high-security contexts.
 * Only allows basic text formatting tags.
 */
export function sanitizeHtmlStrict(html: string): string {
  const STRICT_TAGS = ['p', 'br', 'strong', 'em', 'u'];
  const STRICT_ATTRS = {};

  if (typeof window === 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const purify = DOMPurify(window as any);
    
    return purify.sanitize(html, {
      ALLOWED_TAGS: STRICT_TAGS,
      ALLOWED_ATTR: STRICT_ATTRS,
      ALLOW_DATA_ATTR: false,
      FORBID_SCRIPT_TAGS: true,
      FORBID_ON_ATTRS: true,
      USE_PROFILES: { html: true }
    });
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: STRICT_TAGS,
    ALLOWED_ATTR: STRICT_ATTRS,
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT_TAGS: true,
    FORBID_ON_ATTRS: true,
    USE_PROFILES: { html: true }
  });
}