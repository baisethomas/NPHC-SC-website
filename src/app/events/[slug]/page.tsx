import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarPlus, Clock, Download, Info, MapPin } from 'lucide-react';
import { getEventBySlug } from '@/lib/data';
import { sanitizeHtml } from '@/lib/sanitizer';
import { googleCalendarUrl, isUpcoming, parseEventDate, splitDate } from '@/lib/events';
import { getDivineNineBrand } from '@/lib/divine-nine-brand';
import { Button } from '@/components/ui/button';
import { RSVPButton } from '@/components/rsvp-button';
import { Countdown } from '@/components/site/countdown';

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {
    decodedSlug = slug;
  }

  const event = await getEventBySlug(decodedSlug);
  if (!event || !event.title) notFound();

  const eventWithIds = { ...event, id: event.id || event.slug || slug, slug: event.slug || event.id || slug };
  const when = parseEventDate(eventWithIds);
  const { weekday } = splitDate(eventWithIds);
  const upcoming = isUpcoming(eventWithIds);
  const brand = getDivineNineBrand(eventWithIds.hostOrganization);
  const googleUrl = googleCalendarUrl(eventWithIds);
  const isHtml = eventWithIds.description?.includes('<') && eventWithIds.description?.includes('>');

  return (
    <div>
      <section className="bg-ink text-ivory">
        <div className="container py-12 md:py-16">
          <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-ivory/70 hover:text-gold">
            <ArrowLeft className="h-4 w-4" /> All events
          </Link>
          <div className="mt-6 grid gap-8 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="eyebrow mb-3">
                {upcoming ? 'Upcoming event' : 'Past event'}
                {brand ? ` · Hosted by ${brand.shortName}` : ''}
              </p>
              <h1 className="font-headline text-4xl font-bold leading-[1.1] [text-wrap:balance] md:text-5xl">{eventWithIds.title}</h1>
              <dl className="mt-6 grid gap-2 text-ivory/80">
                <div className="flex items-center gap-2.5">
                  <Clock className="h-4 w-4 shrink-0 text-gold" />
                  <dd>
                    {weekday && `${weekday}, `}
                    {eventWithIds.date}
                    {eventWithIds.time ? ` · ${eventWithIds.time}` : ''}
                  </dd>
                </div>
                {eventWithIds.location && (
                  <div className="flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 shrink-0 text-gold" />
                    <dd>{eventWithIds.location}</dd>
                  </div>
                )}
              </dl>
            </div>
            {upcoming && when && (
              <div className="md:col-span-4 md:justify-self-end">
                <Countdown targetIso={when.toISOString()} tone="inverse" />
              </div>
            )}
          </div>
        </div>
        <div className="h-1 w-full" style={{ background: brand?.colors[0] ?? 'hsl(var(--brand-gold))' }} />
      </section>

      <section className="py-12 md:py-16">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-secondary">
              <Image src={eventWithIds.image} alt={eventWithIds.title} fill className="object-cover" sizes="(min-width: 1024px) 58vw, 100vw" priority />
            </div>
            <div className="prose prose-lg mt-8 max-w-none text-foreground/85">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(eventWithIds.description) }} />
              ) : eventWithIds.description ? (
                <p>{eventWithIds.description}</p>
              ) : (
                <p className="italic text-muted-foreground">Details are on the way.</p>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="space-y-6 rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
              <div>
                <p className="eyebrow mb-3">{upcoming ? 'Join us' : 'This event has passed'}</p>
                {eventWithIds.eventType === 'internal' && eventWithIds.rsvpEnabled && upcoming ? (
                  <RSVPButton event={eventWithIds} />
                ) : eventWithIds.eventType === 'external' && (eventWithIds.externalLink || eventWithIds.rsvpLink) && upcoming ? (
                  <Button asChild size="lg" className="w-full bg-gold text-ink hover:bg-gold/90">
                    <a href={eventWithIds.externalLink || eventWithIds.rsvpLink} target="_blank" rel="noopener noreferrer">
                      Register <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </Button>
                ) : upcoming ? (
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> No registration needed. Just show up.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Thanks to everyone who came out. See what is coming next on the events page.</p>
                )}
              </div>

              {upcoming && (googleUrl || when) && (
                <div className="border-t border-border pt-5">
                  <p className="mb-3 text-sm font-semibold">Add to your calendar</p>
                  <div className="flex flex-wrap gap-2">
                    {googleUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={googleUrl} target="_blank" rel="noopener noreferrer">
                          <CalendarPlus className="h-4 w-4" /> Google Calendar
                        </a>
                      </Button>
                    )}
                    {when && (
                      <Button asChild variant="outline" size="sm">
                        <a href={`/events/${encodeURIComponent(eventWithIds.slug)}/calendar.ics`} download>
                          <Download className="h-4 w-4" /> Apple / Outlook (.ics)
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {brand && (
                <div className="border-t border-border pt-5">
                  <p className="mb-2 text-sm font-semibold">Hosted by</p>
                  <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />
                    {brand.shortName}
                  </p>
                  <Link href="/organizations" className="mt-2 block text-sm font-semibold text-gold hover:underline underline-offset-4">
                    About the chapter
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
