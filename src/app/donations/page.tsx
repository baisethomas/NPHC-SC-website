import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, HandHeart, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/lib/site-settings";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";

const USES = [
  { icon: GraduationCap, title: "Scholarships", text: "Awards for Solano County seniors heading to college, and support for Divine Nine undergraduates." },
  { icon: Users, title: "Youth programs", text: "Mentoring, leadership workshops, and college readiness run by the chapters." },
  { icon: HandHeart, title: "Community outreach", text: "Food drives, health fairs, voter registration, and the events that bring the county together." },
];

export default async function DonationsPage() {
  const { donationUrl, contactEmail } = await getSiteSettings();

  return (
    <div>
      <PageHero
        eyebrow="Support the council"
        title="Give to the work in Solano County."
        lede="Every gift stays local. It funds scholarships, youth programs, and the community events the nine chapters put on together."
      >
        {donationUrl ? (
          <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
            <a href={donationUrl} target="_blank" rel="noopener noreferrer">
              <Heart className="h-4 w-4" /> Donate online <ArrowUpRight className="h-4 w-4" />
            </a>
          </Button>
        ) : (
          <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
            <a href={`mailto:${contactEmail}?subject=Donation`}>
              <Heart className="h-4 w-4" /> Ask how to give
            </a>
          </Button>
        )}
        <Button asChild size="lg" variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
          <Link href="/contact?subject=Sponsorship">Sponsor an event</Link>
        </Button>
      </PageHero>

      <section className="py-16 md:py-24">
        <div className="container">
          <SectionHeading eyebrow="Where it goes" title="Three things your gift pays for" />
          <ul className="grid gap-6 md:grid-cols-3">
            {USES.map((u) => {
              const Icon = u.icon;
              return (
                <li key={u.title} className="rounded-lg border border-border bg-card p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-headline text-xl font-bold">{u.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{u.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="border-t border-border bg-card py-16 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow="Give" title={donationUrl ? "Donate securely online" : "Online giving is coming"} className="mb-4" />
            <p className="text-muted-foreground">
              {donationUrl
                ? "Donations are processed by our hosted giving partner. You will receive a receipt by email."
                : "We are setting up online giving. In the meantime, email the council and we will arrange a gift by check or transfer."}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {donationUrl ? (
                <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
                  <a href={donationUrl} target="_blank" rel="noopener noreferrer">
                    <Heart className="h-4 w-4" /> Donate now <ArrowUpRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
                  <a href={`mailto:${contactEmail}?subject=Donation`}>
                    <Heart className="h-4 w-4" /> Email about giving
                  </a>
                </Button>
              )}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              NPHC of Solano County is a nonprofit organization. Gifts may be tax-deductible to the extent allowed by law; please consult your tax advisor. A receipt is provided for every gift.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <p className="eyebrow mb-4">Other ways to help</p>
            <ul className="divide-y divide-border border-y border-border">
              <li className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">Sponsor an event</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Put your business behind a scholarship gala, picnic, or health fair.</p>
                </div>
                <Link href="/contact?subject=Sponsorship" className="shrink-0 text-sm font-semibold text-gold hover:underline underline-offset-4">
                  Ask us
                </Link>
              </li>
              <li className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">Volunteer your time</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Chapters always need hands at events and mentors for students.</p>
                </div>
                <Link href="/get-involved" className="shrink-0 text-sm font-semibold text-gold hover:underline underline-offset-4">
                  Get involved
                </Link>
              </li>
              <li className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-semibold">Spread the word</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">Follow the council and share our events with your network.</p>
                </div>
                <Link href="/mailing-list" className="shrink-0 text-sm font-semibold text-gold hover:underline underline-offset-4">
                  Join the list
                </Link>
              </li>
            </ul>
            <Button asChild variant="link" className="mt-4 h-auto p-0 font-semibold">
              <Link href="/scholarships">
                See our scholarships <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
