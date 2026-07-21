'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requirePermissionSession } from '@/lib/server-auth';
import { PERMISSIONS } from '@/lib/roles';
import { sanitizeHtml } from '@/lib/sanitizer';
import { uploadImageFromServer } from '@/lib/admin-storage';
import { CMS_COLLECTIONS } from '@/lib/cms-collections';
import {
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_BLOCKS,
  SITE_CONTENT_COLLECTION,
  isSiteContentKey,
  type SiteContentBlockType,
  type SiteContentKey,
} from '@/lib/site-content';

const MAX_VALUE_LENGTH = 50_000;

const updateSchema = z.object({
  key: z.string().refine(isSiteContentKey, 'Unknown content block.'),
  value: z
    .string()
    .min(1, 'Content cannot be empty.')
    .max(MAX_VALUE_LENGTH, 'Content is too long (max 50,000 characters).'),
});

export interface ContentBlockView {
  key: SiteContentKey;
  label: string;
  description: string;
  type: SiteContentBlockType;
  page: 'Homepage' | 'About';
  value: string;
  isDefault: boolean;
  updatedAt: string | null;
  updatedBy: string | null;
}

interface SiteContentDoc {
  value?: unknown;
  updatedAt?: unknown;
  updatedBy?: unknown;
}

export async function getContentBlocks(): Promise<
  { blocks: ContentBlockView[] } | { error: string }
> {
  const auth = await requirePermissionSession(PERMISSIONS.EDIT_CONTENT);
  if (!auth.ok) return { error: auth.error };

  const db = adminDb;
  if (!db) {
    return { error: 'Firebase Admin SDK is not initialized.' };
  }

  const docsByKey = new Map<string, SiteContentDoc>();
  try {
    const refs = SITE_CONTENT_BLOCKS.map((block) =>
      db.collection(SITE_CONTENT_COLLECTION).doc(block.key)
    );
    const snapshots = await db.getAll(...refs);
    snapshots.forEach((snapshot) => {
      if (snapshot.exists) {
        docsByKey.set(snapshot.id, snapshot.data() as SiteContentDoc);
      }
    });
  } catch (e) {
    console.error('Failed to load site content blocks:', e);
    return { error: 'Failed to load content blocks from the database.' };
  }

  const blocks: ContentBlockView[] = SITE_CONTENT_BLOCKS.map((block) => {
    const doc = docsByKey.get(block.key);
    const storedValue =
      doc && typeof doc.value === 'string' && doc.value.length > 0 ? doc.value : null;
    return {
      key: block.key,
      label: block.label,
      description: block.description,
      type: block.type,
      page: block.page,
      value: storedValue ?? DEFAULT_SITE_CONTENT[block.key],
      isDefault: storedValue === null,
      updatedAt: doc && typeof doc.updatedAt === 'string' ? doc.updatedAt : null,
      updatedBy: doc && typeof doc.updatedBy === 'string' ? doc.updatedBy : null,
    };
  });

  return { blocks };
}

export async function updateContentBlock(
  key: string,
  value: string
): Promise<{ success: true } | { error: string }> {
  const auth = await requirePermissionSession(PERMISSIONS.EDIT_CONTENT);
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Firebase Admin SDK is not initialized.' };
  }

  const parsed = updateSchema.safeParse({ key, value });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid fields.' };
  }

  const blockKey = parsed.data.key;
  const block = SITE_CONTENT_BLOCKS.find((b) => b.key === blockKey);
  if (!block) {
    return { error: 'Unknown content block.' };
  }

  let storedValue = parsed.data.value.trim();
  if (block.type === 'richtext') {
    storedValue = sanitizeHtml(storedValue);
    if (!storedValue) {
      return { error: 'Content cannot be empty.' };
    }
  } else if (block.type === 'image') {
    const urlCheck = z.string().url().safeParse(storedValue);
    if (!urlCheck.success) {
      return { error: 'Image value must be a valid URL.' };
    }
  }

  const now = new Date().toISOString();

  try {
    await adminDb.collection(SITE_CONTENT_COLLECTION).doc(blockKey).set({
      value: storedValue,
      updatedAt: now,
      updatedBy: auth.user.uid,
    });

    await adminDb.collection(CMS_COLLECTIONS.AUDIT_LOGS).add({
      action: 'update_site_content',
      actorUid: auth.user.uid,
      blockKey,
      timestamp: now,
      source: 'admin-ui',
    });

    revalidatePath('/');
    revalidatePath('/about');
    revalidatePath('/admin/content');

    return { success: true };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Site content update failed for "${blockKey}": ${error.message}`);
    return { error: 'An unexpected server error occurred while saving the content.' };
  }
}

export async function uploadContentImage(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const auth = await requirePermissionSession(PERMISSIONS.EDIT_CONTENT);
  if (!auth.ok) return { error: auth.error };

  const file = formData.get('image');
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Please choose an image file to upload.' };
  }

  try {
    // No dedicated site-content folder exists in admin-storage's ImageFolder
    // union; reuse 'announcements' rather than widening that union here.
    const url = await uploadImageFromServer(file, 'announcements');
    return { url };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    return { error: error.message };
  }
}
