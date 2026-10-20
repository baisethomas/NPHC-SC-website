/**
 * Small text helpers for turning CMS HTML into plain copy.
 */

export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * The first sentence of a block of HTML, stripped of tags and wrapping quotes,
 * for pull-quote treatments. Falls back to a hard cut when no sentence end is
 * found within `maxLength`.
 */
export function pullQuote(html: string, maxLength = 180): string {
  const text = stripHtml(html).replace(/^["“”']+|["“”']+$/g, '').trim();
  if (!text) return '';
  const match = text.match(/^(.+?[.!?])(\s|$)/);
  const sentence = match ? match[1] : text;
  if (sentence.length <= maxLength) return sentence;
  const cut = sentence.slice(0, maxLength);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}
