'use server';

import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { checkDurableRateLimit } from '@/lib/durable-rate-limiter';

// Public, unauthenticated action — throttle per client so scripted submissions
// can't grow the subscriber list unbounded.
const SUBSCRIBE_RATE_LIMIT = { windowMs: 15 * 60 * 1000, maxRequests: 5 };

async function getRequestIp(): Promise<string> {
  // Last x-forwarded-for entry is appended by our fronting proxy and is the
  // only one the client cannot forge (see getClientIP in lib/rate-limiter).
  const headerBag = await headers();
  const entries = (headerBag.get('x-forwarded-for') ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return entries[entries.length - 1] || 'unknown';
}

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Valid email is required'),
  name: z.string().max(200).optional(),
});

export async function subscribeToMailingList(values: z.infer<typeof subscribeSchema>) {
  if (!adminDb) {
    return { error: 'Database not available' };
  }

  const validatedFields = subscribeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid form data' };
  }

  const { email, name } = validatedFields.data;

  const ip = await getRequestIp();
  const rateLimit = await checkDurableRateLimit(`mailing-list:${ip}`, SUBSCRIBE_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return { error: 'Too many subscription attempts. Please try again later.' };
  }

  try {
    // Doc id derived from the normalized email makes re-subscribing idempotent,
    // and returning success either way avoids leaking who is subscribed.
    const subscriberId = email.replace(/[^a-zA-Z0-9]/g, '_');
    await adminDb.collection('mailingList').doc(subscriberId).set(
      {
        email,
        ...(name ? { name } : {}),
        subscribedAt: new Date().toISOString(),
        active: true,
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error('Mailing list subscription failed:', error);
    return { error: 'Failed to subscribe. Please try again.' };
  }
}
