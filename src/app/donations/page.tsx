import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/page-hero";

const USES = [
  { title: "Scholarships", text: "Awards for Solano County seniors heading to college, and support for Divine Nine undergraduates." },
  { title: "Youth programs", text: "Mentoring, leadership workshops, and college readiness run by the chapters." },
  { title: "Community outreach", text: "Food drives, health fairs, voter registration, and the events that bring the county together." },
];

const OTHER_WAYS = [
  { title: "Sponsor an event", text: "Put your business behind a scholarship gala, picnic, or health fair.", href: "/contact?subject=Sponsorship", label: "Ask us" },
  { title: "Volunteer your time", text: "Chapters always need hands at events and mentors for students.", href: "/get-involved", label: "Get involved" },
  { title: "Spread the word", text: "Follow the council and share our events with your network.", href: "/mailing-list", label: "Join the list" },
];

export default async function DonationsPage() {
  const { donationUrl, contactEmail } = await getSiteSettings();
  const giveHref = donationUrl || `mailto:${contactEmail}?subject=Donation`;
  const giveLabel = donationUrl ? "Donate online" : "Ask how to give";

  return (
    <div>
      <PageHero
        eyebrow="Support the council"
        title="Every gift stays in Solano County."
        lede="Your donation funds scholarships, youth programs, and the community events the nine chapters put on together."
      >
        <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
          {donationUrl ? (
            <a href={giveHref} target="_blank" rel="noopener noreferrer">
              {giveLabel} <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : (
            <a href={giveHref}>{giveLabel}</a>
          )}
        </Button>
        <Button asChild size="lg" variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
          <Link href="/contact?subject=Sponsorship">Sponsor an event</Link>
        </Button>
      </PageHero>

      {/* Where it goes */}
      <section className="py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">Three things your gift pays for.</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              The council is run by volunteers from the nine chapters. Gifts go to programs, not overhead.
            </p>
          </div>
          <ol className="divide-y divide-border border-y border-border lg:col-span-7">
            {USES.map((u, i) => (
              <li key={u.title} className="grid grid-cols-[3rem_1fr] gap-4 py-6 md:grid-cols-[4rem_1fr]">
                <span className="font-headline text-2xl font-bold tabular-nums text-gold md:text-3xl">0{i + 1}</span>
                <div>
                  <h3 className="font-headline text-xl font-bold leading-snug md:text-2xl">{u.title}</h3>
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground md:text-base">{u.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Give */}
      <section className="bg-ink py-16 text-ivory md:py-24">
        <div className="container grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">
              {donationUrl ? "Give securely online." : "Online giving is coming."}
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-ivory/70">
              {donationUrl
                ? "Donations are processed by our hosted giving partner. You will receive a receipt by email."
                : "We are setting up online giving. In the meantime, email the council and we will arrange a gift by check or transfer."}
            </p>
            <p className="mt-6 max-w-xl text-xs leading-relaxed text-ivory/50">
              NPHC of Solano County is a nonprofit organization. Gifts may be tax-deductible to the extent allowed by law; please consult your tax advisor. A receipt is provided for every gift.
            </p>
          </div>
          <div className="md:col-span-5 md:flex md:justify-end">
            <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
              {donationUrl ? (
                <a href={giveHref} target="_blank" rel="noopener noreferrer">
                  Donate now <ArrowUpRight className="h-4 w-4" />
                </a>
              ) : (
                <a href={giveHref}>Email about giving</a>
              )}
            </Button>
          </div>
        </div>
      </section>

      {/* Other ways */}
      <section className="py-16 md:py-24">
        <div className="container grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <h2 className="font-headline text-2xl font-bold leading-tight md:text-3xl">Other ways to help</h2>
            <Button asChild variant="link" className="mt-3 h-auto p-0 font-semibold">
              <Link href="/scholarships">
                See our scholarships <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ul className="divide-y divide-border border-y border-border lg:col-span-8">
            {OTHER_WAYS.map((w) => (
              <li key={w.title} className="flex items-start justify-between gap-6 py-5">
                <div>
                  <p className="font-headline text-lg font-bold">{w.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.text}</p>
                </div>
                <Link href={w.href} className="shrink-0 whitespace-nowrap text-sm font-semibold hover:underline underline-offset-4">
                  {w.label} <ArrowRight className="inline h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
