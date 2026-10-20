import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, CalendarPlus, Download, MapPin } from 'lucide-react';
import { getEventBySlug } from '@/lib/data';
import { sanitizeHtml } from '@/lib/sanitizer';
import { googleCalendarUrl, isUpcoming, parseEventDate, splitDate } from '@/lib/events';
import { getDivineNineBrand, textOn } from '@/lib/divine-nine-brand';
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
  const { month, day, weekday } = splitDate(eventWithIds);
  const upcoming = isUpcoming(eventWithIds);
  const brand = getDivineNineBrand(eventWithIds.hostOrganization);
  const accent = brand?.colors[0] ?? 'hsl(var(--brand-gold))';
  const googleUrl = googleCalendarUrl(eventWithIds);
  const isHtml = eventWithIds.description?.includes('<') && eventWithIds.description?.includes('>');
  const hasImage = Boolean(eventWithIds.image);

  return (
    <article>
      {/* Photo on top, or an ink block carrying the date when there is no photo */}
      <section className="relative bg-ink text-ivory">
        <div className={hasImage ? 'relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/8]' : 'relative'}>
          {hasImage && (
            <Image src={eventWithIds.image} alt={eventWithIds.image_hint || eventWithIds.title} fill priority className="object-cover" sizes="100vw" />
          )}
          {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />}
          <div className={hasImage ? 'absolute inset-x-0 top-0' : ''}>
            <div className="container pt-6">
              <Link href="/events" className="inline-flex items-center gap-1.5 rounded-sm bg-ink/70 px-2.5 py-1.5 text-sm text-ivory/80 backdrop-blur hover:text-gold">
                <ArrowLeft className="h-4 w-4" /> All events
              </Link>
            </div>
          </div>
        </div>

        <div className={hasImage ? 'container -mt-24 pb-12 md:-mt-32 md:pb-16' : 'container pb-12 pt-10 md:pb-16'}>
          <div className="relative grid gap-6 md:grid-cols-12 md:items-end">
            <div className="md:col-span-9">
              <div className="flex items-start gap-5">
                <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-md bg-ivory text-ink shadow-lg">
                  <span className="text-[11px] font-semibold uppercase leading-none tracking-[0.14em]" style={{ color: accent }}>
                    {month}
                  </span>
                  <span className="mt-1 font-headline text-3xl font-bold leading-none">{day}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ivory/80">
                    {weekday && `${weekday}, `}
                    {eventWithIds.date}
                    {eventWithIds.time ? ` · ${eventWithIds.time}` : ''}
                  </p>
                  <h1 className="mt-2 font-headline text-4xl font-bold leading-[1.05] [text-wrap:balance] md:text-5xl lg:text-6xl">
                    {eventWithIds.title}
                  </h1>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ivory/80">
                {brand && (
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: brand.colors[0] }} aria-hidden />
                    Hosted by {brand.shortName}
                  </span>
                )}
                {eventWithIds.location && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold" />
                    {eventWithIds.location}
                  </span>
                )}
                {!upcoming && <span className="rounded-full border border-ivory/30 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-[0.12em]">Past event</span>}
              </div>
            </div>
            {upcoming && when && (
              <div className="md:col-span-3 md:justify-self-end">
                <Countdown targetIso={when.toISOString()} tone="inverse" />
              </div>
            )}
          </div>
        </div>
        <div className="h-1.5 w-full" style={{ background: accent }} />
      </section>

      <section className="py-12 md:py-16">
        <div className="container grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="prose prose-lg max-w-none text-foreground/85 prose-headings:font-headline">
              {isHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(eventWithIds.description) }} />
              ) : eventWithIds.description ? (
                eventWithIds.description
                  .split('\n')
                  .filter((p) => p.trim())
                  .map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <p className="italic text-muted-foreground">Details are on the way.</p>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="lg:sticky lg:top-24">
              <div className="border-t-2 border-ink pt-5">
                {eventWithIds.eventType === 'internal' && eventWithIds.rsvpEnabled && upcoming ? (
                  <>
                    <p className="mb-3 font-headline text-xl font-bold">Let us know you are coming</p>
                    <RSVPButton event={eventWithIds} />
                  </>
                ) : eventWithIds.eventType === 'external' && (eventWithIds.externalLink || eventWithIds.rsvpLink) && upcoming ? (
                  <>
                    <p className="mb-3 font-headline text-xl font-bold">Registration is open</p>
                    <Button asChild size="lg" className="w-full bg-gold text-ink hover:bg-gold/90">
                      <a href={eventWithIds.externalLink || eventWithIds.rsvpLink} target="_blank" rel="noopener noreferrer">
                        Register <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  </>
                ) : upcoming ? (
                  <>
                    <p className="font-headline text-xl font-bold">No registration needed</p>
                    <p className="mt-1 text-sm text-muted-foreground">Just show up. We will see you there.</p>
                  </>
                ) : (
                  <>
                    <p className="font-headline text-xl font-bold">This event has passed</p>
                    <p className="mt-1 text-sm text-muted-foreground">Thanks to everyone who came out.</p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/events">See what is next</Link>
                    </Button>
                  </>
                )}
              </div>

              {upcoming && (googleUrl || when) && (
                <div className="mt-6 border-t border-border pt-5">
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
                <Link
                  href="/organizations"
                  className={`mt-6 flex items-center gap-4 rounded-lg p-4 transition-transform hover:-translate-y-0.5 ${textOn(brand.colors[0]) === 'ink' ? 'text-ink' : 'text-ivory'}`}
                  style={{ background: brand.colors[0] }}
                >
                  <span className="font-greek text-3xl leading-none">{brand.letters}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">Hosted by {brand.shortName}</span>
                    <span className="block text-xs opacity-75">About the chapter</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 opacity-75" />
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>
    </article>
  );
}
