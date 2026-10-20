import Image from "next/image";
import Link from "next/link";
import type { Event } from "@/lib/definitions";
import { splitDate } from "@/lib/events";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { cn } from "@/lib/utils";

/**
 * Compact photo tile for past events: the picture leads, the date and host
 * sit underneath as a caption. Upcoming events use the agenda rows instead.
 */
export function EventListCard({ event, past = false }: { event: Event; past?: boolean }) {
  const { month, day } = splitDate(event);
  const brand = getDivineNineBrand(event.hostOrganization);

  return (
    <article className="group">
      <Link href={`/events/${event.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-ink">
        {event.image ? (
          <Image
            src={event.image}
            alt={event.image_hint || event.title}
            fill
            className={cn("object-cover transition-transform duration-300 group-hover:scale-[1.02]", past && "grayscale-[35%] group-hover:grayscale-0")}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full flex-col items-start justify-end p-5 text-ivory">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">{month}</span>
            <span className="font-headline text-5xl font-bold leading-none">{day}</span>
          </div>
        )}
        {brand && <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: brand.colors[0] }} aria-hidden />}
      </Link>
      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {event.date}
          {brand ? ` · ${brand.shortName}` : ""}
        </p>
        <h3 className="mt-1.5 font-headline text-lg font-bold leading-snug">
          <Link href={`/events/${event.slug}`} className="hover:underline underline-offset-4">
            {event.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
