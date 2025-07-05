'use server';

import { z } from 'zod';
import { deleteAnnouncement as deleteAnnouncementFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

export async function deleteAnnouncement(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
        return {
            error: 'Invalid announcement ID.',
        };
    }

    await deleteAnnouncementFromDb(id);
    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Announcement Deletion Failed: ${error.message}`, {cause: error});

    if (error.message.includes('Firebase Admin SDK is not initialized')) {
      return { error: 'SERVER CONFIG ERROR: The Firebase Admin SDK is not initialized. Please check the server logs for more details.' };
    }

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    return { error: 'An unexpected server error occurred while deleting the announcement.' };
  }
}
