import { cache } from 'react';
import { adminDb } from '@/lib/firebase-admin';

/**
 * Site-wide settings editable from /admin/settings. Stored as a single
 * Firestore document (siteSettings/main) and read server-side only —
 * this module imports firebase-admin and must never reach client code.
 */
export type SiteSettings = {
  contactEmail: string;
  contactPhone: string;
  mailingAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  twitterUrl: string;
  donationUrl: string;
  footerText: string;
  /** Short line shown in the footer, e.g. "General body meets the second Thursday monthly." */
  meetingCadence: string;
  /** Year the council was chartered; shown in the footer and stats bar. */
  yearChartered: string;
  /** Impact numbers that drive the public stats bar. Blank hides the stat. */
  statChapters: string;
  statScholarships: string;
  statServiceHours: string;
  statMembers: string;
};

export const SITE_SETTINGS_COLLECTION = 'siteSettings';
export const SITE_SETTINGS_DOC_ID = 'main';

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  contactEmail: 'info@nphcsolano.org',
  contactPhone: '',
  mailingAddress: '',
  facebookUrl: '',
  instagramUrl: '',
  twitterUrl: '',
  donationUrl: '',
  footerText: '',
  meetingCadence: '',
  yearChartered: '',
  statChapters: '',
  statScholarships: '',
  statServiceHours: '',
  statMembers: '',
};

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Reads siteSettings/main with sensible defaults. Wrapped in React cache()
 * so multiple server components in the same request share a single read.
 */
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!adminDb) {
    return { ...DEFAULT_SITE_SETTINGS };
  }

  try {
    const snapshot = await adminDb
      .collection(SITE_SETTINGS_COLLECTION)
      .doc(SITE_SETTINGS_DOC_ID)
      .get();

    if (!snapshot.exists) {
      return { ...DEFAULT_SITE_SETTINGS };
    }

    const data = snapshot.data() ?? {};
    return {
      contactEmail:
        asTrimmedString(data.contactEmail) || DEFAULT_SITE_SETTINGS.contactEmail,
      contactPhone: asTrimmedString(data.contactPhone),
      mailingAddress: asTrimmedString(data.mailingAddress),
      facebookUrl: asTrimmedString(data.facebookUrl),
      instagramUrl: asTrimmedString(data.instagramUrl),
      twitterUrl: asTrimmedString(data.twitterUrl),
      donationUrl: asTrimmedString(data.donationUrl),
      footerText: asTrimmedString(data.footerText),
      meetingCadence: asTrimmedString(data.meetingCadence),
      yearChartered: asTrimmedString(data.yearChartered),
      statChapters: asTrimmedString(data.statChapters),
      statScholarships: asTrimmedString(data.statScholarships),
      statServiceHours: asTrimmedString(data.statServiceHours),
      statMembers: asTrimmedString(data.statMembers),
    };
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error(`Failed to read site settings: ${error.message}`);
    return { ...DEFAULT_SITE_SETTINGS };
  }
});
