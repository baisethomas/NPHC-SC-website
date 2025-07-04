'use server';

import { z } from 'zod';
import { addEvent, deleteEvent as deleteEventFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.date(),
  time: z.string().min(2, "Time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

export async function createEvent(values: z.infer<typeof formSchema>) {
  try {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields!',
      };
    }
    
    const { date, ...eventData } = validatedFields.data;
    
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    await addEvent({
      ...eventData,
      date: formattedDate,
    });
    
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    
    return {};
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('An unknown error occurred during event creation.');
    console.error(`Event Creation Failed: ${error.message}`, {cause: error});
    
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database write failed: Firestore permission denied. Please check your security rules.' };
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
