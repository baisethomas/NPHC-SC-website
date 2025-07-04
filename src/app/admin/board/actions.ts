'use server';

import { z } from 'zod';
import { addBoardMember, deleteBoardMember as deleteBoardMemberFromDb } from '@/lib/data';
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

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('An unknown error occurred during board member creation.');
    console.error(`Board Member Creation Failed: ${error.message}`, {cause: error});
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }

  return {};
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

  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error('An unknown error occurred during board member deletion.');
    console.error(`Board Member Deletion Failed: ${error.message}`, {cause: error});
    return { error: 'An unexpected server error occurred while deleting the board member.' };
  }
}
