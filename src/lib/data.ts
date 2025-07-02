import { db } from './firebase';
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

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

const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

type NewEvent = Omit<Event, 'id' | 'slug' | 'image' | 'image_hint' | 'rsvpLink'>;

export async function getEvents(): Promise<Event[]> {
  try {
    const eventsCol = collection(db, 'events');
    const eventSnapshot = await getDocs(eventsCol);
    const eventList = eventSnapshot.docs.map(doc => doc.data() as Event);
    return eventList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("FIREBASE READ ERROR: Failed to fetch events.", error);
    console.log("This is often due to Firestore security rules. Please check your Firebase console and ensure the 'events' collection has public read access using the rules provided in the conversation. Returning an empty array to prevent a crash.");
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
    console.log("This is often due to Firestore security rules. Please check your Firebase console and ensure the 'events' collection has public read access.");
    return undefined;
  }
}

export async function addEvent(event: NewEvent): Promise<void> {
  const slug = slugify(event.title);
  const newEvent: Event = {
    ...event,
    id: slug,
    slug: slug,
    image: "https://placehold.co/600x400.png",
    image_hint: "new event",
    rsvpLink: "#",
  };
  await setDoc(doc(db, "events", slug), newEvent);
}

export async function deleteEvent(id: string): Promise<void> {
  await deleteDoc(doc(db, "events", id));
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
}

type NewAnnouncement = Omit<Announcement, 'id'>;

export async function getAnnouncements(): Promise<Announcement[]> {
  try {
    const announcementsCol = collection(db, 'announcements');
    const announcementSnapshot = await getDocs(announcementsCol);
    const announcementList = announcementSnapshot.docs.map(doc => doc.data() as Announcement);
    return announcementList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("FIREBASE READ ERROR: Failed to fetch announcements.", error);
    console.log("This is often due to Firestore security rules. Please check your Firebase console and ensure the 'announcements' collection has public read access. Returning an empty array to prevent a crash.");
    return [];
  }
}

export async function addAnnouncement(announcement: NewAnnouncement) {
  const slug = slugify(announcement.title);
  const newAnnouncement: Announcement = {
    id: slug,
    ...announcement,
  };
  await setDoc(doc(db, "announcements", slug), newAnnouncement);
}

export async function deleteAnnouncement(id: string) {
  await deleteDoc(doc(db, "announcements", id));
}

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  image: string;
  hint: string;
}

let boardMembers: BoardMember[] = [
  { id: "eleanor-vance", name: "Eleanor Vance", title: "President", initials: "EV", image: "https://placehold.co/100x100.png", hint: "headshot person" },
  { id: "marcus-thorne", name: "Marcus Thorne", title: "Vice President", initials: "MT", image: "https://placehold.co/100x100.png", hint: "professional headshot" },
  { id: "seraphina-cruz", name: "Seraphina Cruz", title: "Secretary", initials: "SC", image: "https://placehold.co/100x100.png", hint: "person smiling" },
  { id: "julian-hayes", name: "Julian Hayes", title: "Treasurer", initials: "JH", image: "https://placehold.co/100x100.png", hint: "corporate headshot" },
  { id: "isabella-chen", name: "Isabella Chen", title: "Parliamentarian", initials: "IC", image: "https://placehold.co/100x100.png", hint: "professional person" },
  { id: "david-rodriguez", name: "David Rodriguez", title: "Director of Community Service", initials: "DR", image: "https://placehold.co/100x100.png", hint: "person outdoors" },
];

type NewBoardMember = Omit<BoardMember, 'id' | 'image' | 'hint' | 'initials'>;

export function getBoardMembers() {
  return boardMembers;
}

export function addBoardMember(member: NewBoardMember) {
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('');
    
  const newMember: BoardMember = {
    ...member,
    id: slugify(member.name),
    initials,
    image: "https://placehold.co/100x100.png",
    hint: "person headshot",
  };
  boardMembers = [newMember, ...boardMembers];
}

export function deleteBoardMember(id: string) {
  boardMembers = boardMembers.filter((member) => member.id !== id);
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
