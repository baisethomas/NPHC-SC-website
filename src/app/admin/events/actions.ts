'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';

export async function deleteEvent(formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK is not initialized. Cannot delete event.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return {
        error: 'Invalid event ID.',
      };
    }
    
    await adminDb.collection("events").doc(id).delete();
    revalidatePath('/events');
    revalidatePath('/admin/events');
    revalidatePath('/');
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Event Deletion Failed: ${error.message}`);

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
      return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    if (error.message.includes('Could not refresh access token')) {
      return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: `Server error while deleting: ${error.message}` };
  }
}
