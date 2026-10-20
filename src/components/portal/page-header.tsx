import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Opener for every portal section page: headline title, one-line description,
 * primary action on the right. Tighter than the public PageHero because the
 * portal is a tool, not a poster.
 */
export function PortalPageHeader({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        <h1 className="font-headline text-3xl font-bold leading-tight text-foreground md:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 flex-wrap gap-2">{action}</div>}
    </div>
  );
}

/** Small heading for a group of rows inside a portal page. */
export function PortalSectionTitle({
  title,
  count,
  action,
  className,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <h2 className="font-headline text-xl font-bold leading-none text-foreground md:text-2xl">
        {title}
        {typeof count === "number" && <span className="ml-2 font-body text-sm font-normal text-muted-foreground">{count}</span>}
      </h2>
      {action}
    </div>
  );
}

type TagTone = "gold" | "ink" | "muted" | "success" | "danger" | "info";

const TAG_TONES: Record<TagTone, string> = {
  gold: "bg-gold-soft text-ink",
  ink: "bg-ink text-ivory",
  muted: "bg-secondary text-muted-foreground",
  success: "bg-emerald-100 text-emerald-900",
  danger: "bg-red-100 text-red-900",
  info: "bg-sky-100 text-sky-900",
};

/** Tiny uppercase label for statuses and categories. */
export function PortalTag({ tone = "muted", children, className }: { tone?: TagTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]",
        TAG_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Centered empty state used when a list has nothing to show. */
export function PortalEmpty({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <p className="font-headline text-lg font-bold">{title}</p>
      {description && <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

/** Editorial date block: short month over a bold day numeral. */
export function DateBlock({ date, className, size = "md" }: { date: Date | string; className?: string; size?: "sm" | "md" }) {
  const d = typeof date === "string" ? new Date(date) : date;
  const valid = !Number.isNaN(d.getTime());
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center rounded-md bg-ink text-ivory",
        size === "sm" ? "h-11 w-11" : "h-14 w-14",
        className
      )}
    >
      <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-gold">
        {valid ? d.toLocaleDateString("en-US", { month: "short" }) : "—"}
      </span>
      <span className={cn("mt-1 font-headline font-bold leading-none", size === "sm" ? "text-base" : "text-xl")}>
        {valid ? d.toLocaleDateString("en-US", { day: "numeric" }) : "—"}
      </span>
    </div>
  );
}
