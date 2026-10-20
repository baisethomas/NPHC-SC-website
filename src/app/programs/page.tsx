import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getPrograms, getDivineNine } from "@/lib/data";
import { getDivineNineBrand, textOn } from "@/lib/divine-nine-brand";
import { PageHero } from "@/components/site/page-hero";
import { cn } from "@/lib/utils";

/** Maps program categories onto NPHC's five national focus areas. */
const FOCUS_AREA: Record<string, string> = {
  "Education": "Educational Advancement",
  "Youth Development": "Educational Advancement",
  "Leadership": "Leadership Development",
  "Civic Engagement": "Civic Engagement",
  "Community Service": "Community Service",
  "Community Development": "Community Service",
  "Health & Wellness": "Community Service",
  "Economic Development": "Leadership Development",
};

export default async function ProgramsPage() {
  const [organizations, { programs, error }] = await Promise.all([getDivineNine(), getPrograms()]);
  const active = programs.filter((p) => p.status === "active" || !p.status);

  const byOrg = new Map<string, typeof active>();
  for (const p of active) {
    const brand = getDivineNineBrand(p.organizationName);
    const key = brand?.key ?? p.organizationName;
    byOrg.set(key, [...(byOrg.get(key) ?? []), p]);
  }

  const orgsWithPrograms = organizations
    .map((org) => ({ org, brand: getDivineNineBrand(org.name), programs: byOrg.get(getDivineNineBrand(org.name)?.key ?? org.name) ?? [] }))
    .filter((o) => o.programs.length > 0);
  const orgsWithout = organizations.filter((org) => (byOrg.get(getDivineNineBrand(org.name)?.key ?? org.name) ?? []).length === 0);

  return (
    <div>
      <PageHero
        eyebrow="Programs and initiatives"
        title="The work the chapters do all year."
        lede="Each organization runs its own national programs locally. Together they cover NPHC's five focus areas: service, education, civic engagement, culture, and leadership."
      >
        <Button asChild className="bg-gold text-ink hover:bg-gold/90">
          <Link href="/get-involved">
            Volunteer with a program <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      {/* Jump list: one chip per organization with programs, in its own color */}
      {orgsWithPrograms.length > 1 && (
        <nav className="border-b border-border bg-card" aria-label="Jump to organization">
          <div className="container flex flex-wrap gap-2 py-4">
            {orgsWithPrograms.map(({ org, brand }) => (
              <a
                key={org.id}
                href={`#${brand?.key.replace(/\s+/g, "-") ?? org.id}`}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-transform hover:-translate-y-0.5",
                  brand && textOn(brand.colors[0]) === "ink" ? "text-ink" : "text-ivory"
                )}
                style={{ background: brand?.colors[0] ?? "hsl(var(--brand-ink))" }}
              >
                {brand?.letters ?? org.name}
              </a>
            ))}
          </div>
        </nav>
      )}

      <section className="py-12 md:py-16">
        <div className="container">
          {error ? (
            <Alert variant="destructive" className="mx-auto max-w-xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error loading programs</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : orgsWithPrograms.length === 0 ? (
            <div className="border-y border-border py-12">
              <p className="font-headline text-2xl font-bold">Program listings are being added.</p>
              <p className="mt-2 text-sm text-muted-foreground">Check back soon, or contact the council to learn about a chapter&apos;s programs.</p>
            </div>
          ) : (
            <div className="space-y-20">
              {orgsWithPrograms.map(({ org, brand, programs: orgPrograms }) => {
                const primary = brand?.colors[0] ?? "hsl(var(--brand-ink))";
                const onInk = !brand || textOn(brand.colors[0]) === "ivory";
                return (
                  <section key={org.id} id={brand?.key.replace(/\s+/g, "-")} className="scroll-mt-24 grid gap-8 lg:grid-cols-12 lg:gap-12">
                    {/* Organization panel in its own colors */}
                    <div className="lg:col-span-4">
                      <div
                        className={cn("flex items-center gap-5 overflow-hidden rounded-lg p-6 lg:sticky lg:top-24 lg:flex-col lg:items-start", onInk ? "text-ivory" : "text-ink")}
                        style={{ background: primary }}
                      >
                        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-ivory p-2 shadow-sm lg:h-24 lg:w-24">
                          <Image src={org.logo} alt={`${org.name} crest`} width={120} height={120} className="h-full w-full object-contain" />
                        </span>
                        <div className="min-w-0">
                          {brand && <p className="font-headline text-3xl font-bold leading-none">{brand.letters}</p>}
                          <h2 className="mt-1.5 font-headline text-xl font-bold leading-tight">{org.name}</h2>
                          <p className={cn("mt-2 text-sm", onInk ? "text-ivory/75" : "text-ink/70")}>
                            {orgPrograms.length} {orgPrograms.length === 1 ? "program" : "programs"} in Solano County
                          </p>
                        </div>
                        {brand && <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: brand.colors[1] }} aria-hidden />}
                      </div>
                    </div>

                    {/* Programs as editorial rows */}
                    <ol className="divide-y divide-border border-y border-border lg:col-span-8">
                      {orgPrograms.map((program, i) => (
                        <li key={program.id} className="grid gap-5 py-7 sm:grid-cols-[auto_1fr] sm:gap-7">
                          {program.image ? (
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-secondary sm:w-44 lg:w-52">
                              <Image src={program.image} alt={program.imageHint || program.name} fill className="object-cover" sizes="(min-width: 1024px) 208px, (min-width: 640px) 176px, 100vw" />
                            </div>
                          ) : (
                            <span className="font-headline text-3xl font-bold tabular-nums leading-none sm:w-12" style={{ color: primary }}>
                              {String(i + 1).padStart(2, "0")}
                            </span>
                          )}
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                              {FOCUS_AREA[program.category] ?? program.category}
                            </p>
                            <h3 className="mt-2 font-headline text-2xl font-bold leading-snug">{program.name}</h3>
                            <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">{program.description}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                );
              })}
            </div>
          )}

          {orgsWithout.length > 0 && orgsWithPrograms.length > 0 && (
            <p className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
              Program listings for {orgsWithout.map((o) => getDivineNineBrand(o.name)?.shortName ?? o.name).join(", ")} are coming soon.
            </p>
          )}
        </div>
      </section>

      <section className="bg-gold-soft py-14 md:py-20">
        <div className="container grid items-center gap-8 md:grid-cols-12">
          <div className="md:col-span-8">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">
              Have a program that needs hands, space, or a sponsor?
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-foreground/75 md:text-lg">
              The council connects chapters, schools, churches, and local businesses. Tell us what you are working on.
            </p>
          </div>
          <div className="md:col-span-4 md:justify-self-end">
            <Button asChild size="lg" className="bg-ink text-ivory hover:bg-ink/90">
              <Link href="/contact?subject=Partnership">
                Contact the council <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
