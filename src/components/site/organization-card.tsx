import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Organization } from "@/lib/definitions";
import { getDivineNineBrand, textOn } from "@/lib/divine-nine-brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * One Divine Nine chapter. The top half is the organization's own color with
 * its crest and letters; the bottom half carries the local chapter facts in
 * the council system.
 */
export function OrganizationCard({ org }: { org: Organization }) {
  const brand = getDivineNineBrand(org.name);
  const primary = brand?.colors[0] ?? "hsl(var(--brand-ink))";
  const secondary = brand?.colors[1] ?? "hsl(var(--brand-gold))";
  const onInk = !brand || textOn(brand.colors[0]) === "ivory";
  const hasLocalSite = Boolean(org.link && org.link !== "#");
  const inactive = /inactive|no active|not active|coming soon/i.test(`${org.chapter} ${org.description}`);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className={cn("relative flex items-center gap-5 p-6", onInk ? "text-ivory" : "text-ink")} style={{ background: primary }}>
        <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-ivory p-2.5 shadow-sm">
          <Image src={org.logo} alt={`${org.name} crest`} width={160} height={160} className="h-full w-full object-contain" />
        </span>
        <div className="min-w-0">
          {brand && <p className="font-headline text-4xl font-bold leading-none">{brand.letters}</p>}
          <h3 className="mt-2 font-headline text-lg font-bold leading-snug">{org.name}</h3>
          {brand && (
            <p className={cn("mt-1 text-xs", onInk ? "text-ivory/75" : "text-ink/70")}>
              Est. {brand.founded} · {brand.foundedAt}
            </p>
          )}
        </div>
        <span className="absolute inset-x-0 bottom-0 h-1.5" style={{ background: secondary }} aria-hidden />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <dl className="grid grid-cols-[5.5rem_1fr] gap-x-3 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Chapter</dt>
          <dd className="font-semibold">{org.chapter || "—"}</dd>
          <dt className="text-muted-foreground">President</dt>
          <dd className="font-semibold">{org.president || "—"}</dd>
        </dl>

        {org.description && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{org.description}</p>}

        {inactive && (
          <p className="mt-4 inline-flex w-fit rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            No active local chapter
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-6">
          {hasLocalSite && (
            <Button asChild size="sm" className="bg-ink text-ivory hover:bg-ink/90">
              <a href={org.link} target="_blank" rel="noopener noreferrer">
                Chapter site <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
          {brand && (
            <Button asChild size="sm" variant="outline">
              <a href={brand.nationalUrl} target="_blank" rel="noopener noreferrer">
                National <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
