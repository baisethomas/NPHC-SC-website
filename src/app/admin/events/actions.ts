'use server';

import { z } from 'zod';
import { addEvent, deleteEvent as deleteEventFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  title: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string(),
  description: z.string(),
});

export async function createEvent(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }
  
  try {
    addEvent(validatedFields.data);
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
  } catch (error) {
    return {
      error: 'Failed to create event.'
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
    deleteEventFromDb(id);
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
  } catch (error) {
    return {
      error: 'Failed to delete event.'
    }
  }
}
