
import { adminDb } from './firebase-admin';
import type { Event, Announcement, BoardMember, Organization, Program } from './definitions';

const handleFirestoreError = (error: unknown, context: string): string => {
  const err = error instanceof Error ? error : new Error(String(error));
  const message = `Failed to ${context}. Message: ${err.message}`;

  if (err.message.includes('Could not refresh access token') || err.message.includes('The "payload" argument must be of type object. Received null')) {
    console.warn(`FIREBASE AUTH WARNING: ${message}`);
    return `Database authentication failed. The server could not connect to Firebase. This is common in local development. Run 'gcloud auth application-default login' in your terminal and restart the server.`;
  }
  
  console.error(`FIREBASE READ ERROR: ${message}`);
  return `An unexpected error occurred while fetching ${context}. Please check the server logs for more details.`;
};


export async function getEvents(): Promise<Event[]> {
  if (!adminDb) {
    console.warn('Firebase Admin SDK not initialized. Cannot fetch events.');
    return [];
  }
  try {
    const eventSnapshot = await adminDb.collection('events').get();
    const eventList = eventSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: data.id || doc.id,
        slug: data.slug || doc.id,
      } as Event;
    });
    
    console.log(`Fetched ${eventList.length} events from Firestore`);
    
    // Sort events by date - handle formatted date strings like "January 15, 2025"
    return eventList.filter(event => event && event.title).sort((a, b) => {
      if (!a.date || !b.date) {
        return 0; // Keep order if dates are missing
      }
      
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      // If date parsing fails, fallback to string comparison
      if (isNaN(dateA) || isNaN(dateB)) {
        return b.date.localeCompare(a.date);
      }
      
      return dateB - dateA; // Sort descending (newest first)
    });
  } catch (error) {
    console.error("Error fetching events with Admin SDK:", error);
    return [];
  }
}

