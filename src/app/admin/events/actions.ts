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
  const validatedFields = formSchema.safeParse({
    title: formData.get('title'),
    date: formData.get('date'),
    time: formData.get('time'),
    location: formData.get('location'),
    description: formData.get('description'),
    photo: formData.get('photo'),
  });

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    return {
      error: 'Invalid fields. Please check the form and try again.',
    };
  }
  
  try {
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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Failed to create event:', errorMessage);
    
    if (errorMessage.includes('storage/unauthorized')) {
         return { error: 'Failed to create event: Firebase Storage permission denied. Please check your storage rules in the Firebase console.' };
    }
    
    return {
      error: 'Failed to create event. See server logs for details.'
    }
  }

  return {};
}

export async function deleteEvent(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) {
    return {
      error: 'Invalid event ID.',
    };
  }

  try {
    await deleteEventFromDb(id);
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
  } catch (error) {
    return {
      error: 'Failed to delete event.'
    }
  }
}
