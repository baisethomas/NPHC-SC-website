'use server';

import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { type EventRSVP } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

const rsvpSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
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

  try {
    // Check if user already RSVP'd
    const existingRSVP = await adminDb
      .collection('rsvps')
      .where('eventId', '==', eventId)
      .where('email', '==', email)
      .get();

    if (!existingRSVP.empty) {
      return { error: 'You have already RSVP\'d for this event' };
    }

    // Check event capacity
    const eventDoc = await adminDb.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      return { error: 'Event not found' };
    }

    const eventData = eventDoc.data();
    if (eventData?.maxAttendees) {
      const currentAttendees = eventData.currentAttendees || 0;
      if (currentAttendees + guestCount > eventData.maxAttendees) {
        return { error: 'This event is at capacity' };
      }
    }

    // Create RSVP
    const rsvpId = `${eventId}_${email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const newRSVP: EventRSVP = {
      id: rsvpId,
      eventId,
      name,
      email,
      phone,
      guestCount,
      timestamp: new Date().toISOString(),
    };

    await adminDb.collection('rsvps').doc(rsvpId).set(newRSVP);

    // Update event attendee count
    const newAttendeeCount = (eventData?.currentAttendees || 0) + guestCount;
    await adminDb.collection('events').doc(eventId).update({
      currentAttendees: newAttendeeCount,
    });

    revalidatePath(`/events/${eventDoc.data()?.slug}`);
    revalidatePath('/events');

    return { success: true };
  } catch (error) {
    console.error('RSVP creation failed:', error);
    return { error: 'Failed to create RSVP. Please try again.' };
  }
}

export async function checkRSVPStatus(eventId: string, email: string) {
  if (!adminDb) {
    return { hasRSVPd: false };
  }

  try {
    const rsvpDoc = await adminDb
      .collection('rsvps')
      .where('eventId', '==', eventId)
      .where('email', '==', email)
      .get();

    return { hasRSVPd: !rsvpDoc.empty };
  } catch (error) {
    console.error('Error checking RSVP status:', error);
    return { hasRSVPd: false };
  }
}

export async function getEventRSVPs(eventId: string) {
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