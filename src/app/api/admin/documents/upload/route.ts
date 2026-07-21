import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { admin } from '@/lib/firebase-admin';
import { requirePermission } from '@/lib/authz-v2';
import { PERMISSIONS } from '@/lib/roles';
import { checkDurableRateLimit } from '@/lib/durable-rate-limiter';
import { RATE_LIMITS } from '@/lib/rate-limiter';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export async function POST(request: NextRequest) {
  const auth = await requirePermission(request, PERMISSIONS.MANAGE_DOCUMENTS);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rateLimit = await checkDurableRateLimit(
    `document-upload:${auth.user.uid}`,
    RATE_LIMITS.UPLOAD
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many uploads. Please try again later.' },
      { status: 429 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'A file up to 10 MB is required.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type.' }, { status: 400 });
  }

  const extension = file.name.split('.').pop()?.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'bin';
  const storagePath = `documents/${randomUUID()}.${extension}`;
  const bucketFile = admin.storage().bucket().file(storagePath);
  await bucketFile.save(Buffer.from(await file.arrayBuffer()), {
    contentType: file.type,
    metadata: { uploadedBy: auth.user.uid },
    resumable: false,
  });

  return NextResponse.json({
    success: true,
    data: {
      storagePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    },
  });
}
