'use server';

import { z } from 'zod';
import { addBoardMember, deleteBoardMember as deleteBoardMemberFromDb } from '@/lib/data';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  title: z.string().min(2, "Title must be at least 2 characters."),
});

export async function createBoardMember(values: z.infer<typeof formSchema>) {
  const validatedFields = formSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields!',
    };
  }
  
  try {
    addBoardMember(validatedFields.data);
    revalidatePath('/about');
    revalidatePath('/admin/board');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return {
      error: `Failed to create board member: ${errorMessage}`
    }
  }

  return {};
}

export async function deleteBoardMember(formData: FormData) {
    const id = formData.get('id') as string;
    if (!id) {
        return {
            error: 'Invalid board member ID.',
        };
    }

    try {
        deleteBoardMemberFromDb(id);
        revalidatePath('/about');
        revalidatePath('/admin/board');
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return {
            error: `Failed to delete board member: ${errorMessage}`
        }
    }
}
