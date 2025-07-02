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
    addAnnouncement(validatedFields.data);
    revalidatePath('/');
    revalidatePath('/admin/announcements');
  } catch (error) {
    return {
      error: 'Failed to create announcement.'
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
        deleteAnnouncementFromDb(id);
        revalidatePath('/');
        revalidatePath('/admin/announcements');
    } catch (error) {
        return {
            error: 'Failed to delete announcement.'
        }
    }
}
