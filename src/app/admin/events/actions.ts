'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';

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
