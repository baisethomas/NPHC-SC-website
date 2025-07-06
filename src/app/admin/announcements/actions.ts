
'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { slugify, type Announcement } from '@/lib/definitions';

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string().min(2, "Date is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
});

export async function createAnnouncement(values: z.infer<typeof formSchema>) {
  if (!adminDb) {
    return { error: 'Firebase Admin SDK is not initialized.' };
  }
  
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { title, date, description } = validatedFields.data;
  const slug = slugify(title);

  const newAnnouncement: Announcement = {
    id: slug,
    title,
    date,
    description,
  };

  try {
    await adminDb.collection("announcements").doc(slug).set(newAnnouncement);

    revalidatePath('/');
    revalidatePath('/admin/announcements');
    revalidatePath('/news');
    revalidatePath(`/news/${slug}`);

    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Announcement Creation Failed: ${error.message}`);
    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database write failed: Firestore permission denied. Check security rules.' };
    }
    if (error.message.includes('Could not refresh access token')) {
      return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred while creating the announcement.' };
  }
}

export async function deleteAnnouncement(formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK is not initialized. Cannot delete announcement.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  
  try {
    const id = formData.get('id') as string;
    if (!id) {
        return {
            error: 'Invalid announcement ID.',
        };
    }

    await adminDb.collection("announcements").doc(id).delete();

    revalidatePath('/');
    revalidatePath('/admin/announcements');
    revalidatePath('/news');
    revalidatePath(`/news/${id}`);
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Announcement Deletion Failed: ${error.message}`);

    if (error.message.includes('permission-denied') || error.message.includes('insufficient permissions')) {
        return { error: 'Database delete failed: Firestore permission denied. Check security rules.' };
    }
    if (error.message.includes('Could not refresh access token')) {
      return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred while deleting the announcement.' };
  }
}
