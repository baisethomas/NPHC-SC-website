import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, MapPin } from "lucide-react";
import type { Event } from "@/lib/definitions";
import { splitDate } from "@/lib/events";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Event card for lists: date block, host org tag, and one call to action
 * that matches the event type. Server-safe (no dialogs); the detail page
 * carries the full description, RSVP form, and calendar links.
 */
export function EventListCard({ event, past = false }: { event: Event; past?: boolean }) {
  const { month, day, weekday } = splitDate(event);
  const brand = getDivineNineBrand(event.hostOrganization);

  const cta =
    past
      ? { href: `/events/${event.slug}`, label: "Recap" }
      : event.eventType === "internal" && event.rsvpEnabled
        ? { href: `/events/${event.slug}`, label: "RSVP" }
        : event.eventType === "external" && (event.externalLink || event.rsvpLink)
          ? { href: (event.externalLink || event.rsvpLink) as string, label: "Register", external: true }
          : { href: `/events/${event.slug}`, label: "Details" };

  return (
    <article className={cn("flex flex-col overflow-hidden rounded-lg border border-border bg-card", past && "opacity-80")}>
      <Link href={`/events/${event.slug}`} className="relative block aspect-[16/9] bg-secondary">
        <Image src={event.image} alt={event.title} fill className="object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
        <div className="absolute left-4 top-4 flex h-14 w-14 flex-col items-center justify-center rounded-md bg-ink/95 text-ivory shadow">
          <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-gold">{month}</span>
          <span className="mt-1 font-headline text-xl font-bold leading-none">{day}</span>
        </div>
        {brand && (
          <span
            className="absolute bottom-0 left-0 right-0 h-1.5"
            style={{ background: brand.colors[0] }}
            aria-hidden
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {brand && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />
            {brand.shortName}
          </p>
        )}
        <h3 className="font-headline text-xl font-bold leading-snug">
          <Link href={`/events/${event.slug}`} className="hover:underline underline-offset-4">
            {event.title}
          </Link>
        </h3>
        <dl className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0 text-gold" />
            <dd>
              {weekday && `${weekday}, `}
              {event.date}
              {event.time ? ` · ${event.time}` : ""}
            </dd>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-gold" />
              <dd className="truncate">{event.location}</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto pt-5">
          <Button asChild size="sm" variant={past ? "outline" : "default"}>
            {cta.external ? (
              <a href={cta.href} target="_blank" rel="noopener noreferrer">
                {cta.label} <ArrowUpRight className="h-4 w-4" />
              </a>
            ) : (
              <Link href={cta.href}>
                {cta.label} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
