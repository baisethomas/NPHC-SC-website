'use server';

import { z } from 'zod';
import { addOrganization, deleteOrganization as deleteOrganizationFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  chapter: z.string().min(2, "Chapter must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  link: z.string().url("Please enter a valid URL."),
});

export async function createOrganization(values: z.infer<typeof formSchema>) {
  try {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields!',
      };
    }
    
    addOrganization(validatedFields.data);
    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Organization Creation Failed: ${error.message}`, {cause: error});
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}

export async function deleteOrganization(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
      return {
        error: 'Invalid organization ID.',
      };
    }

    deleteOrganizationFromDb(id);
    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Organization Deletion Failed: ${error.message}`, {cause: error});
    return { error: 'An unexpected server error occurred while deleting the organization.' };
  }
}
