'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminSession } from '@/lib/server-auth';

export type ContactSubmissionStatus = 'new' | 'handled';

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  submittedAt: string;
  status: ContactSubmissionStatus;
}

const idSchema = z.string().min(1, 'Submission ID is required');

export async function getContactSubmissions(): Promise<{
  submissions: ContactSubmission[];
  error: string | null;
}> {
  const auth = await requireAdminSession();
  if (!auth.ok) return { submissions: [], error: auth.error };

  if (!adminDb) {
    return { submissions: [], error: 'Database not available' };
  }

  try {
    const snapshot = await adminDb
      .collection('contactSubmissions')
      .orderBy('submittedAt', 'desc')
      .limit(100)
      .get();

    const submissions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: typeof data.name === 'string' ? data.name : '',
        email: typeof data.email === 'string' ? data.email : '',
        subject: typeof data.subject === 'string' ? data.subject : undefined,
        message: typeof data.message === 'string' ? data.message : '',
        submittedAt: typeof data.submittedAt === 'string' ? data.submittedAt : '',
        status: data.status === 'handled' ? 'handled' : 'new',
      } satisfies ContactSubmission;
    });

    return { submissions, error: null };
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    return { submissions: [], error: 'Failed to fetch contact submissions' };
  }
}

export async function markContactSubmissionHandled(id: string) {
  const auth = await requireAdminSession();
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Database not available' };
  }

  const validatedId = idSchema.safeParse(id);
  if (!validatedId.success) {
    return { error: 'Invalid submission ID' };
  }

  try {
    await adminDb
      .collection('contactSubmissions')
      .doc(validatedId.data)
      .update({ status: 'handled' });
    return { success: true };
  } catch (error) {
    console.error('Error marking contact submission handled:', error);
    return { error: 'Failed to update the submission. Please try again.' };
  }
}

export async function deleteContactSubmission(id: string) {
  const auth = await requireAdminSession();
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Database not available' };
  }

  const validatedId = idSchema.safeParse(id);
  if (!validatedId.success) {
    return { error: 'Invalid submission ID' };
  }

  try {
    await adminDb.collection('contactSubmissions').doc(validatedId.data).delete();
    return { success: true };
  } catch (error) {
    console.error('Error deleting contact submission:', error);
    return { error: 'Failed to delete the submission. Please try again.' };
  }
}
