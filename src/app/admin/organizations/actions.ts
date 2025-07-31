
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { slugify } from '@/lib/definitions';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  chapter: z.string().min(2, "Chapter must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  link: z.string().url("Please enter a valid URL."),
  president: z.string().min(2, "President name must be at least 2 characters."),
});

export async function createOrganization(values: z.infer<typeof formSchema>) {
  if (!adminDb) {
    return { error: 'Firebase Admin SDK not initialized.' };
  }
  try {
    const validatedFields = formSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: 'Invalid fields!' };
    }
    
    const { name, chapter, description, link, president } = validatedFields.data;
    const id = slugify(`${name}-${chapter}`);
    
    const newOrg = {
      id,
      name,
      chapter,
      description,
      link,
      president,
      logo: "https://placehold.co/200x200.png",
      hint: "organization crest",
    };

    await adminDb.collection('organizations').doc(id).set(newOrg);

    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Organization Creation Failed: ${error.message}`);
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}

export async function deleteOrganization(formData: FormData): Promise<void> {
  if (!adminDb) {
    console.error('Firebase Admin SDK not initialized.');
    return;
  }
  try {
    const id = formData.get('id') as string;
    if (!id) {
      console.error('Invalid organization ID.');
      return;
    }

    await adminDb.collection('organizations').doc(id).delete();
    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Organization Deletion Failed: ${error.message}`);
  }
}

const updateFormSchema = z.object({
    id: z.string(),
    link: z.string().url("Please enter a valid URL."),
    president: z.string().min(2, "President name must be at least 2 characters."),
});

export async function updateOrganization(values: z.infer<typeof updateFormSchema>) {
    if (!adminDb) {
        return { error: 'Firebase Admin SDK not initialized.' };
    }
    try {
        const validatedFields = updateFormSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: 'Invalid fields!' };
        }

        const { id, link, president } = validatedFields.data;
        await adminDb.collection('organizations').doc(id).update({ link, president });

        revalidatePath('/organizations');
        revalidatePath('/admin/organizations');
        return { success: true };

    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(`Organization Update Failed: ${error.message}`);
        return { error: 'An unexpected server error occurred while updating the organization.' };
    }
}
