import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import type { Event } from "@/lib/definitions";
import { parseEventDate, splitDate } from "@/lib/events";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { Button } from "@/components/ui/button";
import { Countdown } from "./countdown";

/**
 * "Coming up next" card: date block, countdown, and the right call to action.
 * Used on the homepage and the member portal home.
 */
export function EventSpotlight({ event, compact = false }: { event: Event; compact?: boolean }) {
  const when = parseEventDate(event);
  const { month, day, weekday } = splitDate(event);
  const brand = getDivineNineBrand(event.hostOrganization);

  const cta =
    event.eventType === "internal" && event.rsvpEnabled
      ? { href: `/events/${event.slug}`, label: "RSVP" }
      : event.eventType === "external" && (event.externalLink || event.rsvpLink)
        ? { href: (event.externalLink || event.rsvpLink) as string, label: "Register", external: true }
        : { href: `/events/${event.slug}`, label: "Event details" };

  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card">
      <div className={compact ? "grid" : "grid md:grid-cols-[1.1fr_1fr]"}>
        {!compact && (
          <div className="relative aspect-[4/3] bg-secondary md:aspect-auto md:min-h-[320px]">
            <Image src={event.image} alt={event.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
          </div>
        )}
        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-ink text-ivory">
              <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-gold">{month}</span>
              <span className="mt-1 font-headline text-2xl font-bold leading-none">{day}</span>
            </div>
            <div className="min-w-0">
              <p className="eyebrow">Coming up next</p>
              <h3 className="mt-1 font-headline text-2xl font-bold leading-tight [text-wrap:balance]">
                <Link href={`/events/${event.slug}`} className="hover:underline underline-offset-4">
                  {event.title}
                </Link>
              </h3>
              {brand && (
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />
                  Hosted by {brand.shortName}
                </p>
              )}
            </div>
          </div>

          <dl className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 shrink-0 text-gold" />
              <dd>
                {weekday && `${weekday}, `}
                {event.date}
                {event.time ? ` · ${event.time}` : ""}
              </dd>
            </div>
            {event.location && (
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-gold" />
                <dd className="truncate">{event.location}</dd>
              </div>
            )}
          </dl>

          {when && <Countdown targetIso={when.toISOString()} />}

          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            <Button asChild className="bg-gold text-ink hover:bg-gold/90">
              {cta.external ? (
                <a href={cta.href} target="_blank" rel="noopener noreferrer">
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </a>
              ) : (
                <Link href={cta.href}>
                  {cta.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </Button>
            <Button asChild variant="outline">
              <Link href="/events">All events</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
