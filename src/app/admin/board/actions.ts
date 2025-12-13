
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { slugify, type BoardMember } from '@/lib/definitions';
import { uploadBoardMemberImage } from '@/lib/storage';
import admin from 'firebase-admin';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  title: z.string().min(2, "Title must be at least 2 characters."),
  image: z.string().optional(),
  organization: z.string().optional(),
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
    
    const { name, title, image, organization } = validatedFields.data;
    const id = slugify(name);
    const initials = name.split(' ').map((n) => n[0]).join('');

    const newMember: BoardMember = {
      id,
      name,
      title,
      initials,
      image: image || "https://placehold.co/100x100.png",
      hint: "person headshot",
      organization: organization || undefined,
    };

    await adminDb.collection('boardMembers').doc(id).set(newMember);

    revalidatePath('/about');
    revalidatePath('/admin/board');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Board Member Creation Failed: ${error.message}`);
    
    if (error.message.includes('Could not refresh access token')) {
        return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
    }
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}

export async function createBoardMemberWithImage(formData: FormData) {
  if (!adminDb) {
    const errorMsg = 'Firebase Admin SDK not initialized. Cannot create board member.';
    console.error(errorMsg);
    return { error: errorMsg };
  }
  
  try {
    const name = formData.get('name') as string;
    const title = formData.get('title') as string;
    const imageFile = formData.get('image') as File;
    const organization = formData.get('organization') as string;

    if (!name || name.length < 2) {
      return { error: 'Name must be at least 2 characters.' };
    }
    if (!title || title.length < 2) {
      return { error: 'Title must be at least 2 characters.' };
    }

    const id = slugify(name);
    const initials = name.split(' ').map((n) => n[0]).join('');

    let imageUrl = "https://placehold.co/100x100.png";
    
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadBoardMemberImage(imageFile);
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return { error: 'Failed to upload image. Please try again.' };
      }
    }

    const newMember: BoardMember = {
      id,
      name,
      title,
      initials,
      image: imageUrl,
      hint: "person headshot",
      organization: organization || undefined,
    };

    await adminDb.collection('boardMembers').doc(id).set(newMember);

    revalidatePath('/about');
    revalidatePath('/admin/board');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Board Member Creation Failed: ${error.message}`);
    
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
    console.error(`Board Member Deletion Failed: ${error.message}`);
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
    image: z.string().optional(),
    organization: z.string().optional(),
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

        const { id, name, title, image, organization } = validatedFields.data;
        const initials = name.split(' ').map((n) => n[0]).join('');
        
        const updateData: any = { name, title, initials };
        if (image) {
            updateData.image = image;
        }
        if (organization) {
            updateData.organization = organization;
        } else {
            updateData.organization = admin.firestore.FieldValue.delete();
        }
        
        const memberRef = adminDb.collection('boardMembers').doc(id);
        await memberRef.update(updateData);

        revalidatePath('/about');
        revalidatePath('/admin/board');
        return { success: true };

    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(`Board Member Update Failed: ${error.message}`);
        if (error.message.includes('permission-denied')) {
            return { error: 'Database update failed: Firestore permission denied.' };
        }
        if (error.message.includes('Could not refresh access token')) {
            return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
        }
        return { error: 'An unexpected server error occurred while updating the board member.' };
    }
}

export async function updateBoardMemberWithImage(formData: FormData) {
    if (!adminDb) {
        const errorMsg = 'Firebase Admin SDK not initialized. Cannot update board member.';
        console.error(errorMsg);
        return { error: errorMsg };
    }

    try {
        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const title = formData.get('title') as string;
        const imageFile = formData.get('image') as File;
        const organization = formData.get('organization') as string;

        if (!id) {
            return { error: 'Board member ID is required.' };
        }
        if (!name || name.length < 2) {
            return { error: 'Name must be at least 2 characters.' };
        }
        if (!title || title.length < 2) {
            return { error: 'Title must be at least 2 characters.' };
        }

        const initials = name.split(' ').map((n) => n[0]).join('');
        
        const updateData: any = { name, title, initials };
        
        if (imageFile && imageFile.size > 0) {
            try {
                const imageUrl = await uploadBoardMemberImage(imageFile);
                updateData.image = imageUrl;
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                return { error: 'Failed to upload image. Please try again.' };
            }
        }
        
        if (organization) {
            updateData.organization = organization;
        } else {
            updateData.organization = admin.firestore.FieldValue.delete();
        }
        
        const memberRef = adminDb.collection('boardMembers').doc(id);
        await memberRef.update(updateData);

        revalidatePath('/about');
        revalidatePath('/admin/board');
        return { success: true };

    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(`Board Member Update Failed: ${error.message}`);
        if (error.message.includes('permission-denied')) {
            return { error: 'Database update failed: Firestore permission denied.' };
        }
        if (error.message.includes('Could not refresh access token')) {
            return { error: 'Database authentication failed. The server could not connect to Firebase. See server logs.' };
        }
        return { error: 'An unexpected server error occurred while updating the board member.' };
    }
}
