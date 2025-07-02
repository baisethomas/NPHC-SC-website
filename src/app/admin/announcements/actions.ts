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
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }
  
  try {
    await addAnnouncement(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/admin/announcements');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    console.error('Failed to create announcement:', errorMessage);
    
    if (errorMessage.includes('permission-denied') || errorMessage.includes('insufficient permissions')) {
        return { error: 'Failed to create announcement: Firestore permission denied. Please check your Firestore security rules in the Firebase console to allow writes to the "announcements" collection.' };
    }

    return {
      error: 'Failed to create announcement. See server logs for details.'
    }
  }

  return {};
}

export async function deleteAnnouncement(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) {
        return {
            error: 'Invalid announcement ID.',
        };
    }

    try {
        await deleteAnnouncementFromDb(id);
        revalidatePath('/');
        revalidatePath('/admin/announcements');
    } catch (error) {
        return {
            error: 'Failed to delete announcement.'
        }
    }
}
