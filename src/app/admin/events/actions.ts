'use server';

import { z } from 'zod';
import { addEvent, deleteEvent as deleteEventFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/storage';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string(),
  time: z.string().min(2, "Time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  image: z
    .any()
    .refine((file) => file, "Image is required.")
    .refine((file) => file?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export async function createEvent(formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());
    const validatedFields = formSchema.safeParse(rawFormData);
    
    if (!validatedFields.success) {
      console.error("Event form validation failed:", validatedFields.error.flatten());
      return {
        error: 'Invalid fields! Please check the form and try again.',
      };
    }
    
    const { image, date, ...eventData } = validatedFields.data;
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const imageUrl = await uploadFile(image);
    
    await addEvent({
      ...eventData,
      date: formattedDate,
      image: imageUrl,
    });
    
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    // Log the full error to the server console for debugging.
    console.error("--- FULL ERROR IN createEvent ACTION ---");
    console.error(error);
    console.error("--------------------------------------");

    // Provide a more specific error message to the user.
    if (error.message.includes('storage/unauthorized') || error.message.includes('permission-denied')) {
      return { error: 'Image upload failed due to permissions. Please ensure you are logged in and that Firebase Storage security rules are correctly configured.' };
    }
    
    if (error.message.includes('insufficient permissions')) {
      return { error: 'Database write failed due to permissions. Please check your Firestore security rules.' };
    }
    
    if (error.message.toLowerCase().includes('firebase')) {
        return { error: `A Firebase error occurred: ${error.message}. Please check your configuration and security rules.` };
    }

    return { error: `An unexpected server error occurred: ${error.message}` };
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
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Event Deletion Failed: ${error.message}`, {cause: error});

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    return { error: `Server error while deleting: ${error.message}` };
  }
}
