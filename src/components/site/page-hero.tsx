import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The standard opener for every public inner page. Ink ground, gold eyebrow,
 * display headline. Keeps the whole site opening the same way.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-ink text-ivory", className)}>
      <div className="container py-16 md:py-24">
        <div className="max-w-3xl">
          {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
          <h1 className="font-headline text-4xl font-bold leading-[1.1] md:text-6xl [text-wrap:balance]">
            {title}
          </h1>
          {lede && (
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ivory/75 md:text-xl">
              {lede}
            </p>
          )}
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
      <div className="h-1 w-full bg-gold" />
    </section>
  );
}
