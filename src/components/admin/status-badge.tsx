import { cn } from "@/lib/utils";

type Tone = "neutral" | "live" | "pending" | "muted" | "danger";

const TONES: Record<Tone, string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  pending: "border-gold/40 bg-gold-soft text-foreground",
  neutral: "border-border bg-background text-foreground",
  muted: "border-border bg-secondary text-muted-foreground",
  danger: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
};

const STATUS_TONES: Record<string, Tone> = {
  published: "live",
  active: "live",
  approved: "live",
  scheduled: "pending",
  pending: "pending",
  seasonal: "pending",
  new: "pending",
  draft: "muted",
  inactive: "muted",
  archived: "muted",
  read: "neutral",
  suspended: "danger",
  rejected: "danger",
};

/** Consistent status chip for drafts, approvals, and the like. */
export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  const tone = STATUS_TONES[status.toLowerCase()] ?? "neutral";
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize", TONES[tone], className)}>
      {label ?? status}
    </span>
  );
}
