
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase-admin';
import { requirePermissionSession } from '@/lib/server-auth';
import { PERMISSIONS } from '@/lib/roles';
import { slugify } from '@/lib/definitions';
import { uploadImageFromServer } from '@/lib/admin-storage';
import { buildDivineNineSeedDocs } from '@/lib/data';

const requireAdminSession = () =>
  requirePermissionSession(PERMISSIONS.EDIT_CONTENT);

type ActionResult = { success: true } | { error: string };

const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  chapter: z.string().min(2, 'Chapter must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  link: z.string().url('Please enter a valid URL.'),
  president: z.string().min(2, 'President name must be at least 2 characters.'),
});

function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Invalid fields!';
}

function getOptionalFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

export async function createOrganization(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Firebase Admin SDK not initialized.' };
  }
  try {
    const validatedFields = organizationSchema.safeParse({
      name: formData.get('name'),
      chapter: formData.get('chapter'),
      description: formData.get('description'),
      link: formData.get('link'),
      president: formData.get('president'),
    });
    if (!validatedFields.success) {
      return { error: firstZodError(validatedFields.error) };
    }

    const { name, chapter, description, link, president } = validatedFields.data;
    const id = slugify(`${name}-${chapter}`);

    let logoUrl = 'https://placehold.co/200x200.png';
    const logoFile = getOptionalFile(formData, 'logo');
    if (logoFile) {
      try {
        logoUrl = await uploadImageFromServer(logoFile, 'organizations');
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return { error: 'Failed to upload logo image. Please try again.' };
      }
    }

    const newOrg = {
      id,
      name,
      chapter,
      description,
      link,
      president,
      logo: logoUrl,
      hint: 'organization crest',
    };

    await adminDb.collection('organizations').doc(id).create(newOrg);

    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Organization Creation Failed: ${error.message}`);
    if (error.message.includes('already exists')) {
      return { error: 'An organization with this name and chapter already exists.' };
    }
    return { error: 'An unexpected server error occurred. Please try again later.' };
  }
}

export async function deleteOrganization(formData: FormData): Promise<void> {
  const auth = await requireAdminSession();
  if (!auth.ok) {
    console.error(auth.error);
    return;
  }

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

const updateOrganizationSchema = organizationSchema.extend({
  id: z.string().min(1, 'Missing organization ID.'),
});

export async function updateOrganization(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Firebase Admin SDK not initialized.' };
  }
  try {
    const validatedFields = updateOrganizationSchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name'),
      chapter: formData.get('chapter'),
      description: formData.get('description'),
      link: formData.get('link'),
      president: formData.get('president'),
    });
    if (!validatedFields.success) {
      return { error: firstZodError(validatedFields.error) };
    }

    // Doc ids stay stable on edit — the name/chapter are NOT re-slugified.
    const { id, name, chapter, description, link, president } = validatedFields.data;

    const updateData: Record<string, string> = { name, chapter, description, link, president };

    const logoFile = getOptionalFile(formData, 'logo');
    if (logoFile) {
      try {
        updateData.logo = await uploadImageFromServer(logoFile, 'organizations');
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return { error: 'Failed to upload logo image. Please try again.' };
      }
    }

    await adminDb.collection('organizations').doc(id).update(updateData);

    revalidatePath('/organizations');
    revalidatePath('/admin/organizations');
    revalidatePath('/');
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Organization Update Failed: ${error.message}`);
    return { error: 'An unexpected server error occurred while updating the organization.' };
  }
}

// --- Divine Nine national organizations (Firestore `divineNine` collection) ---

const divineNineSchema = z.object({
  id: z.string().min(1, 'Missing organization ID.'),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  order: z.coerce
    .number()
    .int('Order must be a whole number.')
    .min(0, 'Order must be 0 or greater.'),
});

export async function updateDivineNineOrganization(formData: FormData): Promise<ActionResult> {
  const auth = await requireAdminSession();
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Firebase Admin SDK not initialized.' };
  }
  try {
    const validatedFields = divineNineSchema.safeParse({
      id: formData.get('id'),
      name: formData.get('name'),
      order: formData.get('order'),
    });
    if (!validatedFields.success) {
      return { error: firstZodError(validatedFields.error) };
    }

    const { id, name, order } = validatedFields.data;
    const collection = adminDb.collection('divineNine');

    // If the collection has never been seeded, the admin list shows the
    // hardcoded fallback. Seed all nine before applying the edit so a single
    // upsert can't leave the collection with only one document.
    const snapshot = await collection.limit(1).get();
    if (snapshot.empty) {
      const batch = adminDb.batch();
      for (const doc of buildDivineNineSeedDocs()) {
        const { id: docId, ...rest } = doc;
        batch.set(collection.doc(docId), rest);
      }
      await batch.commit();
    }

    const updateData: Record<string, string | number> = { name, order, hint: 'organization crest' };

    const logoFile = getOptionalFile(formData, 'logo');
    if (logoFile) {
      try {
        updateData.logo = await uploadImageFromServer(logoFile, 'organizations');
      } catch (uploadError) {
        console.error('Logo upload failed:', uploadError);
        return { error: 'Failed to upload logo image. Please try again.' };
      }
    }

    await collection.doc(id).set(updateData, { merge: true });

    revalidatePath('/');
    revalidatePath('/programs');
    revalidatePath('/admin/organizations');
    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Divine Nine Update Failed: ${error.message}`);
    return { error: 'An unexpected server error occurred while updating the organization.' };
  }
}
