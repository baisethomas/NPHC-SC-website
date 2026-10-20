import type { SiteSettings } from "@/lib/site-settings";
import { cn } from "@/lib/utils";

export type Stat = { value: string; label: string };

/**
 * Builds the public stats from site settings. Always leads with the fact every
 * council shares (nine organizations); the rest only appear when an admin has
 * filled them in, and NPHC's founding year backfills if the bar would be thin.
 */
export function statsFromSettings(settings: SiteSettings): Stat[] {
  const stats: Stat[] = [{ value: "9", label: "Member organizations" }];
  if (settings.statChapters) stats.push({ value: settings.statChapters, label: "Local chapters" });
  if (settings.yearChartered) stats.push({ value: settings.yearChartered, label: "Council chartered" });
  if (settings.statMembers) stats.push({ value: settings.statMembers, label: "Active members" });
  if (settings.statScholarships) stats.push({ value: settings.statScholarships, label: "Scholarships awarded" });
  if (settings.statServiceHours) stats.push({ value: settings.statServiceHours, label: "Service hours this year" });
  if (stats.length < 3) stats.push({ value: "1930", label: "NPHC founded" });
  return stats.slice(0, 5);
}

export function StatsBar({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div className={cn("border-y border-border bg-card", className)}>
      <dl className="container grid grid-cols-2 gap-px md:flex md:divide-x md:divide-border">
        {stats.map((s) => (
          <div key={s.label} className="min-w-0 px-2 py-5 md:flex-1 md:px-6 md:py-7">
            <dd className="font-headline text-3xl font-bold leading-none tabular-nums md:text-4xl">{s.value}</dd>
            <dt className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</dt>
          </div>
        ))}
      </dl>
    </div>
  );
}
