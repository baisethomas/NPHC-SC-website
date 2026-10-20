/**
 * Static brand facts for the nine NPHC member organizations.
 *
 * Keyed by a normalized organization name so it matches whatever spelling is
 * stored in Firestore ("Alpha Phi Alpha Fraternity, Inc." vs "Alpha Phi Alpha").
 * Colors are used only where they identify an organization (org cards, event
 * tags, directory badges). They are never part of the council's own palette.
 */
export interface DivineNineBrand {
  key: string;
  shortName: string;
  letters: string;
  founded: number;
  foundedAt: string;
  colors: [string, string];
  nationalUrl: string;
  kind: 'fraternity' | 'sorority';
}

export const DIVINE_NINE_BRANDS: DivineNineBrand[] = [
  {
    key: 'alpha phi alpha',
    shortName: 'Alpha Phi Alpha',
    letters: 'ΑΦΑ',
    founded: 1906,
    foundedAt: 'Cornell University',
    colors: ['#C8A84B', '#000000'],
    nationalUrl: 'https://apa1906.net/',
    kind: 'fraternity',
  },
  {
    key: 'alpha kappa alpha',
    shortName: 'Alpha Kappa Alpha',
    letters: 'ΑΚΑ',
    founded: 1908,
    foundedAt: 'Howard University',
    colors: ['#F0A0C8', '#2E8B57'],
    nationalUrl: 'https://aka1908.com/',
    kind: 'sorority',
  },
  {
    key: 'kappa alpha psi',
    shortName: 'Kappa Alpha Psi',
    letters: 'ΚΑΨ',
    founded: 1911,
    foundedAt: 'Indiana University',
    colors: ['#8B1A2B', '#F2F0EB'],
    nationalUrl: 'https://kappaalphapsi1911.com/',
    kind: 'fraternity',
  },
  {
    key: 'omega psi phi',
    shortName: 'Omega Psi Phi',
    letters: 'ΩΨΦ',
    founded: 1911,
    foundedAt: 'Howard University',
    colors: ['#5B2C8E', '#D4A017'],
    nationalUrl: 'https://www.oppf.org/',
    kind: 'fraternity',
  },
  {
    key: 'delta sigma theta',
    shortName: 'Delta Sigma Theta',
    letters: 'ΔΣΘ',
    founded: 1913,
    foundedAt: 'Howard University',
    colors: ['#C8102E', '#F2F0EB'],
    nationalUrl: 'https://www.deltasigmatheta.org/',
    kind: 'sorority',
  },
  {
    key: 'phi beta sigma',
    shortName: 'Phi Beta Sigma',
    letters: 'ΦΒΣ',
    founded: 1914,
    foundedAt: 'Howard University',
    colors: ['#1F4FB2', '#F2F0EB'],
    nationalUrl: 'https://phibetasigma1914.org/',
    kind: 'fraternity',
  },
  {
    key: 'zeta phi beta',
    shortName: 'Zeta Phi Beta',
    letters: 'ΖΦΒ',
    founded: 1920,
    foundedAt: 'Howard University',
    colors: ['#1E4FB1', '#F2F0EB'],
    nationalUrl: 'https://zphib1920.org/',
    kind: 'sorority',
  },
  {
    key: 'sigma gamma rho',
    shortName: 'Sigma Gamma Rho',
    letters: 'ΣΓΡ',
    founded: 1922,
    foundedAt: 'Butler University',
    colors: ['#1F4FB2', '#D4A017'],
    nationalUrl: 'https://www.sgrho1922.org/',
    kind: 'sorority',
  },
  {
    key: 'iota phi theta',
    shortName: 'Iota Phi Theta',
    letters: 'ΙΦΘ',
    founded: 1963,
    foundedAt: 'Morgan State University',
    colors: ['#8B4513', '#C8A84B'],
    nationalUrl: 'https://iotaphitheta.org/',
    kind: 'fraternity',
  },
];

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/sorority|fraternity|,|inc\.?|incorporated/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Finds brand facts for an organization by any common spelling of its name. */
export function getDivineNineBrand(name: string | undefined | null): DivineNineBrand | undefined {
  if (!name) return undefined;
  const key = normalize(name);
  return DIVINE_NINE_BRANDS.find((b) => key.startsWith(b.key) || key.includes(b.key));
}

/** The short names, in founding order, for filter chips and select options. */
export const DIVINE_NINE_SHORT_NAMES = DIVINE_NINE_BRANDS.map((b) => b.shortName);

function channel(hex: string, offset: number): number {
  const v = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

/** WCAG relative luminance of a `#rrggbb` color, 0 (black) to 1 (white). */
export function relativeLuminance(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length !== 6) return 0;
  return 0.2126 * channel(h, 0) + 0.7152 * channel(h, 2) + 0.0722 * channel(h, 4);
}

/**
 * Which of the council's two text colors reads on a solid organization color.
 * Pink and gold grounds take ink; crimson, royal blue, purple, and brown take ivory.
 */
export function textOn(hex: string): 'ink' | 'ivory' {
  return relativeLuminance(hex) > 0.3 ? 'ink' : 'ivory';
}
