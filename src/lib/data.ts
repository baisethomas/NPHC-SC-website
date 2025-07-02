export interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  image_hint: string;
  rsvpLink: string;
}

let events: Event[] = [
    {
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

type NewEvent = Omit<Event, 'image' | 'image_hint' | 'rsvpLink'>;

export function getEvents() {
  return events;
}

export function addEvent(event: NewEvent) {
  const newEvent: Event = {
    ...event,
    image: "https://placehold.co/600x400.png",
    image_hint: "new event",
    rsvpLink: "#",
  };
  events = [newEvent, ...events];
}

export interface Announcement {
  title: string;
  date: string;
  description: string;
}

let announcements: Announcement[] = [
  {
    title: "Annual Scholarship Gala",
    date: "August 15, 2024",
    description: "Join us for our biggest fundraising event of the year. All proceeds go to our student scholarship fund."
  },
  {
    title: "New Member Intake",
    date: "July 30, 2024",
    description: "Several of our member organizations will be starting their new member intake process soon. Stay tuned for details."
  },
  {
    title: "Community Service Day",
    date: "July 20, 2024",
    description: "We're partnering with local charities for a county-wide day of service. Sign up to volunteer!"
  }
];

export function getAnnouncements() {
  return announcements;
}

export function addAnnouncement(announcement: Announcement) {
  announcements = [announcement, ...announcements];
}

export interface BoardMember {
  name: string;
  title: string;
  initials: string;
  image: string;
  hint: string;
}

let boardMembers: BoardMember[] = [
  { name: "Eleanor Vance", title: "President", initials: "EV", image: "https://placehold.co/100x100.png", hint: "headshot person" },
  { name: "Marcus Thorne", title: "Vice President", initials: "MT", image: "https://placehold.co/100x100.png", hint: "professional headshot" },
  { name: "Seraphina Cruz", title: "Secretary", initials: "SC", image: "https://placehold.co/100x100.png", hint: "person smiling" },
  { name: "Julian Hayes", title: "Treasurer", initials: "JH", image: "https://placehold.co/100x100.png", hint: "corporate headshot" },
  { name: "Isabella Chen", title: "Parliamentarian", initials: "IC", image: "https://placehold.co/100x100.png", hint: "professional person" },
  { name: "David Rodriguez", title: "Director of Community Service", initials: "DR", image: "https://placehold.co/100x100.png", hint: "person outdoors" },
];

type NewBoardMember = Omit<BoardMember, 'image' | 'hint' | 'initials'>;

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
    initials,
    image: "https://placehold.co/100x100.png",
    hint: "person headshot",
  };
  boardMembers = [newMember, ...boardMembers];
}

export interface Organization {
  name: string;
  logo: string;
  hint: string;
  description: string;
  chapter: string;
  link: string;
}

let organizations: Organization[] = [
  {
    name: "Alpha Kappa Alpha Sorority, Inc.",
    logo: "https://aka1908.com/wp-content/uploads/2022/06/bg_logo_aka.svg",
    hint: "organization crest",
    description: "The first intercollegiate historically African American Greek-lettered sorority.",
    chapter: "Mu Eta Omega Chapter",
    link: "#",
  },
  {
    name: "Alpha Phi Alpha Fraternity, Inc.",
    logo: "https://apa1906.net/wp-content/uploads/2018/08/apa_crest_132_c.png",
    hint: "organization crest",
    description: "The first intercollegiate Greek-letter fraternity established for African American Men.",
    chapter: "Zeta Beta Lambda Chapter",
    link: "#",
  },
  {
    name: "Delta Sigma Theta Sorority, Inc.",
    logo: "https://www.deltasigmatheta.org/wp-content/uploads/2023/01/Crest_Logo_rszd.png",
    hint: "organization crest",
    description: "An organization of college educated women committed to the constructive development of its members and to public service.",
    chapter: "Fairfield-Suisun Valley Alumnae Chapter",
    link: "#",
  },
  {
    name: "Zeta Phi Beta Sorority, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/en/c/cd/ZetaPBetaShield.png",
    hint: "organization crest",
    description: "A community-conscious, action-oriented organization founded on the principles of Scholarship, Service, Sisterhood and Finer Womanhood.",
    chapter: "Tau Alpha Zeta Chapter",
    link: "#",
  },
  {
    name: "Iota Phi Theta Fraternity, Inc.",
    logo: "https://iotaphitheta.org/wp-content/uploads/2022/09/ip-1.png",
    hint: "organization crest",
    description: "Committed to the development and perpetuation of Scholarship, Leadership, Citizenship, Fidelity, and Brotherhood among Men.",
    chapter: "Alpha Pi Omega Chapter",
    link: "#",
  },
  {
    name: "Kappa Alpha Psi Fraternity, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/en/1/1d/KAPsiCrest.png",
    hint: "organization crest",
    description: "A collegiate Greek-letter fraternity with a predominantly African-American membership, focused on achievement in every field of human endeavor.",
    chapter: "Fairfield-Vacaville Alumni Chapter",
    link: "#",
  },
  {
    name: "Sigma Gamma Rho Sorority, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Sigma_Gamma_Rho_Shield.png",
    hint: "organization crest",
    description: "A leading historically Black Greek-letter sorority that aims to enhance the quality of life for women and their families in the U.S. and globally.",
    chapter: "Lambda Rho Sigma Chapter",
    link: "#",
  },
  {
    name: "Phi Beta Sigma Fraternity, Inc.",
    logo: "https://upload.wikimedia.org/wikipedia/en/a/a9/PhiBetaSigmaShield.png",
    hint: "organization crest",
    description: "An international organization of college and professional men, founded on the principles of Brotherhood, Scholarship and Service.",
    chapter: "Kappa Iota Sigma Chapter",
    link: "#",
  },
    {
    name: "Omega Psi Phi Fraternity, Inc.",
    logo: "https://www.pngall.com/wp-content/uploads/17/Omega-Psi-Phi-Shield-Artistic-Representation-PNG-thumb.png",
    hint: "organization crest",
    description: "The first international fraternal organization founded on the campus of a historically black college, based on Friendship, Manhood, Scholarship, and Perseverance.",
    chapter: "Nu Phi Chapter",
    link: "#",
  },
];

type NewOrganization = Omit<Organization, 'logo' | 'hint'>;

export function getOrganizations() {
  return organizations;
}

export function addOrganization(org: NewOrganization) {
  const newOrg: Organization = {
    ...org,
    logo: "https://placehold.co/200x200.png",
    hint: "organization crest",
  };
  organizations = [newOrg, ...organizations];
}
