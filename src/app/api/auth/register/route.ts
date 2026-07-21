import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/authz';
import { adminDb } from '@/lib/firebase-admin';
import { CMS_COLLECTIONS } from '@/lib/cms-collections';
import { getClientIP } from '@/lib/rate-limiter';
import { checkDurableRateLimit } from '@/lib/durable-rate-limiter';

// Self-signup is a low-frequency action; keep the window tight to slow abuse.
const REGISTER_RATE_LIMIT = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 5,
};

const registerSchema = z
  .object({
    displayName: z.string().trim().min(2).max(200),
    organizationName: z.string().trim().max(200).optional(),
  })
  .strict();

export async function POST(request: NextRequest) {
  const rateLimit = await checkDurableRateLimit(
    `register:${getClientIP(request)}`,
    REGISTER_RATE_LIMIT
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': REGISTER_RATE_LIMIT.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );
  }

  // The client creates the Firebase Auth account first, then calls this route
  // with its Bearer ID token, so the UID and email come from the verified token
  // rather than the request body.
  const auth = await requireUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (!adminDb) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }

  const uid = auth.user.uid;
  const memberRef = adminDb.collection(CMS_COLLECTIONS.MEMBERS).doc(uid);
  const existing = await memberRef.get();

  // Idempotent: if a member profile already exists for this account, treat the
  // request as already submitted rather than leaking membership details.
  if (existing.exists) {
    return NextResponse.json({ success: true, membershipStatus: 'pending' });
  }

  const now = new Date().toISOString();
  const organizationName = parsed.data.organizationName?.trim();

  // Roles and membershipStatus are always server-assigned; the client can never
  // supply them.
  await memberRef.set({
    authUid: uid,
    email: auth.user.email ?? '',
    displayName: parsed.data.displayName,
    ...(organizationName ? { organizationId: organizationName } : {}),
    roles: [],
    membershipStatus: 'pending',
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ success: true, membershipStatus: 'pending' });
}
