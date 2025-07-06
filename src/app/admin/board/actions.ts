'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { slugify, type BoardMember } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  title: z.string().min(2, "Title must be at least 2 characters."),
});

export async function createBoardMember(values: z.infer<typeof formSchema>) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot create board member.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  
  try {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields!',
      };
    }
    
    const { name, title } = validatedFields.data;
    const id = slugify(name);
    const initials = name.split(' ').map((n) => n[0]).join('');

    const newMember: BoardMember = {
      id,
      name,
      title,
      initials,
      image: "https://placehold.co/100x100.png",
      hint: "person headshot",
    };

    await adminDb.collection('boardMembers').doc(id).set(newMember);

    revalidatePath('/about');
    revalidatePath('/admin/board');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Board Member Creation Failed: ${error.message}`, {cause: error});
    
    if (error.message.includes('Could not refresh access token')) {
        return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}

export async function deleteBoardMember(formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot delete board member.';
    console.error(errorMsg);
    return { error: errorMsg };
  }

  try {
    const id = formData.get('id') as string;
    if (!id) {
        return {
            error: 'Invalid board member ID.',
        };
    }

    await adminDb.collection('boardMembers').doc(id).delete();
    revalidatePath('/about');
    revalidatePath('/admin/board');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Board Member Deletion Failed: ${error.message}`, {cause: error});
    if (error.message.includes('permission-denied')) {
        return { error: 'Database delete failed: Firestore permission denied.' };
    }
    if (error.message.includes('Could not refresh access token')) {
        return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred while deleting the board member.' };
  }
}

const updateFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters."),
    title: z.string().min(2, "Title must be at least 2 characters."),
});

export async function updateBoardMember(values: z.infer<typeof updateFormSchema>) {
    if (!adminDb) {
        const errorMsg = 'Firebase Admin SDK not initialized. Cannot update board member.';
        console.error(errorMsg);
        return { error: errorMsg };
    }

    try {
        const validatedFields = updateFormSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: 'Invalid fields!' };
        }

        const { id, name, title } = validatedFields.data;
        const initials = name.split(' ').map((n) => n[0]).join('');
        
        const memberRef = adminDb.collection('boardMembers').doc(id);
        await memberRef.update({ name, title, initials });


        revalidatePath('/about');
        revalidatePath('/admin/board');
        return { success: true };

    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(`Board Member Update Failed: ${error.message}`, { cause: error });
        if (error.message.includes('permission-denied')) {
            return { error: 'Database update failed: Firestore permission denied.' };
        }
        if (error.message.includes('Could not refresh access token')) {
            return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
        }
        return { error: 'An unexpected server error occurred while updating the board member.' };
    }
}
