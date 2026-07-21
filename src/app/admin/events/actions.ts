'use server';

import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { requirePermissionSession } from '@/lib/server-auth';
import { uploadImageFromServer } from '@/lib/admin-storage';
import { PERMISSIONS } from '@/lib/roles';
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
  status: z.enum(['draft', 'published']),
  rsvpEnabled: z.boolean(),
  externalLink: z.string().url().optional().or(z.literal("")),
  maxAttendees: z.number().optional(),
});

export async function createEvent(values: z.infer<typeof eventSchema>) {
  const auth = await requirePermissionSession(PERMISSIONS.MANAGE_EVENTS);
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Firebase Admin SDK is not initialized.' };
  }
  
  const validatedFields = eventSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { title, date, time, location, description, image, eventType, status, rsvpEnabled, externalLink, maxAttendees } = validatedFields.data;
  
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
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rsvpEnabled,
    currentAttendees: 0,
    ...(externalLink && { externalLink }),
    ...(maxAttendees && { maxAttendees }),
  };

  try {
    await adminDb.collection("events").doc(slug).create(newEvent);

    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    revalidatePath(`/events/${slug}`);

    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Event Creation Failed: ${error.message}`);
    if (error.message.includes('already exists')) {
      return { error: 'An event with this title already exists.' };
    }
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database write failed: Firestore permission denied. Check security rules.' };
    }
    if (error.message.includes('Could not refresh access token')) {
      return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred while creating the event.' };
  }
}

const updateEventSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string().min(2, "Date is required."),
  time: z.string().min(2, "Time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  eventType: z.enum(['internal', 'external', 'info_only']),
  status: z.enum(['draft', 'published']),
  rsvpEnabled: z.boolean(),
  externalLink: z.string().url().optional().or(z.literal("")),
  maxAttendees: z.number().int().positive().optional(),
});

export async function updateEvent(
  id: string,
  formData: FormData
): Promise<{ success?: true; error?: string }> {
  const auth = await requirePermissionSession(PERMISSIONS.MANAGE_EVENTS);
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Firebase Admin SDK is not initialized.' };
  }

  if (!id || typeof id !== 'string') {
    return { error: 'Invalid event ID.' };
  }

  const maxAttendeesRaw = formData.get('maxAttendees');
  const validatedFields = updateEventSchema.safeParse({
    title: formData.get('title'),
    date: formData.get('date'),
    time: formData.get('time'),
    location: formData.get('location'),
    description: formData.get('description'),
    eventType: formData.get('eventType'),
    status: formData.get('status'),
    rsvpEnabled: formData.get('rsvpEnabled') === 'true',
    externalLink: (formData.get('externalLink') as string | null) ?? '',
    maxAttendees: maxAttendeesRaw ? Number(maxAttendeesRaw) : undefined,
  });

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { title, date, time, location, description, eventType, status, rsvpEnabled, externalLink, maxAttendees } = validatedFields.data;

  if (eventType === 'external' && !externalLink) {
    return { error: 'External link is required for external events.' };
  }

  try {
    // The doc id is the original slug — never re-slugify the title on update,
    // or public /events/[slug] links would break.
    const updates: Record<string, unknown> = {
      title,
      date,
      time,
      location,
      description,
      eventType,
      status,
      rsvpEnabled,
      rsvpLink: externalLink || "#",
      updatedAt: new Date().toISOString(),
      externalLink: externalLink || FieldValue.delete(),
      maxAttendees: maxAttendees ?? FieldValue.delete(),
    };

    const imageFile = formData.get('image');
    if (imageFile instanceof File && imageFile.size > 0) {
      updates.image = await uploadImageFromServer(imageFile, 'events');
    }

    await adminDb.collection("events").doc(id).update(updates);

    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    revalidatePath(`/events/${id}`);

    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Event Update Failed: ${error.message}`);
    if (error.message.includes('NOT_FOUND') || error.message.includes('No document to update')) {
      return { error: 'This event no longer exists.' };
    }
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database write failed: Firestore permission denied. Check security rules.' };
    }
    if (error.message.includes('Could not refresh access token')) {
      return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred while updating the event.' };
  }
}

export async function deleteEvent(formData: FormData): Promise<void> {
  const auth = await requirePermissionSession(PERMISSIONS.MANAGE_EVENTS);
  if (!auth.ok) {
    console.error(auth.error);
    return;
  }

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
