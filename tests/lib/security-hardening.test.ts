import { afterEach, describe, expect, it } from 'vitest';
import { isSafeStoragePath, isTrustedFileUrl } from '@/lib/member-api-schemas';
import { isAdminUser, type AuthzUser } from '@/lib/authz';
import { sanitizeHtml } from '@/lib/sanitizer';

const ORIGINAL_ALLOWLIST = process.env.ADMIN_EMAIL_ALLOWLIST;

afterEach(() => {
  process.env.ADMIN_EMAIL_ALLOWLIST = ORIGINAL_ALLOWLIST;
});

function tokenUser(overrides: Partial<AuthzUser>): AuthzUser {
  return { uid: 'u1', ...overrides } as AuthzUser;
}

describe('isTrustedFileUrl (SSRF guard)', () => {
  it('accepts Firebase Storage download URLs', () => {
    expect(
      isTrustedFileUrl('https://firebasestorage.googleapis.com/v0/b/bucket/o/doc.pdf?alt=media')
    ).toBe(true);
    expect(isTrustedFileUrl('https://storage.googleapis.com/bucket/documents/doc.pdf')).toBe(true);
  });

  it('rejects internal, non-https, and lookalike targets', () => {
    expect(isTrustedFileUrl('http://169.254.169.254/computeMetadata/v1/token')).toBe(false);
    expect(isTrustedFileUrl('http://firebasestorage.googleapis.com/v0/b/bucket/o/doc.pdf')).toBe(false);
    expect(isTrustedFileUrl('https://firebasestorage.googleapis.com.evil.com/doc.pdf')).toBe(false);
    expect(isTrustedFileUrl('https://localhost:8080/admin')).toBe(false);
    expect(isTrustedFileUrl('file:///etc/passwd')).toBe(false);
    expect(isTrustedFileUrl('not a url')).toBe(false);
  });
});

describe('isSafeStoragePath (bucket read guard)', () => {
  it('accepts paths under documents/ without traversal', () => {
    expect(isSafeStoragePath('documents/2f1e6c1a-1111-4222-8333-444455556666.pdf')).toBe(true);
    expect(isSafeStoragePath('documents/legacy-file-name.pdf')).toBe(true);
  });

  it('rejects paths outside documents/ or containing traversal', () => {
    expect(isSafeStoragePath('backups/firestore-export.json')).toBe(false);
    expect(isSafeStoragePath('documents/../backups/secret.json')).toBe(false);
    expect(isSafeStoragePath('/documents/doc.pdf')).toBe(false);
  });
});

describe('sanitizeHtml (stored-XSS guard, server-side)', () => {
  it('neutralizes payloads that bypassed the old regex sanitizer', () => {
    // Entity-encoded javascript: URL — regexes never decoded entities.
    const entityEncoded = sanitizeHtml('<a href="&#106;avascript:alert(1)">x</a>');
    expect(entityEncoded).not.toContain('javascript:');
    expect(entityEncoded.toLowerCase()).not.toContain('&#106;avascript');

    // Whitespace-obfuscated scheme survived the literal /javascript:/ strip.
    expect(sanitizeHtml('<a href="java\tscript:alert(1)">x</a>')).not.toContain('script:');

    // Unquoted event handler — the old attribute regex only matched quoted values.
    expect(sanitizeHtml('<img src=x onerror=alert(1)>')).not.toContain('onerror');
  });

  it('preserves safe formatting', () => {
    expect(sanitizeHtml('<p><strong>Hello</strong> <em>world</em></p>')).toBe(
      '<p><strong>Hello</strong> <em>world</em></p>'
    );
    expect(sanitizeHtml('<a href="https://example.org" title="ok">link</a>')).toContain(
      'href="https://example.org"'
    );
  });
});

describe('isAdminUser allowlist requires verified email', () => {
  it('grants admin only when the allowlisted email is verified', () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = 'admin@example.org';
    expect(
      isAdminUser(tokenUser({ email: 'admin@example.org', email_verified: true }))
    ).toBe(true);
    expect(
      isAdminUser(tokenUser({ email: 'admin@example.org', email_verified: false }))
    ).toBe(false);
    expect(isAdminUser(tokenUser({ email: 'admin@example.org' }))).toBe(false);
  });

  it('still honors role claims regardless of allowlist', () => {
    process.env.ADMIN_EMAIL_ALLOWLIST = '';
    expect(isAdminUser(tokenUser({ roles: ['super_admin'] }))).toBe(true);
    expect(isAdminUser(tokenUser({ roles: ['member'] }))).toBe(false);
  });
});
