import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Event } from "@/lib/definitions";
import { splitDate } from "@/lib/events";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { cn } from "@/lib/utils";

/**
 * Events as an agenda: one full-width row per event with the date on the left,
 * title and venue in the middle. Reads like a printed calendar, not a card grid.
 */
export function EventAgenda({ events, className }: { events: Event[]; className?: string }) {
  if (events.length === 0) return null;
  return (
    <ul className={cn("divide-y divide-border border-y border-border", className)}>
      {events.map((event) => {
        const { month, day, weekday } = splitDate(event);
        const brand = getDivineNineBrand(event.hostOrganization);
        return (
          <li key={event.id}>
            <Link
              href={`/events/${event.slug}`}
              className="group grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-5 sm:grid-cols-[7rem_1fr_auto] sm:gap-6"
            >
              <div className="leading-none">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {weekday ? weekday.slice(0, 3) : month}
                </p>
                <p className="mt-1.5 font-headline text-2xl font-bold tabular-nums">
                  <span className="sm:hidden">{day}</span>
                  <span className="hidden sm:inline">
                    {month} {day}
                  </span>
                </p>
              </div>
              <div className="min-w-0">
                <p className="font-headline text-lg font-bold leading-snug group-hover:underline underline-offset-4 md:text-xl">
                  {event.title}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                  {brand && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-foreground/80">
                      <span className="h-2 w-2 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />
                      {brand.shortName}
                    </span>
                  )}
                  {event.time && <span>{event.time}</span>}
                  {event.location && <span className="truncate">{event.location}</span>}
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
