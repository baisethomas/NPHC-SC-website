'use server';

import { revalidatePath } from 'next/cache';
import { admin, adminDb } from '@/lib/firebase-admin';
import { requireSession } from '@/lib/server-auth';
import { getOwnMemberProfile } from '@/lib/member-profile';
import { ownProfileSchema, type OwnProfileInput } from './schema';

/**
 * Lets a signed-in member edit their own profile fields. Only the fields a
 * member owns are writable; status, roles, and email stay admin-controlled.
 */
export async function updateOwnProfile(values: OwnProfileInput): Promise<{ success: true } | { error: string }> {
  const session = await requireSession();
  if (!session.ok) return { error: 'Please sign in again.' };
  if (!adminDb) return { error: 'Database not available.' };

  const parsed = ownProfileSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };

  const profile = await getOwnMemberProfile(session.user.uid);
  if (!profile) return { error: 'We could not find your member record. Contact the council.' };

  try {
    await adminDb
      .collection('members')
      .doc(profile.id)
      .update({
        displayName: parsed.data.displayName,
        organization: parsed.data.organization || admin.firestore.FieldValue.delete(),
        chapter: parsed.data.chapter || admin.firestore.FieldValue.delete(),
        phone: parsed.data.phone || admin.firestore.FieldValue.delete(),
        avatarUrl: parsed.data.avatarUrl || admin.firestore.FieldValue.delete(),
        showInDirectory: parsed.data.showInDirectory,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    revalidatePath('/members');
    revalidatePath('/members/profile');
    revalidatePath('/members/directory');
    return { success: true };
  } catch (error) {
    console.error('Failed to update own profile:', error);
    return { error: 'Could not save your profile. Please try again.' };
  }
}
