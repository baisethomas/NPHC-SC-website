'use server';

import { z } from 'zod';
import { addBoardMember, deleteBoardMember as deleteBoardMemberFromDb, updateBoardMember as updateBoardMemberInDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  title: z.string().min(2, "Title must be at least 2 characters."),
});

export async function createBoardMember(values: z.infer<typeof formSchema>) {
  try {
    const validatedFields = formSchema.safeParse(values);

    if (!validatedFields.success) {
      return {
        error: 'Invalid fields!',
      };
    }
    
    addBoardMember(validatedFields.data);
    revalidatePath('/about');
    revalidatePath('/admin/board');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Board Member Creation Failed: ${error.message}`, {cause: error});
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}

export async function deleteBoardMember(formData: FormData) {
  try {
    const id = formData.get('id') as string;
    if (!id) {
        return {
            error: 'Invalid board member ID.',
        };
    }

    deleteBoardMemberFromDb(id);
    revalidatePath('/about');
    revalidatePath('/admin/board');
    return { success: true };

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Board Member Deletion Failed: ${error.message}`, {cause: error});
    return { error: 'An unexpected server error occurred while deleting the board member.' };
  }
}

const updateFormSchema = z.object({
    id: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters."),
    title: z.string().min(2, "Title must be at least 2 characters."),
});

export async function updateBoardMember(values: z.infer<typeof updateFormSchema>) {
    try {
        const validatedFields = updateFormSchema.safeParse(values);

        if (!validatedFields.success) {
            return { error: 'Invalid fields!' };
        }

        const { id, name, title } = validatedFields.data;
        updateBoardMemberInDb(id, { name, title });

        revalidatePath('/about');
        revalidatePath('/admin/board');
        return { success: true };

    } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        console.error(`Board Member Update Failed: ${error.message}`, { cause: error });
        return { error: 'An unexpected server error occurred while updating the board member.' };
    }
}
