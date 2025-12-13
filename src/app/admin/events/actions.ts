'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { slugify, type Event } from '@/lib/definitions';

const eventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string().min(2, "Date is required."),
  time: z.string().min(2, "Time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  image: z.string().url("Image URL is required."),
  eventType: z.enum(['internal', 'external', 'info_only']),
  rsvpEnabled: z.boolean(),
  externalLink: z.string().url().optional().or(z.literal("")),
  maxAttendees: z.number().optional(),
});

export async function createEvent(values: z.infer<typeof eventSchema>) {
  if (!adminDb) {
    return { error: 'Firebase Admin SDK is not initialized.' };
  }
  
  const validatedFields = eventSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!', details: validatedFields.error.errors };
  }

  const { title, date, time, location, description, image, eventType, rsvpEnabled, externalLink, maxAttendees } = validatedFields.data;
  
  // Validate external link requirement
  if (eventType === 'external' && !externalLink) {
    return { error: 'External link is required for external events.' };
  }

  const slug = slugify(title);

  const newEvent: Event = {
    id: slug,
    slug: slug,
    title,
    date,
    time,
    location,
    description,
    image,
    image_hint: "community event",
    rsvpLink: externalLink || "#",
    eventType,
    rsvpEnabled,
    currentAttendees: 0,
    ...(externalLink && { externalLink }),
    ...(maxAttendees && { maxAttendees }),
  };

  try {
    await adminDb.collection("events").doc(slug).set(newEvent);

    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    revalidatePath(`/events/${slug}`);

    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Event Creation Failed: ${error.message}`);
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database write failed: Firestore permission denied. Check security rules.' };
    }
    if (error.message.includes('Could not refresh access token')) {
      return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred while creating the event.' };
  }
}

export async function deleteEvent(formData: FormData): Promise<void> {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK is not initialized. Cannot delete event.';
    console.error(errorMsg);
    return;
  }
  
  try {
    const id = formData.get('id') as string;
    if (!id) {
      console.error('Invalid event ID.');
      return;
    }
    
    await adminDb.collection("events").doc(id).delete();
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Event Deletion Failed: ${error.message}`);

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      console.error('Database delete failed: Firestore permission denied. Check security rules.');
    } else if (error.message.includes('Could not refresh access token')) {
      console.error('Database authentication failed. The server could not connect to Firebase. See server logs.');
    } else {
      console.error(`Server error while deleting: ${error.message}`);
    }
  }
}
