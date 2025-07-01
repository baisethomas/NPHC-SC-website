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
