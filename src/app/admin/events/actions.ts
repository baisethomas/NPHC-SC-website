'use server';

import { z } from 'zod';
import { addEvent, deleteEvent as deleteEventFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/storage';

const fileSchema = z.instanceof(File, { message: "Image is required." })
  .refine((file) => file.size > 0, "Image is required.")
  .refine((file) => file.size <= 5_000_000, `Max file size is 5MB.`)
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type),
    "Only .jpg, .jpeg, .png and .webp formats are supported."
  );

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string(),
  time: z.string().min(2, "Time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  photo: fileSchema,
});


export async function createEvent(formData: FormData) {
  try {
    const validatedFields = formSchema.safeParse({
      title: formData.get('title'),
      date: formData.get('date'),
      time: formData.get('time'),
      location: formData.get('location'),
      description: formData.get('description'),
      photo: formData.get('photo'),
    });

    if (!validatedFields.success) {
      const validationErrors = validatedFields.error.flatten().fieldErrors;
      console.error('Validation failed:', validationErrors);
      const errorMessages = Object.values(validationErrors).flat().join(', ');
      return {
        error: `Invalid fields: ${errorMessages || 'Please check the form and try again.'}`,
      };
    }
  
    const { photo, ...eventData } = validatedFields.data;
    const imageUrl = await uploadFile(photo);
    
    const formattedDate = new Date(eventData.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await addEvent({
      ...eventData,
      date: formattedDate,
    }, imageUrl);

    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    
    return {};
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('An unknown server error occurred.');
    console.error(`Event Creation Failed: ${error.message}`, {cause: error});

    if (error.message.includes('storage/unauthorized')) {
        return { error: 'Upload failed: Firebase Storage permission denied. Please check your storage rules.' };
    }
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database operation failed: Firestore permission denied. Please check your security rules.' };
    }

    return { error: `Server error: ${error.message}` };
  }
}

export async function deleteEvent(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return {
        error: 'Invalid event ID.',
      };
    }
    
    await deleteEventFromDb(id);
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    return {};
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('An unknown error occurred during event deletion.');
    console.error(`Event Deletion Failed: ${error.message}`, {cause: error});

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    return { error: `Server error while deleting: ${error.message}` };
  }
}
