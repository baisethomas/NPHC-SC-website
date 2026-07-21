import { randomUUID } from 'crypto';
import { admin } from '@/lib/firebase-admin';

// Server-side image upload for Server Actions. The client Firebase SDK cannot
// be used here: on the server it runs unauthenticated, so storage.rules
// (admin-only writes) reject it. The Admin SDK bypasses rules, which is why
// callers must be behind requireAdminSession/requirePermission guards.

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type ImageFolder = 'board-members' | 'programs' | 'announcements' | 'events' | 'organizations';

export async function uploadImageFromServer(file: File, folder: ImageFolder): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Unsupported image type. Use JPEG, PNG, WebP, or GIF.');
  }
  if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image must be non-empty and at most 5 MB.');
  }

  const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
  const path = `${folder}/${randomUUID()}.${extension}`;
  const downloadToken = randomUUID();
  const bucket = admin.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);

  await bucket.file(path).save(Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    resumable: false,
    metadata: {
      metadata: { firebaseStorageDownloadTokens: downloadToken },
    },
  });

  // Tokened download URLs work for public display without loosening
  // storage.rules — the token authorizes the read, not the ruleset.
  return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${downloadToken}`;
}
