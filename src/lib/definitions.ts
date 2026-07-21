export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  image_hint: string;
  rsvpLink: string;
  status?: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  scheduledDate?: string;
  createdAt?: string;
  updatedAt?: string;
  eventType: 'internal' | 'external' | 'info_only';
  rsvpEnabled: boolean;
  externalLink?: string;
  maxAttendees?: number;
  currentAttendees?: number;
}

export interface EventRSVP {
  id: string;
  eventId: string;
  name: string;
  email: string;
  guestCount: number;
  timestamp: string;
  phone?: string;
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
  status?: 'draft' | 'published' | 'scheduled';
  publishDate?: string;
  scheduledDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  image: string;
  hint: string;
  organization?: string;
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  hint: string;
  description: string;
  chapter: string;
  link: string;
  president: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  category: string;
  organizationName: string;
  status?: 'active' | 'inactive' | 'seasonal';
  image?: string;
  imageHint?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberProfile {
  id: string;
  authUid?: string;
  displayName: string;
  email: string;
  role: string;
  organization: string;
  chapter?: string;
  avatarUrl?: string;
  joinedAt?: string;
  membershipStatus?: 'pending' | 'approved' | 'suspended' | 'rejected';
  isActive?: boolean;
}

export interface DivineNineOrganization {
  name: string;
  logo: string;
  hint: string;
}

/**
 * A Divine Nine national organization as stored in the Firestore
 * `divineNine` collection (doc id + explicit sort order).
 */
export interface DivineNineDoc extends DivineNineOrganization {
  id: string;
  order: number;
}

export const slugify = (text: string): string => 
  text.toLowerCase()
    .replace(/&/g, 'and')  // Replace & with 'and' before other replacements
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')  // Collapse multiple dashes into one
    .replace(/^-|-$/g, ''); // Remove leading/trailing dashes


const divineNineOrganizations: DivineNineOrganization[] = [
  {
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fbg_logo_aka.svg?alt=media&token=38c60162-5882-424c-984c-79474af03cdf",
    hint: "organization crest",
  },
  {
    name: "Alpha Phi Alpha Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fapa_crest_132_c.webp?alt=media&token=760876ea-073d-40c0-89a6-8b0f9bcb0895",
    hint: "organization crest",
  },
  {
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FCrest_Logo_rszd.webp?alt=media&token=4626362b-92fc-4ad1-8527-55276a36ac99",
    hint: "organization crest",
  },
  {
    name: "Zeta Phi Beta Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FZetaPBetaShield.webp?alt=media&token=2620543c-4f27-4df7-9db7-3622a8bd9ec8",
    hint: "organization crest",
  },
  {
    name: "Iota Phi Theta Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fip-1.webp?alt=media&token=1aa50626-e2e7-4907-b6e9-2aec61c8e92a",
    hint: "organization crest",
  },
  {
    name: "Kappa Alpha Psi Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FKAPsiCrest.webp?alt=media&token=a5228d03-85f8-4ea9-9523-5bc69f17b296",
    hint: "organization crest",
  },
  {
    name: "Sigma Gamma Rho Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FSigma_Gamma_Rho_Shield.webp?alt=media&token=1c56cf79-fd09-4f60-90a1-d27faaf08f65",
    hint: "organization crest",
  },
  {
    name: "Phi Beta Sigma Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FPhiBetaSigmaShield.webp?alt=media&token=ccbcfaed-497d-4190-ad85-d90f4caec067",
    hint: "organization crest",
  },
  {
    name: "Omega Psi Phi Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Foppf-shield-logo-flat2.png?alt=media&token=5737b334-12a0-47d9-82c9-f307f814d79f",
    hint: "organization crest",
  },
];

export function getDivineNineOrganizations() {
  return divineNineOrganizations;
}
