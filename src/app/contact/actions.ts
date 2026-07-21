'use server';

import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { checkDurableRateLimit } from '@/lib/durable-rate-limiter';

// Public, unauthenticated action — throttle per client so scripted submissions
// can't flood the inbox or grow the collection unbounded.
const CONTACT_RATE_LIMIT = { windowMs: 15 * 60 * 1000, maxRequests: 5 };

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

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(200),
  email: z.string().trim().toLowerCase().email('Valid email is required'),
  subject: z.string().max(200).optional(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
});

export async function submitContactForm(values: z.infer<typeof contactSchema>) {
  if (!adminDb) {
    return { error: 'Database not available' };
  }

  const validatedFields = contactSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid form data' };
  }

  const { name, email, subject, message } = validatedFields.data;

  const ip = await getRequestIp();
  const rateLimit = await checkDurableRateLimit(`contact:${ip}`, CONTACT_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return { error: 'Too many messages sent. Please try again later.' };
  }

  try {
    await adminDb.collection('contactSubmissions').add({
      name,
      email,
      ...(subject ? { subject } : {}),
      message,
      submittedAt: new Date().toISOString(),
      status: 'new',
    });

    return { success: true };
  } catch (error) {
    console.error('Contact submission failed:', error);
    return { error: 'Failed to send your message. Please try again.' };
  }
}
