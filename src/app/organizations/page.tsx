import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getOrganizations } from "@/lib/data";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { OrganizationCard } from "@/components/site/organization-card";

export default async function OrganizationsPage() {
  const { organizations, error } = await getOrganizations();

  const sorted = [...organizations].sort((a, b) => {
    const fa = getDivineNineBrand(a.name)?.founded ?? 9999;
    const fb = getDivineNineBrand(b.name)?.founded ?? 9999;
    return fa - fb;
  });

  return (
    <div>
      <PageHero
        eyebrow="The Divine Nine in Solano"
        title="Our chapters"
        lede="The nine historically Black Greek-letter organizations that make up the council, listed in founding order. Each card links to the local chapter and the national organization."
      >
        <Button asChild className="bg-gold text-ink hover:bg-gold/90">
          <Link href="/get-involved">
            Interested in joining? <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      <section className="py-16 md:py-24">
        <div className="container">
          {error ? (
            <Alert variant="destructive" className="mx-auto max-w-4xl">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error loading organizations</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {sorted.map((org) => (
                <li key={org.id}>
                  <OrganizationCard org={org} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-card py-14 md:py-20">
        <div className="container">
          <SectionHeading
            eyebrow="Membership"
            title="Membership runs through the chapters, not the council."
            lede="Each organization sets its own intake process and requirements. The council can point you to the right chapter and tell you when interest meetings are scheduled."
            action={
              <Button asChild variant="outline">
                <Link href="/get-involved">
                  How to get involved <ArrowRight className="h-4 w-4" />
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
