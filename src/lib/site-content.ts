// Fixed registry of editable site content blocks (CMS Phase 2.2).
// This is NOT a page builder: the set of blocks is defined in code, and admins
// can only edit the value of each named block. Values live in the Firestore
// `siteContent` collection (doc id = block key); any missing doc falls back to
// the hardcoded copy in DEFAULT_SITE_CONTENT so pages render identically
// before any admin edit.
import { cache } from 'react';
import { adminDb } from '@/lib/firebase-admin';

export const SITE_CONTENT_COLLECTION = 'siteContent';

export type SiteContentBlockType = 'richtext' | 'text' | 'image';

export interface SiteContentBlockDef {
  key: SiteContentKey;
  label: string;
  description: string;
  type: SiteContentBlockType;
  page: 'Homepage' | 'About';
}

export const SITE_CONTENT_KEYS = [
  'home.hero.headline',
  'home.hero.tagline',
  'home.hero.image',
  'home.president.message',
  'home.mission',
  'about.history',
  'about.history.image',
  'about.objectives.intro',
  'about.essay.tradition',
  'about.essay.commitment',
] as const;

export type SiteContentKey = (typeof SITE_CONTENT_KEYS)[number];

export function isSiteContentKey(key: string): key is SiteContentKey {
  return (SITE_CONTENT_KEYS as readonly string[]).includes(key);
}

export const SITE_CONTENT_BLOCKS: readonly SiteContentBlockDef[] = [
  {
    key: 'home.hero.headline',
    label: 'Hero Headline',
    description: 'The large headline at the top of the homepage.',
    type: 'text',
    page: 'Homepage',
  },
  {
    key: 'home.hero.tagline',
    label: 'Hero Tagline',
    description: 'The short sentence displayed under the homepage headline.',
    type: 'text',
    page: 'Homepage',
  },
  {
    key: 'home.hero.image',
    label: 'Hero Background Image',
    description: 'The full-width background photo behind the homepage hero.',
    type: 'image',
    page: 'Homepage',
  },
  {
    key: 'home.president.message',
    label: "President's Message",
    description: "The quoted message in the \"A Message from Our President\" section.",
    type: 'richtext',
    page: 'Homepage',
  },
  {
    key: 'home.mission',
    label: 'Mission Statement',
    description: 'The paragraph in the "Our Mission" section of the homepage.',
    type: 'richtext',
    page: 'Homepage',
  },
  {
    key: 'about.history',
    label: 'Our Rich History',
    description: 'The history paragraphs on the About page.',
    type: 'richtext',
    page: 'About',
  },
  {
    key: 'about.history.image',
    label: 'History Photo',
    description: 'The photo displayed beside the history section on the About page.',
    type: 'image',
    page: 'About',
  },
  {
    key: 'about.objectives.intro',
    label: 'Mission & Objectives Intro',
    description: 'The introduction paragraph of the "Our Mission & Objectives" section.',
    type: 'richtext',
    page: 'About',
  },
  {
    key: 'about.essay.tradition',
    label: 'Essay: Why Our Tradition Must Continue',
    description: 'The body of the "Why Our Tradition Must Continue" accordion item.',
    type: 'richtext',
    page: 'About',
  },
  {
    key: 'about.essay.commitment',
    label: 'Essay: A Lifetime Commitment',
    description: 'The body of the "A Lifetime Commitment" accordion item.',
    type: 'richtext',
    page: 'About',
  },
] as const;

