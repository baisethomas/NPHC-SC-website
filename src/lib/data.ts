
import { adminDb } from './firebase-admin';
import { db } from './firebase';

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
}

export const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

const handleFetchError = (error: unknown, context: string): string => {
  const err = error instanceof Error ? error : new Error(String(error));
  console.warn(`FIREBASE FETCH WARNING (${context}):`, err.message);
  
  if (err.message.includes('permission-denied') || err.message.includes('insufficient permissions')) {
    return `Failed to fetch ${context}. This is due to Firestore security rules. Please check your Firebase project configuration and ensure public read access is enabled for this collection.`;
  }

  if (err.message.includes('Could not refresh access token')) {
    return `Database authentication failed. The server could not connect to Firebase. To fix this for local development, run 'gcloud auth application-default login' in your terminal and restart the server.`;
  }
  
  return `An unexpected error occurred while fetching ${context}. Please check the server logs for more details.`;
};


export async function getEvents(): Promise<Event[]> {
  if (!adminDb) {
    console.warn('Firebase Admin SDK not initialized. Cannot fetch events.');
    return [];
  }
  try {
    const eventSnapshot = await adminDb.collection('events').get();
    const eventList = eventSnapshot.docs.map(doc => doc.data() as Event);
    return eventList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.warn("Error fetching events with Admin SDK:", error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
   if (!adminDb) {
    console.warn(`Firebase Admin SDK not initialized. Cannot fetch event by slug '${slug}'.`);
    return undefined;
  }
  try {
    const eventDocRef = adminDb.collection('events').doc(slug);
    const eventSnap = await eventDocRef.get();
    
    if (eventSnap.exists) {
      return eventSnap.data() as Event;
    } else {
      return undefined;
    }
  } catch (error) {
    console.warn(`Error fetching event by slug '${slug}' with Admin SDK:`, error);
    return undefined;
  }
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
}

export async function getAnnouncements(): Promise<{announcements: Announcement[], error: string | null}> {
  if (!adminDb) {
    return { announcements: [], error: 'Firebase Admin SDK is not initialized. Cannot fetch announcements.' };
  }
  try {
    const announcementSnapshot = await adminDb.collection('announcements').get();
    const announcementList = announcementSnapshot.docs.map(doc => doc.data() as Announcement);
    const sortedList = announcementList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { announcements: sortedList, error: null };
  } catch (error) {
    const errorMessage = handleFetchError(error, 'announcements');
    return { announcements: [], error: errorMessage };
  }
}

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  image: string;
  hint: string;
}

export async function getBoardMembers(): Promise<{ boardMembers: BoardMember[], error: string | null }> {
  if (!adminDb) {
    return { boardMembers: [], error: 'Firebase Admin SDK is not initialized. Cannot fetch board members.' };
  }
  try {
    const memberSnapshot = await adminDb.collection('boardMembers').get();
    const memberList = memberSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        title: data.title || '',
        initials: data.initials || '',
        image: data.image || 'https://placehold.co/100x100.png',
        hint: data.hint || 'person headshot',
      } as BoardMember;
    });

    const titleOrder: { [key: string]: number } = {
        'President': 1,
        'Vice President': 2,
    };

    memberList.sort((a, b) => {
        const aOrder = titleOrder[a.title] || 99;
        const bOrder = titleOrder[b.title] || 99;

        if (aOrder !== bOrder) {
            return aOrder - bOrder;
        }
        
        return a.name.localeCompare(b.name);
    });

    return { boardMembers: memberList, error: null };
  } catch (error) {
    const errorMessage = handleFetchError(error, 'board members');
    return { boardMembers: [], error: errorMessage };
  }
}

export async function getBoardMemberById(id: string): Promise<BoardMember | undefined> {
  if (!adminDb) {
    console.warn(`Firebase Admin SDK not initialized. Cannot fetch board member with ID '${id}'.`);
    return undefined;
  }
  try {
    const memberDocRef = adminDb.collection('boardMembers').doc(id);
    const memberSnap = await memberDocRef.get();
    
    if (memberSnap.exists) {
      const data = memberSnap.data();
      if (!data) return undefined;
      return {
        id: memberSnap.id,
        name: data.name || '',
        title: data.title || '',
        initials: data.initials || '',
        image: data.image || 'https://placehold.co/100x100.png',
        hint: data.hint || 'person headshot',
      } as BoardMember
    } else {
      return undefined;
    }
  } catch (error) {
    handleFetchError(error, `board member with ID '${id}'`);
    return undefined;
  }
}

export interface Organization {
  id: string;
  name: string;
  logo: string;
  hint: string;
  description: string;
  chapter: string;
  link: string;
}

