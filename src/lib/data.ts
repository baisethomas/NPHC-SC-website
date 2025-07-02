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

let events: Event[] = [
    {
    id: "annual-scholarship-gala",
    slug: "annual-scholarship-gala",
    title: "Annual Scholarship Gala",
    date: "October 26, 2024",
    time: "6:00 PM - 10:00 PM",
    location: "The Wednesday Club of Suisun",
    description: "Join us for an elegant evening of dining and celebration as we award scholarships to deserving local students. Formal attire requested.",
    image: "https://placehold.co/600x400.png",
    image_hint: "gala event",
    rsvpLink: "#"
  },
  {
    id: "meet-the-greeks-community-day",
    slug: "meet-the-greeks-community-day",
    title: "Meet the Greeks Community Day",
    date: "September 5, 2024",
    time: "12:00 PM - 4:00 PM",
    location: "Solano Community College Quad",
    description: "A fun-filled day for the community to meet members of the Divine Nine, enjoy music, food, and learn about what we do.",
    image: "https://placehold.co/600x400.png",
    image_hint: "community fair",
    rsvpLink: "#"
  },
  {
    id: "annual-summer-cookout",
    slug: "annual-summer-cookout",
    title: "Annual Summer Cookout",
    date: "August 10, 2024",
    time: "12:00 PM - 5:00 PM",
    location: "Fairfield Community Park",
    description: "Bring your family and friends for our annual summer cookout. Food, games, and fellowship for all ages.",
    image: "https://placehold.co/600x400.png",
    image_hint: "family picnic",
    rsvpLink: "#"
  },
  {
    id: "financial-literacy-workshop",
    slug: "financial-literacy-workshop",
    title: "Financial Literacy Workshop",
    date: "November 12, 2024",
    time: "7:00 PM - 8:30 PM",
    location: "Virtual Event (Zoom)",
    description: "A free virtual workshop open to the public, covering topics like budgeting, investing, and building credit.",
    image: "https://placehold.co/600x400.png",
    image_hint: "finance workshop",
    rsvpLink: "#"
  },
];

type NewEvent = Omit<Event, 'id' | 'slug' | 'image' | 'image_hint' | 'rsvpLink'>;

export function getEvents() {
  return events;
}

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}

export function addEvent(event: NewEvent) {
  const slug = slugify(event.title);
  const newEvent: Event = {
    ...event,
    id: slug,
    slug: slug,
    image: "https://placehold.co/600x400.png",
    image_hint: "new event",
    rsvpLink: "#",
  };
  events = [newEvent, ...events];
}

export function deleteEvent(id: string) {
  events = events.filter((event) => event.id !== id);
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
}

let announcements: Announcement[] = [
  {
    id: 'annual-scholarship-gala',
    title: "Annual Scholarship Gala",
    date: "August 15, 2024",
    description: "Join us for our biggest fundraising event of the year. All proceeds go to our student scholarship fund."
  },
  {
    id: 'new-member-intake',
    title: "New Member Intake",
    date: "July 30, 2024",
    description: "Several of our member organizations will be starting their new member intake process soon. Stay tuned for details."
  },
  {
    id: 'community-service-day',
    title: "Community Service Day",
    date: "July 20, 2024",
    description: "We're partnering with local charities for a county-wide day of service. Sign up to volunteer!"
  }
];

export function getAnnouncements() {
  return announcements;
}

export function addAnnouncement(announcement: Omit<Announcement, 'id'>) {
  const newAnnouncement: Announcement = {
    id: slugify(announcement.title),
    ...announcement,
  };
  announcements = [newAnnouncement, ...announcements];
}

export function deleteAnnouncement(id: string) {
  announcements = announcements.filter((ann) => ann.id !== id);
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
