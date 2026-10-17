import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getPrograms, getDivineNine } from "@/lib/data";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";

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

      <section className="py-16 md:py-24">
        <div className="container">
          {error ? (
            <Alert variant="destructive" className="mx-auto max-w-xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error loading programs</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : orgsWithPrograms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <p className="font-semibold">Program listings are being added.</p>
              <p className="mt-1 text-sm text-muted-foreground">Check back soon, or contact the council to learn about a chapter&apos;s programs.</p>
            </div>
          ) : (
            <div className="space-y-16">
              {orgsWithPrograms.map(({ org, brand, programs: orgPrograms }) => (
                <section key={org.id} id={brand?.key.replace(/\s+/g, "-")}>
                  <div className="mb-6 flex items-center gap-4 border-b border-border pb-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-secondary p-1.5">
                      <Image src={org.logo} alt={`${org.name} crest`} width={100} height={100} className="h-full w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-headline text-2xl font-bold leading-tight">{org.name}</h2>
                      <p className="mt-0.5 inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="h-2 w-2 rounded-full" style={{ background: brand?.colors[0] ?? "hsl(var(--brand-gold))" }} aria-hidden />
                        {orgPrograms.length} {orgPrograms.length === 1 ? "program" : "programs"}
                      </p>
                    </div>
                  </div>
                  <ul className="grid gap-6 md:grid-cols-2">
                    {orgPrograms.map((program) => (
                      <li key={program.id} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
                        {program.image && (
                          <div className="relative aspect-[16/9] bg-secondary">
                            <Image src={program.image} alt={program.imageHint || program.name} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <p className="eyebrow">{FOCUS_AREA[program.category] ?? program.category}</p>
                          <h3 className="mt-2 font-headline text-xl font-bold leading-snug">{program.name}</h3>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{program.description}</p>
                          {program.category && FOCUS_AREA[program.category] !== program.category && (
                            <p className="mt-4 text-xs text-muted-foreground">Category: {program.category}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          {orgsWithout.length > 0 && orgsWithPrograms.length > 0 && (
            <p className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
              Program listings for {orgsWithout.map((o) => getDivineNineBrand(o.name)?.shortName ?? o.name).join(", ")} are coming soon.
            </p>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-card py-14 md:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Partner with us"
            title="Have a program that needs hands, space, or a sponsor?"
            lede="The council connects chapters, schools, churches, and local businesses. Tell us what you are working on."
            action={
              <Button asChild variant="outline">
                <Link href="/contact?subject=Partnership">
                  Contact the council <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
            className="mb-0"
          />
        </div>
      </section>
    </div>
  );
}
