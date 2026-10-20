import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one way every admin page opens: optional back link, headline title,
 * one-line description, and the page's primary action on the right.
 */
export function AdminPageHeader({
  title,
  description,
  action,
  backHref,
  backLabel,
  meta,
  className,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  /** Small facts shown under the description, e.g. counts. */
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-border pb-6", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel ?? "Back"}
        </Link>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-headline text-3xl font-bold leading-tight tracking-tight">{title}</h1>
          {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{meta}</div>}
        </div>
        {action && <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}

/** A bordered surface for a table or list. */
export function AdminPanel({
  children,
  className,
  title,
  description,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card", className)}>
      {(title || action) && (
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && <h2 className="font-headline text-lg font-bold leading-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/** One sentence and, usually, the create button. */
export function AdminEmpty({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-md border border-dashed border-border px-5 py-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{children}</p>
      {action}
    </div>
  );
}

/** Small count chip for header meta rows. */
export function AdminCount({ children, attention = false }: { children: ReactNode; attention?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        attention ? "border-gold/40 bg-gold-soft text-foreground" : "border-border bg-background text-muted-foreground"
      )}
    >
      {attention && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />}
      {children}
    </span>
  );
}
