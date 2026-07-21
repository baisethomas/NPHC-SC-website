import { NextRequest, NextResponse } from 'next/server';
import { requireUser, type AuthzUser } from '@/lib/authz';
import { adminAuth } from '@/lib/firebase-admin';
import { sessionCookieName } from '@/lib/server-auth';
import { getMemberAccessRecord, isApprovedActiveMember } from '@/lib/member-access';
import { isAdminUser } from '@/lib/authz';
import { getClientIP, RATE_LIMITS } from '@/lib/rate-limiter';
import { checkDurableRateLimit } from '@/lib/durable-rate-limiter';

// Firebase session cookies (unlike raw ID tokens) have their own lifetime,
// independent of the ID token's 1-hour expiry, and support revocation checks.
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

export async function POST(request: NextRequest) {
  const rateLimit = await checkDurableRateLimit(
    `auth-session:${getClientIP(request)}`,
    RATE_LIMITS.AUTH
  );
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': RATE_LIMITS.AUTH.maxRequests.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': rateLimit.resetTime.toString(),
        },
      }
    );
  }

  const auth = await requireUser(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const idToken = authHeader.substring('Bearer '.length);

  if (!adminAuth) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
  let sessionCookie: string;
  try {
    sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });
  } catch (error) {
    console.error('Failed to mint session cookie:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const member = await getMemberAccessRecord(auth.user.uid);
  const response = NextResponse.json({
    user: sanitizeUser(auth.user),
    membershipApproved: isAdminUser(auth.user) || isApprovedActiveMember(member),
  });
  response.cookies.set(sessionCookieName, sessionCookie, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(sessionCookieName, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
}

function sanitizeUser(user: AuthzUser) {
  return {
    uid: user.uid,
    email: user.email ?? null,
  };
}
