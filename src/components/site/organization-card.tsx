import Image from "next/image";
import { ArrowUpRight, Globe } from "lucide-react";
import type { Organization } from "@/lib/definitions";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { Button } from "@/components/ui/button";

/**
 * One Divine Nine chapter. The organization's own colors appear as the top
 * stripe and letters; everything else uses the council system.
 */
export function OrganizationCard({ org }: { org: Organization }) {
  const brand = getDivineNineBrand(org.name);
  const hasLocalSite = Boolean(org.link && org.link !== "#");
  const inactive = /inactive|no active|not active|coming soon/i.test(`${org.chapter} ${org.description}`);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="h-2 w-full"
        style={{ background: brand ? `linear-gradient(90deg, ${brand.colors[0]} 0 70%, ${brand.colors[1]} 70%)` : "hsl(var(--brand-gold))" }}
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-secondary p-2">
            <Image src={org.logo} alt={`${org.name} crest`} width={160} height={160} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0">
            {brand && <p className="font-headline text-2xl font-bold leading-none">{brand.letters}</p>}
            <h3 className="mt-1.5 font-headline text-lg font-bold leading-snug">{org.name}</h3>
            {brand && (
              <p className="mt-1 text-xs text-muted-foreground">
                Founded {brand.founded} · {brand.foundedAt}
              </p>
            )}
          </div>
        </div>

        <dl className="mt-5 grid gap-2 text-sm">
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-muted-foreground">Chapter</dt>
            <dd className="font-semibold">{org.chapter || "—"}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="w-20 shrink-0 text-muted-foreground">President</dt>
            <dd className="font-semibold">{org.president || "—"}</dd>
          </div>
        </dl>

        {org.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{org.description}</p>}

        {inactive && (
          <p className="mt-4 inline-flex w-fit rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            No active local chapter
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {hasLocalSite && (
            <Button asChild size="sm">
              <a href={org.link} target="_blank" rel="noopener noreferrer">
                Chapter site <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
          {brand && (
            <Button asChild size="sm" variant="outline">
              <a href={brand.nationalUrl} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" /> National
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
