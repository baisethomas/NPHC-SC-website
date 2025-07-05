'use server';

import { z } from 'zod';
import { deleteEvent as deleteEventFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

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

    if (error.message.includes('Firebase Admin SDK is not initialized')) {
      return { error: 'SERVER CONFIG ERROR: The Firebase Admin SDK is not initialized. Please check the server logs for more details.' };
    }

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    return { error: `Server error while deleting: ${error.message}` };
  }
}
