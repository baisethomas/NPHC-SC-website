'use server';

import { z } from 'zod';
import { addAnnouncement, deleteAnnouncement as deleteAnnouncementFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string().min(2, "Date is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

export async function createAnnouncement(values: z.infer<typeof formSchema>) {
  try {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields!',
      };
    }
    
    await addAnnouncement(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/admin/announcements');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Announcement Creation Failed: ${error.message}`, {cause: error});
    
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database write failed: Firestore permission denied. Please check your security rules.' };
    }

    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}

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

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    return { error: 'An unexpected server error occurred while deleting the announcement.' };
  }
}
