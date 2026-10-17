import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteContent } from "@/lib/site-content";
import { getSiteSettings } from "@/lib/site-settings";
import { sanitizeHtml } from "@/lib/sanitizer";
import { DIVINE_NINE_BRANDS } from "@/lib/divine-nine-brand";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";

const NATIONAL = [
  {
    name: "NPHC and Western Governors University partnership",
    text: "Scholarships of up to $5,000 for financial members of a Divine Nine organization pursuing a WGU degree.",
    href: "https://www.wgu.edu/financial-aid-tuition/scholarships/partner/divine-9.html",
  },
];

export default async function ScholarshipsPage() {
  const [content, settings] = await Promise.all([getSiteContent(["scholarships.intro"]), getSiteSettings()]);

  return (
    <div>
      <PageHero
        eyebrow="Scholarships"
        title="Investing in Solano County students."
        lede="Scholarships from the council, from each of the nine chapters, and from the national organizations. Deadlines are announced here and on the mailing list."
      >
        <Button asChild className="bg-gold text-ink hover:bg-gold/90">
          <Link href="/mailing-list">
            Get deadline reminders <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section className="py-16 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading eyebrow="Council scholarship" title="NPHC of Solano County scholarship" className="mb-6" />
            <div
              className="prose prose-lg max-w-none text-foreground/85"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["scholarships.intro"]) }}
            />
            {settings.statScholarships && (
              <p className="mt-8 border-l-4 border-gold pl-4 font-headline text-2xl font-bold">
                {settings.statScholarships} <span className="text-base font-normal text-muted-foreground">awarded to local students to date</span>
              </p>
            )}
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="rounded-lg border border-border bg-card p-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-ink text-gold">
                <GraduationCap className="h-5 w-5" />
              </span>
              <p className="mt-5 font-headline text-lg font-bold">Questions about applying?</p>
              <p className="mt-1 text-sm text-muted-foreground">The scholarship committee can help with eligibility and materials.</p>
              <Button asChild variant="outline" size="sm" className="mt-5">
                <Link href="/contact?subject=Scholarship%20question">Contact the committee</Link>
              </Button>
            </div>
          </aside>
        </div>
      </section>

      <section className="border-t border-border bg-card py-16 md:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="Chapter and national scholarships"
            title="Each organization funds its own awards"
            lede="Most chapters run a scholarship program and every national organization has a foundation. Start with the national site, then ask the local chapter about Solano-specific awards."
          />
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DIVINE_NINE_BRANDS.map((b) => (
              <li key={b.key}>
                <a
                  href={b.nationalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-4 py-3 transition-colors hover:border-gold"
                >
                  <span className="flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: b.colors[0] }} aria-hidden />
                    <span className="font-semibold">{b.shortName}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12">
            <p className="eyebrow mb-4">For Divine Nine members</p>
            <ul className="divide-y divide-border border-y border-border">
              {NATIONAL.map((n) => (
                <li key={n.href} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold">{n.name}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.text}</p>
                  </div>
                  <a href={n.href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-gold hover:underline underline-offset-4">
                    Details <ArrowUpRight className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
