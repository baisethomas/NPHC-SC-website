import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteContent } from "@/lib/site-content";
import { getSiteSettings } from "@/lib/site-settings";
import { sanitizeHtml } from "@/lib/sanitizer";
import { DIVINE_NINE_BRANDS, textOn } from "@/lib/divine-nine-brand";
import { PageHero } from "@/components/site/page-hero";

const NATIONAL = [
  {
    name: "NPHC and Western Governors University partnership",
    text: "Scholarships of up to $5,000 for financial members of a Divine Nine organization pursuing a WGU degree.",
    href: "https://www.wgu.edu/financial-aid-tuition/scholarships/partner/divine-9.html",
  },
];

const HOW_TO_APPLY = [
  { title: "Check eligibility", text: "Graduating seniors who live in or attend school in Solano County and plan to enroll in a college, university, or accredited trade program." },
  { title: "Watch for the opening", text: "Applications typically open in February. The form and deadline are posted here and sent to the mailing list." },
  { title: "Submit before the April deadline", text: "Transcript, a short essay, and a recommendation are the usual materials. Incomplete applications are not reviewed." },
  { title: "Join us at the awards program", text: "Recipients are recognized at the council's annual scholarship program each spring." },
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

      {/* Key facts strip */}
      <div className="border-b border-border bg-card">
        <dl className="container grid grid-cols-2 gap-px md:flex md:divide-x md:divide-border">
          <div className="min-w-0 px-2 py-5 md:flex-1 md:px-6 md:py-7">
            <dd className="font-headline text-3xl font-bold leading-none md:text-4xl">Spring</dd>
            <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Applications open</dt>
          </div>
          <div className="min-w-0 px-2 py-5 md:flex-1 md:px-6 md:py-7">
            <dd className="font-headline text-3xl font-bold leading-none md:text-4xl">April</dd>
            <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Typical deadline</dt>
          </div>
          {settings.statScholarships && (
            <div className="min-w-0 px-2 py-5 md:flex-1 md:px-6 md:py-7">
              <dd className="font-headline text-3xl font-bold leading-none md:text-4xl">{settings.statScholarships}</dd>
              <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Awarded to date</dt>
            </div>
          )}
          <div className="min-w-0 px-2 py-5 md:flex-1 md:px-6 md:py-7">
            <dd className="font-headline text-3xl font-bold leading-none md:text-4xl">Seniors</dd>
            <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Solano County high schools</dt>
          </div>
        </dl>
      </div>

      {/* Council scholarship */}
      <section className="py-16 md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">The council scholarship</h2>
            <div
              className="prose prose-lg mt-6 max-w-none text-foreground/85"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["scholarships.intro"]) }}
            />
            <p className="mt-8 text-sm text-muted-foreground">
              Questions about eligibility or materials?{" "}
              <Link href="/contact?subject=Scholarship%20question" className="font-semibold text-foreground hover:underline underline-offset-4">
                Contact the scholarship committee
              </Link>
              .
            </p>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="eyebrow mb-2">How to apply</p>
            <ol className="divide-y divide-border border-y border-border">
              {HOW_TO_APPLY.map((s, i) => (
                <li key={s.title} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                  <span className="font-headline text-2xl font-bold tabular-nums text-gold">0{i + 1}</span>
                  <div>
                    <h3 className="font-headline text-lg font-bold leading-snug">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Chapter and national scholarships */}
      <section className="bg-ink py-16 text-ivory md:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">Each organization funds its own awards.</h2>
            <p className="mt-4 leading-relaxed text-ivory/70">
              Most chapters run a scholarship program and every national organization has a foundation. Start with the national site, then ask the local chapter about Solano-specific awards.
            </p>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {DIVINE_NINE_BRANDS.map((b) => {
              const ink = textOn(b.colors[0]) === "ink";
              return (
                <li key={b.key}>
                  <a
                    href={b.nationalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center justify-between gap-3 rounded-md px-4 py-4 transition-transform hover:-translate-y-0.5 ${ink ? "text-ink" : "text-ivory"}`}
                    style={{ background: b.colors[0] }}
                  >
                    <span>
                      <span className="block font-greek text-xl leading-none">{b.letters}</span>
                      <span className="mt-1.5 block text-sm font-semibold">{b.shortName}</span>
                    </span>
                    <ArrowUpRight className={`h-4 w-4 ${ink ? "text-ink/70" : "text-ivory/80"}`} />
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-14 max-w-3xl">
            <p className="eyebrow mb-3">For Divine Nine members</p>
            <ul className="divide-y divide-ivory/10 border-y border-ivory/10">
              {NATIONAL.map((n) => (
                <li key={n.href} className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-headline text-lg font-bold">{n.name}</p>
                    <p className="mt-1 text-sm text-ivory/65">{n.text}</p>
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
