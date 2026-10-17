import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings";

const EXPLORE = [
  { href: "/about", label: "About the council" },
  { href: "/organizations", label: "Our chapters" },
  { href: "/programs", label: "Programs" },
  { href: "/events", label: "Events" },
  { href: "/news", label: "News" },
  { href: "/gallery", label: "Gallery" },
];

const INVOLVED = [
  { href: "/get-involved", label: "Get involved" },
  { href: "/scholarships", label: "Scholarships" },
  { href: "/donations", label: "Donate" },
  { href: "/mailing-list", label: "Join the mailing list" },
  { href: "/login", label: "Member login" },
];

export async function Footer() {
  const currentYear = new Date().getFullYear();
  const settings = await getSiteSettings();

  const socialLinks = [
    { label: "Facebook", href: settings.facebookUrl, Icon: Facebook },
    { label: "Instagram", href: settings.instagramUrl, Icon: Instagram },
    { label: "Twitter", href: settings.twitterUrl, Icon: Twitter },
  ].filter((link) => link.href !== "");

  const footerText = settings.footerText || "NPHC of Solano County. All rights reserved.";

  return (
    <footer className="bg-ink text-ivory">
      <div className="h-1 w-full bg-gold" />
      <div className="container grid gap-12 py-14 md:grid-cols-12 md:py-16">
        <div className="md:col-span-5">
          <p className="font-headline text-2xl font-bold">NPHC of Solano County</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
            Nine legacies · One council{settings.yearChartered ? ` · Chartered ${settings.yearChartered}` : ""}
          </p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory/70">
            The local council of the nine historically Black Greek-letter organizations serving Solano County through
            scholarship, service, and civic engagement.
          </p>
          {settings.meetingCadence && (
            <p className="mt-4 text-sm text-ivory/70">{settings.meetingCadence}</p>
          )}
          {socialLinks.length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-ivory/80 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="space-y-2.5 text-sm">
            {EXPLORE.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ivory/80 transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <p className="eyebrow mb-4">Get involved</p>
          <ul className="space-y-2.5 text-sm">
            {INVOLVED.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-ivory/80 transition-colors hover:text-gold">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="eyebrow mb-4">Contact</p>
          <ul className="space-y-3 text-sm text-ivory/80">
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <a href={`mailto:${settings.contactEmail}`} className="break-all hover:text-gold">
                {settings.contactEmail}
              </a>
            </li>
            {settings.contactPhone && (
              <li className="flex items-start gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`} className="hover:text-gold">
                  {settings.contactPhone}
                </a>
              </li>
            )}
            {settings.mailingAddress && (
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="whitespace-pre-line">{settings.mailingAddress}</span>
              </li>
            )}
          </ul>
          <Link href="/contact" className="mt-5 inline-block text-sm font-semibold text-gold underline-offset-4 hover:underline">
            Send us a message
          </Link>
        </div>
      </div>

      <div className="border-t border-ivory/10">
        <div className="container flex flex-col gap-3 py-5 text-xs text-ivory/55 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {currentYear} {footerText}
          </p>
          <p>
            A member council of the{" "}
            <a href="https://www.nphchq.com/" target="_blank" rel="noopener noreferrer" className="text-ivory/80 hover:text-gold">
              National Pan-Hellenic Council
            </a>
            , founded 1930.
          </p>
        </div>
      </div>
    </footer>
  );
}
