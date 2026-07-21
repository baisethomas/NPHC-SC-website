'use server';

import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireAdminSession } from '@/lib/server-auth';

export interface MailingListSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  active: boolean;
}

const idSchema = z.string().min(1, 'Subscriber ID is required');

export async function getMailingListSubscribers(): Promise<{
  subscribers: MailingListSubscriber[];
  error: string | null;
}> {
  const auth = await requireAdminSession();
  if (!auth.ok) return { subscribers: [], error: auth.error };

  if (!adminDb) {
    return { subscribers: [], error: 'Database not available' };
  }

  try {
    const snapshot = await adminDb
      .collection('mailingList')
      .orderBy('subscribedAt', 'desc')
      .limit(500)
      .get();

    const subscribers = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: typeof data.email === 'string' ? data.email : '',
        name: typeof data.name === 'string' ? data.name : undefined,
        subscribedAt: typeof data.subscribedAt === 'string' ? data.subscribedAt : '',
        active: data.active !== false,
      } satisfies MailingListSubscriber;
    });

    return { subscribers, error: null };
  } catch (error) {
    console.error('Error fetching mailing list subscribers:', error);
    return { subscribers: [], error: 'Failed to fetch mailing list subscribers' };
  }
}

export async function unsubscribeMailingListSubscriber(id: string) {
  const auth = await requireAdminSession();
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Database not available' };
  }

  const validatedId = idSchema.safeParse(id);
  if (!validatedId.success) {
    return { error: 'Invalid subscriber ID' };
  }

  try {
    await adminDb.collection('mailingList').doc(validatedId.data).update({ active: false });
    return { success: true };
  } catch (error) {
    console.error('Error unsubscribing mailing list subscriber:', error);
    return { error: 'Failed to unsubscribe. Please try again.' };
  }
}
