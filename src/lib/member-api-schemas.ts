import { z } from 'zod';

const safeText = (max: number) => z.string().trim().min(1).max(max);

// The download route fetches fileUrl server-side and serves storagePath from the
// bucket, so both must stay pinned to values our own upload flow can produce —
// otherwise manage_documents becomes an SSRF / read-any-bucket-object primitive.
const TRUSTED_FILE_URL_HOSTS = new Set([
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
]);

// Matches the paths minted by /api/admin/documents/upload: documents/<uuid>.<ext>
const STORAGE_PATH_PATTERN =
  /^documents\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,10}$/;

export function isTrustedFileUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && TRUSTED_FILE_URL_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function isSafeStoragePath(value: string): boolean {
  return value.startsWith('documents/') && !value.includes('..');
}

const trustedFileUrl = z
  .string()
  .trim()
  .max(2_048)
  .url()
  .refine(isTrustedFileUrl, 'fileUrl must be an https Firebase Storage URL');

const documentStoragePath = z
  .string()
  .regex(STORAGE_PATH_PATTERN, 'storagePath must reference an uploaded document');

export const documentCreateSchema = z
  .object({
    title: safeText(200),
    category: safeText(80),
    description: safeText(2_000),
    version: safeText(50),
    fileUrl: trustedFileUrl.optional(),
    storagePath: documentStoragePath.optional(),
    fileName: safeText(255),
    fileSize: z.number().int().nonnegative().max(50 * 1024 * 1024),
    mimeType: safeText(120),
    restricted: z.boolean(),
    restrictedRoles: z.array(safeText(80)).max(10).optional(),
    tags: z.array(safeText(50)).max(20).optional(),
  })
  .strict();

export const documentUpdateSchema = documentCreateSchema.partial().strict();

export const messageCreateSchema = z
  .object({
    title: safeText(200),
    content: safeText(10_000),
    category: z.enum(['announcement', 'reminder', 'urgent', 'general']),
    priority: z.enum(['low', 'medium', 'high']),
    pinned: z.boolean().default(false),
    targetAudience: z.enum(['all', 'admins', 'officers', 'members']),
    targetRoles: z.array(safeText(80)).max(10).optional(),
    targetOrganizations: z.array(safeText(120)).max(50).optional(),
    expiresAt: z.string().datetime().optional(),
  })
  .strict();

export const meetingCreateSchema = z
  .object({
    title: safeText(200),
    date: z.string().datetime(),
    type: z.enum(['regular', 'special', 'executive']),
    status: z.enum(['draft', 'approved', 'archived']).default('draft'),
    description: safeText(2_000),
    content: z.string().max(50_000).optional(),
  })
  .strict();

export const requestCreateSchema = z
  .object({
    title: safeText(200),
    type: safeText(100),
    description: safeText(10_000),
    priority: safeText(50),
    requestedDate: z.string().datetime().optional(),
    budget: z.number().nonnegative().max(1_000_000).optional(),
    additionalInfo: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const requestStatusSchema = z
  .object({
    status: z.enum(['pending', 'under_review', 'approved', 'denied']),
    reviewNotes: z.string().trim().max(5_000).optional(),
  })
  .strict();
