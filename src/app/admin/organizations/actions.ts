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
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }
  
  try {
    addOrganization(validatedFields.data);
    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      error: `Failed to create organization: ${errorMessage}`
    }
  }

  return {};
}

export async function deleteOrganization(formData: FormData) {
  const id = formData.get('id') as string;
  if (!id) {
    return {
      error: 'Invalid organization ID.',
    };
  }

  try {
    deleteOrganizationFromDb(id);
    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      error: `Failed to delete organization: ${errorMessage}`
    }
  }
}
