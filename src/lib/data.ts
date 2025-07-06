import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

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

export async function getEvents(): Promise<Event[]> {
  try {
    const eventsCol = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCol);
    const eventList = eventSnapshot.docs.map(doc => doc.data() as Event);
    return eventList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("FIREBASE READ ERROR: Failed to fetch events. This is often due to Firestore security rules. Please check your Firebase console and ensure the 'events' collection has public read access. Returning an empty array to prevent a crash.");
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
  try {
    const eventDocRef = doc(db, 'events', slug);
    const eventSnap = await getDoc(eventDocRef);
    
    if (eventSnap.exists()) {
      return eventSnap.data() as Event;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(`FIREBASE READ ERROR: Failed to fetch event with slug '${slug}'.`, error);
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
  try {
    const announcementsCol = collection(db, 'announcements');
    const announcementSnapshot = await getDocs(announcementsCol);
    const announcementList = announcementSnapshot.docs.map(doc => doc.data() as Announcement);
    const sortedList = announcementList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { announcements: sortedList, error: null };
  } catch (error) {
    const errorMessage = "FIREBASE READ ERROR: Failed to fetch announcements. This is often due to Firestore security rules. Please check your Firebase console and ensure the 'announcements' collection has public read access.";
    console.error(errorMessage, error);
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

export async function getBoardMembers(): Promise<BoardMember[]> {
  try {
    const membersCol = collection(db, 'boardMembers');
    const memberSnapshot = await getDocs(membersCol);
    const memberList = memberSnapshot.docs.map(doc => doc.data() as BoardMember);
    return memberList;
  } catch (error) {
    console.error("FIREBASE READ ERROR: Failed to fetch board members. This is often due to Firestore security rules. Please check your Firebase console and ensure the 'boardMembers' collection has public read access.");
    return [];
  }
}

export async function getBoardMemberById(id: string): Promise<BoardMember | undefined> {
  try {
    const memberDocRef = doc(db, 'boardMembers', id);
    const memberSnap = await getDoc(memberDocRef);
    
    if (memberSnap.exists()) {
      return memberSnap.data() as BoardMember;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(`FIREBASE READ ERROR: Failed to fetch board member with ID '${id}'.`, error);
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
