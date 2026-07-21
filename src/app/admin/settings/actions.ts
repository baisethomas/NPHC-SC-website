'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { admin, adminDb } from '@/lib/firebase-admin';
import { requirePermissionSession } from '@/lib/server-auth';
import { PERMISSIONS } from '@/lib/roles';
import { CMS_COLLECTIONS } from '@/lib/cms-collections';
import {
  getSiteSettings,
  SITE_SETTINGS_COLLECTION,
  SITE_SETTINGS_DOC_ID,
  type SiteSettings,
} from '@/lib/site-settings';

const optionalHttpsUrl = z
  .string()
  .trim()
  .url('Please enter a valid URL.')
  .startsWith('https://', 'URL must start with https://')
  .or(z.literal(''));

const settingsSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .email('Please enter a valid email address.')
    .or(z.literal('')),
  contactPhone: z.string().trim().max(50, 'Phone number is too long.'),
  mailingAddress: z.string().trim().max(500, 'Mailing address is too long.'),
  facebookUrl: optionalHttpsUrl,
  instagramUrl: optionalHttpsUrl,
  twitterUrl: optionalHttpsUrl,
  donationUrl: optionalHttpsUrl,
  footerText: z.string().trim().max(300, 'Footer text is too long.'),
});

export type SiteSettingsInput = z.infer<typeof settingsSchema>;

const requireSettingsSession = () =>
  requirePermissionSession(PERMISSIONS.MANAGE_SITE_SETTINGS);

export async function getSiteSettingsForAdmin(): Promise<
  { settings: SiteSettings } | { error: string }
> {
  const auth = await requireSettingsSession();
  if (!auth.ok) return { error: auth.error };

  const settings = await getSiteSettings();
  return { settings };
}

export async function updateSiteSettings(
  values: SiteSettingsInput
): Promise<{ success: true } | { error: string }> {
  const auth = await requireSettingsSession();
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Firebase Admin SDK not initialized.' };
  }

  const validatedFields = settingsSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields. Please review the form and try again.' };
  }

  try {
    await adminDb
      .collection(SITE_SETTINGS_COLLECTION)
      .doc(SITE_SETTINGS_DOC_ID)
      .set(
        {
          ...validatedFields.data,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

    await adminDb.collection(CMS_COLLECTIONS.AUDIT_LOGS).add({
      action: 'update_site_settings',
      actorUid: auth.user.uid,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      source: 'admin-ui',
    });

    revalidatePath('/');
    revalidatePath('/contact');
    revalidatePath('/donations');
    revalidatePath('/admin/settings');
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Site settings update failed: ${error.message}`);
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}