// Today's hardcoded copy, extracted verbatim from src/app/page.tsx and
// src/app/about/page.tsx. Used whenever a siteContent doc does not exist.
export const DEFAULT_SITE_CONTENT: Record<SiteContentKey, string> = {
  'home.hero.headline': 'NPHC of Solano County',
  'home.hero.tagline':
    'Fostering brotherhood and sisterhood, scholarship, and service within the Solano County community.',
  'home.hero.image':
    'https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/photos%2F486065740_4131253287097506_5154761858775003667_n.jpg?alt=media&token=98ce7896-a868-4359-80d6-5177068e11df',
  'home.president.message':
    '<p>&quot;Welcome to the National Pan-Hellenic Council of Solano County. Our organization stands as a beacon of unity, scholarship, and service in our community.</p><p>Through the collective strength of our Divine Nine organizations, we continue to foster brotherhood and sisterhood while making meaningful contributions to Solano County. Our commitment to academic excellence, community service, and leadership development remains unwavering.</p><p>I invite you to join us in our mission to uplift our community and create lasting positive change. Together, we embody the true spirit of &#39;Unanimity of Thought and Action.&#39;&quot;</p>',
  'home.mission':
    '<p>The National Pan-Hellenic Council of Solano County is dedicated to &quot;Unanimity of Thought and Action.&quot; We are committed to uplifting our community through service, promoting academic excellence, and creating a lasting legacy of unity and leadership among our member organizations.</p>',
  'about.history':
    '<p>The National Pan-Hellenic Council (NPHC) was founded on May 10, 1930, at Howard University in Washington, DC, to foster cooperative action among its members. The chartering organizations were Alpha Kappa Alpha, Delta Sigma Theta, Zeta Phi Beta, Kappa Alpha Psi, and Omega Psi Phi. They were soon joined by Alpha Phi Alpha and Phi Beta Sigma in 1931, Sigma Gamma Rho in 1937, and Iota Phi Theta in 1997, completing the Divine Nine.</p><p>The Solano County chapter was chartered to bring this powerful legacy to our local community. Since our inception, we have worked tirelessly to unite these historically Black Greek-letter organizations in the area, creating a formidable force for positive change, community empowerment, and cultural enrichment throughout Solano County.</p>',
  'about.history.image':
    'https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/photos%2F485807499_4131253293764172_7067333595532137802_n.jpg?alt=media&token=b4e7804b-b196-4062-8330-364772ac8a9c',
  'about.objectives.intro':
    '<p>The purpose of the NPHC of Solano County is to foster cooperative actions of its members in dealing with matters of mutual concern. We promote the well-being of our affiliate fraternities and sororities, facilitate their development, and provide leadership training for our constituents.</p>',
  'about.essay.tradition':
    '<p>Each of the nine NPHC organizations evolved during a period when African Americans were being denied essential rights and privileges. Racial isolation and social barriers created a need for African Americans to align themselves with others sharing common goals and ideals.</p><p>These Greek-lettered organizations became a haven and an outlet to foster brotherhood and sisterhood in the pursuit of social change. Today, in Solano County and across the nation, that need remains. The primary purpose of our member organizations is community awareness and action through educational, economic, and cultural service activities.</p>',
  'about.essay.commitment':
    '<p>Greek membership extends far beyond the collegiate experience—it is a lifetime commitment. Members are expected to align with a graduate/alumni chapter after college, taking an active part in matters concerning and affecting the community in which they live.</p><p>Here in Solano County, NPHC promotes this lifelong interaction through forums, meetings, and cooperative programming, ensuring a lasting impact on our community.</p>',
};

interface SiteContentDoc {
  value?: unknown;
  updatedAt?: unknown;
  updatedBy?: unknown;
}

/**
 * Fetches site content values for the given block keys via the Admin SDK.
 * Server-only. Falls back to DEFAULT_SITE_CONTENT for any missing doc,
 * unknown key, or read failure, so public pages always render.
 */
export const getSiteContent = cache(
  async (keys: string[]): Promise<Record<string, string>> => {
    const validKeys = keys.filter(isSiteContentKey);
    const result: Record<string, string> = {};
    for (const key of validKeys) {
      result[key] = DEFAULT_SITE_CONTENT[key];
    }

    const db = adminDb;
    if (!db || validKeys.length === 0) {
      return result;
    }

    try {
      const refs = validKeys.map((key) =>
        db.collection(SITE_CONTENT_COLLECTION).doc(key)
      );
      const snapshots = await db.getAll(...refs);
      snapshots.forEach((snapshot, index) => {
        const key = validKeys[index];
        if (!snapshot.exists) return;
        const data = snapshot.data() as SiteContentDoc | undefined;
        if (data && typeof data.value === 'string' && data.value.length > 0) {
          result[key] = data.value;
        }
      });
    } catch (e) {
      console.error('Failed to fetch site content; using defaults.', e);
    }

    return result;
  }
);
