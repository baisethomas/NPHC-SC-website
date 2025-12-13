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

export interface DivineNineOrganization {
  name: string;
  logo: string;
  hint: string;
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
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fbg_logo_aka.svg?alt=media",
    hint: "organization crest",
  },
  {
    name: "Alpha Phi Alpha Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fapa_crest_132_c.webp?alt=media",
    hint: "organization crest",
  },
  {
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FCrest_Logo_rszd.webp?alt=media",
    hint: "organization crest",
  },
  {
    name: "Zeta Phi Beta Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FZetaPBetaShield.webp?alt=media",
    hint: "organization crest",
  },
  {
    name: "Iota Phi Theta Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fip-1.webp?alt=media",
    hint: "organization crest",
  },
  {
    name: "Kappa Alpha Psi Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FKAPsiCrest.webp?alt=media",
    hint: "organization crest",
  },
  {
    name: "Sigma Gamma Rho Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FSigma_Gamma_Rho_Shield.webp?alt=media",
    hint: "organization crest",
  },
  {
    name: "Phi Beta Sigma Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FPhiBetaSigmaShield.webp?alt=media",
    hint: "organization crest",
  },
  {
    name: "Omega Psi Phi Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Foppf-shield-logo-flat2.png?alt=media",
    hint: "organization crest",
  },
];

export function getDivineNineOrganizations() {
  return divineNineOrganizations;
}
