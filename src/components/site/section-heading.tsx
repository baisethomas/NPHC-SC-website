import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section opener used across the public site: gold eyebrow, display heading,
 * optional lede, optional action on the right. Left-aligned by default so
 * long-form pages read as pages rather than posters; pass `align="center"`
 * for short centered bands.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
  align = "left",
  tone = "default",
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: ReactNode;
  align?: "left" | "center";
  tone?: "default" | "inverse";
  className?: string;
}) {
  const inverse = tone === "inverse";
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-4 md:mb-12",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && <p className={cn("eyebrow mb-3", inverse && "text-gold")}>{eyebrow}</p>}
        <h2
          className={cn(
            "font-headline text-3xl font-bold leading-tight md:text-4xl [text-wrap:balance]",
            inverse ? "text-ivory" : "text-foreground"
          )}
        >
          {title}
        </h2>
        {lede && (
          <p className={cn("mt-3 text-base leading-relaxed md:text-lg", inverse ? "text-ivory/70" : "text-muted-foreground")}>
            {lede}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
