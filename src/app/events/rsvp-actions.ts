'use server';

import { headers } from 'next/headers';
import { adminDb } from '@/lib/firebase-admin';
import { requirePermissionSession } from '@/lib/server-auth';
import { PERMISSIONS } from '@/lib/roles';
import { z } from 'zod';
import { type EventRSVP } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import { checkDurableRateLimit } from '@/lib/durable-rate-limiter';

// Public, unauthenticated action — throttle per client and cap total RSVPs so
// scripted submissions can't fill events or grow the collection unbounded.
const RSVP_RATE_LIMIT = { windowMs: 15 * 60 * 1000, maxRequests: 5 };
const MAX_RSVPS_WITHOUT_CAPACITY = 500;

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

const rsvpSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().email("Valid email is required"),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(10, "Maximum 10 guests allowed"),
});

export async function createRSVP(values: z.infer<typeof rsvpSchema>) {
  if (!adminDb) {
    return { error: 'Database not available' };
  }

  const validatedFields = rsvpSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid form data' };
  }

  const { eventId, name, email, phone, guestCount } = validatedFields.data;

  const ip = await getRequestIp();
  const rateLimit = await checkDurableRateLimit(`rsvp:${ip}:${eventId}`, RSVP_RATE_LIMIT);
  if (!rateLimit.allowed) {
    return { error: 'Too many RSVP attempts. Please try again later.' };
  }

  try {
    const rsvpId = `${eventId}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const eventRef = adminDb.collection('events').doc(eventId);
    const rsvpRef = adminDb.collection('rsvps').doc(rsvpId);
    const newRSVP: EventRSVP = {
      id: rsvpId,
      eventId,
      name,
      email,
      phone,
      guestCount,
      timestamp: new Date().toISOString(),
    };

    const eventSlug = await adminDb.runTransaction(async (transaction) => {
      const [eventDoc, existingRSVP] = await Promise.all([
        transaction.get(eventRef),
        transaction.get(rsvpRef),
      ]);

      if (existingRSVP.exists) {
        // Idempotent success: a distinguishable "already RSVP'd" error would
        // let anyone probe whether an arbitrary email has RSVP'd to an event.
        throw new AlreadyRsvpdSignal();
      }
      if (!eventDoc.exists) {
        throw new RSVPError('Event not found');
      }

      const eventData = eventDoc.data();
      const currentAttendees = eventData?.currentAttendees ?? 0;
      const capacity = eventData?.maxAttendees ?? MAX_RSVPS_WITHOUT_CAPACITY;
      if (currentAttendees + guestCount > capacity) {
        throw new RSVPError('This event is at capacity');
      }

      transaction.create(rsvpRef, newRSVP);
      transaction.update(eventRef, {
        currentAttendees: currentAttendees + guestCount,
      });
      return eventData?.slug;
    });

    revalidatePath(`/events/${eventSlug}`);
    revalidatePath('/events');

    return { success: true };
  } catch (error) {
    if (error instanceof AlreadyRsvpdSignal) {
      return { success: true };
    }
    if (error instanceof RSVPError) {
      return { error: error.message };
    }
    console.error('RSVP creation failed:', error);
    return { error: 'Failed to create RSVP. Please try again.' };
  }
}

export async function getEventRSVPs(eventId: string) {
  const auth = await requirePermissionSession(PERMISSIONS.CHECK_IN_ATTENDEES);
  if (!auth.ok) {
    return { rsvps: [], error: auth.error };
  }

  if (!adminDb) {
    return { rsvps: [], error: 'Database not available' };
  }

  try {
    const rsvpSnapshot = await adminDb
      .collection('rsvps')
      .where('eventId', '==', eventId)
      .orderBy('timestamp', 'desc')
      .get();

    const rsvps = rsvpSnapshot.docs.map(doc => doc.data() as EventRSVP);
    return { rsvps, error: null };
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    return { rsvps: [], error: 'Failed to fetch RSVPs' };
  }
}

class RSVPError extends Error {}
class AlreadyRsvpdSignal extends Error {}