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

export interface Announcement {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl?: string;
}

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  initials: string;
  image: string;
  hint: string;
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

export interface DivineNineOrganization {
  name: string;
  logo: string;
  hint: string;
}

export const slugify = (text: string): string => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');


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
