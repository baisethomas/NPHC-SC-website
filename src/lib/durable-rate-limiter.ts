import { createHash } from 'crypto';
import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

export interface DurableRateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface DurableRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

export async function checkDurableRateLimit(
  key: string,
  config: DurableRateLimitConfig
): Promise<DurableRateLimitResult> {
  const now = Date.now();
  const resetTime = now + config.windowMs;
  if (!adminDb) {
    return { allowed: false, remaining: 0, resetTime };
  }

  const id = createHash('sha256').update(key).digest('hex');
  const ref = adminDb.collection('rateLimits').doc(id);

  return adminDb.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.data() as { count?: number; resetTime?: number } | undefined;
    const activeWindow = current?.resetTime && current.resetTime > now;
    const count = activeWindow ? (current?.count ?? 0) + 1 : 1;
    const nextResetTime = activeWindow ? current!.resetTime! : resetTime;

    // expireAt lets a Firestore TTL policy garbage-collect stale windows.
    // Enable once per project:
    //   gcloud firestore fields ttls update expireAt --collection-group=rateLimits --enable-ttl
    transaction.set(
      ref,
      {
        count,
        resetTime: nextResetTime,
        updatedAt: now,
        expireAt: Timestamp.fromMillis(nextResetTime + 24 * 60 * 60 * 1000),
      },
      { merge: true }
    );

    return {
      allowed: count <= config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      resetTime: nextResetTime,
    };
  });
}