let organizations: Organization[] = [
    {
    id: "alpha-kappa-alpha-sorority-inc--kappa-beta-omega-chapter",
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://aka1908.com/wp-content/uploads/2022/06/bg_logo_aka.svg",
    hint: "organization crest",
    description: "The first intercollegiate historically African American Greek-lettered sorority.",
    chapter: "Kappa Beta Omega Chapter",
    link: "#",
  },
  {
    id: "alpha-kappa-alpha-sorority-inc--tau-upsilon-omega-chapter",
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://aka1908.com/wp-content/uploads/2022/06/bg_logo_aka.svg",
    hint: "organization crest",
    description: "The first intercollegiate historically African American Greek-lettered sorority.",
    chapter: "Tau Upsilon Omega Chapter",
    link: "#",
  },
  {
    id: "alpha-phi-alpha-fraternity-inc--kappa-omicron-lambda-chapter",
    name: "Alpha Phi Alpha Fraternity, Inc.",
    logo: "https://apa1906.net/wp-content/uploads/2018/08/apa_crest_132_c.png",
    hint: "organization crest",
    description: "The first intercollegiate Greek-letter fraternity established for African American Men.",
    chapter: "Kappa Omicron Lambda Chapter",
    link: "#",
  },
    {
    id: "delta-sigma-theta-sorority-inc--fairfield-suisun-valley-alumnae-chapter",
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://www.deltasigmatheta.org/wp-content/uploads/2023/01/Crest_Logo_rszd.png",
    hint: "organization crest",
    description: "An organization of college educated women committed to the constructive development of its members and to public service.",
    chapter: "Fairfield-Suisun Valley Alumnae Chapter",
    link: "#",
  },
   {
    id: "delta-sigma-theta-sorority-inc--vallejo-alumnae-chapter",
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://www.deltasigmatheta.org/wp-content/uploads/2023/01/Crest_Logo_rszd.png",
    hint: "organization crest",
    description: "An organization of college educated women committed to the constructive development of its members and to public service.",
    chapter: "Vallejo Alumnae Chapter",
    link: "#",
  },
  {
    id: "kappa-alpha-psi-fraternity-inc--fairfield-vacaville-alumni-chapter",
    name: "Kappa Alpha Psi Fraternity, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/KAPsiCrest.png",
    hint: "organization crest",
    description: "A collegiate Greek-letter fraternity with a predominantly African-American membership, focused on achievement in every field of human endeavor.",
    chapter: "Fairfield-Vacaville Alumni Chapter",
    link: "#",
  },
  {
    id: "omega-psi-phi-fraternity-inc--theta-pi-chapter",
    name: "Omega Psi Phi Fraternity, Inc.",
    logo: "https://studentlife.oregonstate.edu/sites/studentlife.oregonstate.edu/files/styles/large/public/omega-psi-phi-fraternity-crest_0.png?itok=RhlfKa3V",
    hint: "organization crest",
    description: "The first international fraternal organization founded on the campus of a historically black college, based on Friendship, Manhood, Scholarship, Perseverance, and Uplift.",
    chapter: "Theta Pi Chapter",
    link: "#",
  },
];

type NewOrganization = Omit<Organization, 'id' | 'logo' | 'hint'>;

export function getOrganizations() {
  return organizations;
}

export function addOrganization(org: NewOrganization) {
  const newOrg: Organization = {
    ...org,
    id: slugify(`${org.name}-${org.chapter}`),
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
  };
  organizations = [newOrg, ...organizations];
}

export function deleteOrganization(id: string) {
  organizations = organizations.filter((org) => org.id !== id);
}

interface DivineNineOrganization {
  name: string;
  logo: string;
  hint: string;
}

const divineNineOrganizations: DivineNineOrganization[] = [
  {
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://aka1908.com/wp-content/uploads/2022/06/bg_logo_aka.svg",
    hint: "organization crest",
  },
  {
    name: "Alpha Phi Alpha Fraternity, Inc.",
    logo: "https://apa1906.net/wp-content/uploads/2018/08/apa_crest_132_c.png",
    hint: "organization crest",
  },
  {
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://www.deltasigmatheta.org/wp-content/uploads/2023/01/Crest_Logo_rszd.png",
    hint: "organization crest",
  },
  {
    name: "Zeta Phi Beta Sorority, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/cd/ZetaPBetaShield.png",
    hint: "organization crest",
  },
  {
    name: "Iota Phi Theta Fraternity, Inc.",
    logo: "https://iotaphitheta.org/wp-content/uploads/2022/09/ip-1.png",
    hint: "organization crest",
  },
  {
    name: "Kappa Alpha Psi Fraternity, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/KAPsiCrest.png",
    hint: "organization crest",
  },
  {
    name: "Sigma Gamma Rho Sorority, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Sigma_Gamma_Rho_Shield.png",
    hint: "organization crest",
  },
  {
    name: "Phi Beta Sigma Fraternity, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/PhiBetaSigmaShield.png",
    hint: "organization crest",
  },
  {
    name: "Omega Psi Phi Fraternity, Inc.",
    logo: "https://studentlife.oregonstate.edu/sites/studentlife.oregonstate.edu/files/styles/large/public/omega-psi-phi-fraternity-crest_0.png?itok=RhlfKa3V",
    hint: "organization crest",
  },
];

export function getDivineNineOrganizations() {
  return divineNineOrganizations;
}