export async function getEventBySlug(slug: string): Promise<Event | undefined> {
   if (!adminDb) {
    console.warn(`Firebase Admin SDK not initialized. Cannot fetch event by slug '${slug}'.`);
    return undefined;
  }
  try {
    // Normalize the slug - remove double dashes and clean it up
    const normalizedSlug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '');
    
    const eventDocRef = adminDb.collection('events').doc(normalizedSlug);
    const eventSnap = await eventDocRef.get();
    
    if (eventSnap.exists) {
      const data = eventSnap.data();
      return {
        ...data,
        id: data?.id || normalizedSlug,
        slug: data?.slug || normalizedSlug,
      } as Event;
    } else {
      // Try searching by slug field if direct doc lookup fails
      const querySnapshot = await adminDb.collection('events')
        .where('slug', '==', normalizedSlug)
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          id: data?.id || doc.id,
          slug: data?.slug || normalizedSlug,
        } as Event;
      }
      
      console.warn(`Event not found with slug '${normalizedSlug}'`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error fetching event by slug '${slug}' with Admin SDK:`, error);
    return undefined;
  }
}

export async function getAnnouncements(includeAll = false): Promise<{announcements: Announcement[], error: string | null}> {
  if (!adminDb) {
    return { announcements: [], error: 'Firebase Admin SDK is not initialized. Cannot fetch announcements.' };
  }
  try {
    const announcementSnapshot = await adminDb.collection('announcements').get();
    let announcementList = announcementSnapshot.docs.map(doc => doc.data() as Announcement);
    
    if (!includeAll) {
      const now = new Date();
      announcementList = announcementList.filter(announcement => {
        if (!announcement.status || announcement.status === 'published') return true;
        if (announcement.status === 'scheduled' && announcement.scheduledDate) {
          return new Date(announcement.scheduledDate) <= now;
        }
        return false;
      });
    }
    
    const sortedList = announcementList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return { announcements: sortedList, error: null };
  } catch (error) {
    const errorMessage = handleFirestoreError(error, 'fetch announcements');
    return { announcements: [], error: errorMessage };
  }
}

export async function getAnnouncementBySlug(slug: string): Promise<Announcement | undefined> {
   if (!adminDb) {
    handleFirestoreError(new Error("Firebase Admin SDK not initialized."), `fetch announcement with slug '${slug}'`);
    return undefined;
  }
  try {
    const docRef = adminDb.collection('announcements').doc(slug);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      return docSnap.data() as Announcement;
    } else {
      return undefined;
    }
  } catch (error) {
    handleFirestoreError(error, `fetch announcement with slug '${slug}'`);
    return undefined;
  }
}

export async function getBoardMembers(): Promise<{ boardMembers: BoardMember[], error: string | null }> {
  if (!adminDb) {
    return { boardMembers: [], error: handleFirestoreError(new Error("Firebase Admin SDK not initialized."), "fetch board members") };
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
        organization: data.organization || undefined,
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
    const errorMessage = handleFirestoreError(error, 'fetch board members');
    return { boardMembers: [], error: errorMessage };
  }
}

export async function getBoardMemberById(id: string): Promise<BoardMember | undefined> {
  if (!adminDb) {
    handleFirestoreError(new Error("Firebase Admin SDK not initialized."), `fetch board member with ID '${id}'`);
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
        organization: data.organization || undefined,
      } as BoardMember
    } else {
      return undefined;
    }
  } catch (error) {
    handleFirestoreError(error, `fetch board member with ID '${id}'`);
    return undefined;
  }
}

const initialOrganizations: Organization[] = [
    {
    id: "alpha-kappa-alpha-sorority-inc--kappa-beta-omega-chapter",
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fbg_logo_aka.svg?alt=media",
    hint: "organization crest",
    description: "The first intercollegiate historically African American Greek-lettered sorority.",
    chapter: "Kappa Beta Omega Chapter",
    link: "#",
    president: "TBD",
  },
  {
    id: "alpha-kappa-alpha-sorority-inc--tau-upsilon-omega-chapter",
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fbg_logo_aka.svg?alt=media",
    hint: "organization crest",
    description: "The first intercollegiate historically African American Greek-lettered sorority.",
    chapter: "Tau Upsilon Omega Chapter",
    link: "#",
    president: "TBD",
  },
  {
    id: "alpha-phi-alpha-fraternity-inc--kappa-omicron-lambda-chapter",
    name: "Alpha Phi Alpha Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Fapa_crest_132_c.webp?alt=media",
    hint: "organization crest",
    description: "The first intercollegiate Greek-letter fraternity established for African American Men.",
    chapter: "Kappa Omicron Lambda Chapter",
    link: "#",
    president: "TBD",
  },
    {
    id: "delta-sigma-theta-sorority-inc--fairfield-suisun-valley-alumnae-chapter",
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FCrest_Logo_rszd.webp?alt=media",
    hint: "organization crest",
    description: "An organization of college educated women committed to the constructive development of its members and to public service.",
    chapter: "Fairfield-Suisun Valley Alumnae Chapter",
    link: "#",
    president: "TBD",
  },
   {
    id: "delta-sigma-theta-sorority-inc--vallejo-alumnae-chapter",
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FCrest_Logo_rszd.webp?alt=media",
    hint: "organization crest",
    description: "An organization of college educated women committed to the constructive development of its members and to public service.",
    chapter: "Vallejo Alumnae Chapter",
    link: "#",
    president: "TBD",
  },
  {
    id: "kappa-alpha-psi-fraternity-inc--fairfield-vacaville-alumni-chapter",
    name: "Kappa Alpha Psi Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2FKAPsiCrest.webp?alt=media",
    hint: "organization crest",
    description: "A collegiate Greek-letter fraternity with a predominantly African-American membership, focused on achievement in every field of human endeavor.",
    chapter: "Fairfield-Vacaville Alumni Chapter",
    link: "#",
    president: "TBD",
  },
  {
    id: "omega-psi-phi-fraternity-inc--theta-pi-chapter",
    name: "Omega Psi Phi Fraternity, Inc.",
    logo: "https://firebasestorage.googleapis.com/v0/b/nphc-solano-hub.firebasestorage.app/o/organizations%2Foppf-shield-logo-flat2.png?alt=media",
    hint: "organization crest",
    description: "The first international fraternal organization founded on the campus of a historically black college, based on Friendship, Manhood, Scholarship, Perseverance, and Uplift.",
    chapter: "Theta Pi Chapter",
    link: "#",
    president: "TBD",
  },
];


async function seedOrganizations() {
    if (!adminDb) {
        console.error('Cannot seed organizations: adminDb is not initialized');
        return;
    }
    try {
        const batch = adminDb.batch();
        const orgsRef = adminDb.collection('organizations');
        
        console.log(`Seeding ${initialOrganizations.length} organizations...`);
        initialOrganizations.forEach(org => {
            const docRef = orgsRef.doc(org.id);
            batch.set(docRef, org);
        });
        
        await batch.commit();
        console.log(`Firestore 'organizations' collection seeded successfully with ${initialOrganizations.length} organizations.`);
    } catch (error) {
        console.error('Error seeding organizations:', error);
        throw error;
    }
}

export async function getOrganizations(): Promise<{ organizations: Organization[], error: string | null }> {
  if (!adminDb) {
    return { organizations: [], error: handleFirestoreError(new Error("Firebase Admin SDK not initialized."), "get organizations") };
  }
  try {
    // Try with orderBy first, fallback to simple get if index is missing
    let orgSnapshot;
    try {
      orgSnapshot = await adminDb.collection('organizations').orderBy('name').get();
    } catch (orderByError: any) {
      // If orderBy fails (likely missing index), try without ordering
      console.warn('orderBy failed, fetching without ordering:', orderByError.message);
      orgSnapshot = await adminDb.collection('organizations').get();
    }
    
    if (orgSnapshot.empty) {
        console.log("Organizations collection is empty, seeding with initial data...");
        await seedOrganizations();
        // Try to fetch again after seeding
        try {
          const seededSnapshot = await adminDb.collection('organizations').orderBy('name').get();
          const orgList = seededSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          } as Organization));
          // Sort manually if orderBy worked
          orgList.sort((a, b) => a.name.localeCompare(b.name));
          console.log(`Seeded and fetched ${orgList.length} organizations`);
          return { organizations: orgList, error: null };
        } catch (seedFetchError: any) {
          // If orderBy fails after seeding, fetch without ordering
          console.warn('orderBy failed after seeding, fetching without ordering:', seedFetchError.message);
          const seededSnapshot = await adminDb.collection('organizations').get();
          const orgList = seededSnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          } as Organization));
          orgList.sort((a, b) => a.name.localeCompare(b.name));
          console.log(`Seeded and fetched ${orgList.length} organizations (without orderBy)`);
          return { organizations: orgList, error: null };
        }
    }

    const orgList = orgSnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    } as Organization));
    // Sort manually if orderBy didn't work
    orgList.sort((a, b) => a.name.localeCompare(b.name));
    console.log(`Fetched ${orgList.length} organizations`);
    return { organizations: orgList, error: null };
  } catch (error) {
    const errorMessage = handleFirestoreError(error, 'get organizations');
    console.error('Error in getOrganizations:', error);
    return { organizations: [], error: errorMessage };
  }
}

export async function getOrganizationById(id: string): Promise<Organization | undefined> {
  if (!adminDb) {
    handleFirestoreError(new Error("Firebase Admin SDK not initialized."), `get organization with ID ${id}`);
    return undefined;
  }
  try {
    const orgDocRef = adminDb.collection('organizations').doc(id);
    const orgSnap = await orgDocRef.get();
    
    if (orgSnap.exists) {
      return orgSnap.data() as Organization;
    } else {
      return undefined;
    }
  } catch (error) {
    handleFirestoreError(error, `get organization with ID '${id}'`);
    return undefined;
  }
}

export async function getPrograms(): Promise<{ programs: Program[], error?: string }> {
  if (!adminDb) {
    return { 
      programs: [], 
      error: handleFirestoreError(new Error("Firebase Admin SDK not initialized."), "get programs") 
    };
  }
  try {
    const programsRef = adminDb.collection('programs');
    const querySnapshot = await programsRef.orderBy('organizationName').orderBy('name').get();
    
    const programs: Program[] = [];
    querySnapshot.forEach((doc) => {
      programs.push({
        id: doc.id,
        ...doc.data()
      } as Program);
    });
    
    return { programs };
  } catch (error) {
    const errorMessage = handleFirestoreError(error, 'get programs');
    return { programs: [], error: errorMessage };
  }
}
