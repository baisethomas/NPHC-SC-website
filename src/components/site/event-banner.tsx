import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import type { Event } from "@/lib/definitions";
import { parseEventDate, splitDate } from "@/lib/events";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { Button } from "@/components/ui/button";
import { Countdown } from "./countdown";

/**
 * Homepage spotlight: the event photo runs full width and the details sit in a
 * card over its lower-left corner. On small screens the card stacks beneath.
 */
export function EventBanner({ event }: { event: Event }) {
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
    <article className="relative overflow-hidden rounded-lg bg-ink">
      <div className="relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9] lg:min-h-[440px]">
        {event.image ? (
          <Image src={event.image} alt={event.image_hint || event.title} fill priority className="object-cover" sizes="100vw" />
        ) : (
          <div className="absolute inset-0 bg-ink" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent lg:bg-gradient-to-r lg:from-ink/70 lg:via-ink/20" />
        <p className="eyebrow absolute left-5 top-5 rounded-sm bg-ink/80 px-2.5 py-1.5 text-gold backdrop-blur sm:left-8 sm:top-8">
          Coming up next
        </p>
      </div>

      <div className="bg-card p-6 text-card-foreground lg:absolute lg:bottom-8 lg:left-8 lg:max-w-md lg:rounded-lg lg:p-7 lg:shadow-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-md bg-ink text-ivory">
            <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em] text-gold">{month}</span>
            <span className="mt-1 font-headline text-2xl font-bold leading-none">{day}</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-headline text-2xl font-bold leading-tight [text-wrap:balance]">
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

        <dl className="mt-5 grid gap-2 text-sm text-muted-foreground">
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

        {when && <Countdown targetIso={when.toISOString()} className="mt-5" />}

        <div className="mt-6 flex flex-wrap gap-2">
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
    </article>
  );
}
