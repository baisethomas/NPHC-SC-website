import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Terminal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getBoardMembers } from "@/lib/data";
import { getSiteContent } from "@/lib/site-content";
import { getSiteSettings } from "@/lib/site-settings";
import { sanitizeHtml } from "@/lib/sanitizer";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { StatsBar, statsFromSettings } from "@/components/site/stats-bar";

const OBJECTIVES = [
  "Assist in establishing and facilitating local councils on campuses and within communities.",
  "Serve as the communication link between constituent fraternities and sororities.",
  "Conduct periodic workshops and training sessions for local council officers.",
  "Host a NPHC National Convention/Undergraduate Leadership Conference.",
  "Work cooperatively with and contribute to other community groups and national organizations.",
  "Provide unity and economic empowerment through and by member organizations.",
  "Perform coordinating functions as set forth within the NPHC Constitution and Bylaws.",
];

const OFFICER_ORDER = ["president", "vice president", "secretary", "treasurer"];

export default async function AboutPage() {
  const [content, settings, { boardMembers, error }] = await Promise.all([
    getSiteContent(["about.history", "about.history.image", "about.objectives.intro", "about.essay.tradition", "about.essay.commitment"]),
    getSiteSettings(),
    getBoardMembers(),
  ]);

  const sortedBoard = [...boardMembers].sort((a, b) => {
    const ia = OFFICER_ORDER.findIndex((t) => a.title.toLowerCase().includes(t));
    const ib = OFFICER_ORDER.findIndex((t) => b.title.toLowerCase().includes(t));
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  return (
    <div>
      <PageHero
        eyebrow="About the council"
        title="Nine legacies, working as one in Solano County."
        lede="The NPHC of Solano County coordinates the local chapters of the nine historically Black Greek-letter organizations: shared service, shared scholarship, and a shared voice."
      >
        <Button asChild className="bg-gold text-ink hover:bg-gold/90">
          <Link href="/organizations">
            Meet the chapters <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
          <Link href="/get-involved">Get involved</Link>
        </Button>
      </PageHero>

      <StatsBar stats={statsFromSettings(settings)} />

      {/* History */}
      <section className="py-16 md:py-24">
        <div className="container grid gap-12 md:grid-cols-12">
          <div className="md:col-span-7">
            <SectionHeading eyebrow="Our history" title="Rooted in 1930. Serving Solano today." className="mb-6" />
            <div
              className="space-y-5 text-lg leading-relaxed text-foreground/85 [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["about.history"]) }}
            />
          </div>
          <div className="md:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary md:sticky md:top-24">
              <Image src={content["about.history.image"]} alt="NPHC of Solano County members" fill className="object-cover" sizes="(min-width: 768px) 40vw, 100vw" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & objectives */}
      <section className="bg-ink py-16 text-ivory md:py-24">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading tone="inverse" eyebrow="Mission and objectives" title="What the council is for." className="mb-6" />
            <div
              className="space-y-4 text-lg leading-relaxed text-ivory/75 [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["about.objectives.intro"]) }}
            />
          </div>
          <div className="lg:col-span-7">
            <ol className="divide-y divide-ivory/10 border-y border-ivory/10">
              {OBJECTIVES.map((o) => (
                <li key={o} className="flex items-start gap-4 py-4">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-gold" />
                  <span className="leading-relaxed text-ivory/90">{o}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Essays */}
      <section className="border-b border-border py-16 md:py-24">
        <div className="container grid gap-12 md:grid-cols-2">
          <article>
            <p className="eyebrow mb-3">Why our tradition must continue</p>
            <div className="gold-rule mb-6" />
            <div
              className="space-y-4 leading-relaxed text-foreground/85 [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["about.essay.tradition"]) }}
            />
          </article>
          <article>
            <p className="eyebrow mb-3">A lifetime commitment</p>
            <div className="gold-rule mb-6" />
            <div
              className="space-y-4 leading-relaxed text-foreground/85 [&_p]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["about.essay.commitment"]) }}
            />
          </article>
        </div>
      </section>

      {/* Executive board */}
      <section className="py-16 md:py-24">
        <div className="container">
          <SectionHeading eyebrow="Executive board" title="The leaders guiding the council" lede="Each officer also represents their own chapter. Together they form the council's executive board." />
          {error ? (
            <Alert variant="destructive" className="mx-auto max-w-2xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error loading board members</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {sortedBoard.map((member) => {
                const brand = getDivineNineBrand(member.organization);
                return (
                  <li key={member.id} className="rounded-lg border border-border bg-card p-6">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={member.image} alt={member.name} className="object-cover" />
                      <AvatarFallback className="bg-ink font-headline text-xl text-gold">{member.initials}</AvatarFallback>
                    </Avatar>
                    <p className="mt-5 font-headline text-xl font-bold leading-tight">{member.name}</p>
                    <p className="mt-1 text-sm font-semibold text-gold">{member.title}</p>
                    {member.organization && (
                      <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: brand?.colors[0] ?? "hsl(var(--brand-gold))" }} aria-hidden />
                        {brand?.shortName ?? member.organization}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
