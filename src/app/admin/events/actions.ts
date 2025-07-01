'use server';

import { z } from 'zod';
import { addEvent } from '@/lib/data';
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
