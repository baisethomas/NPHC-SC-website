import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Mail, Heart, HandHeart, GraduationCap, Vote, Landmark, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvents, getAnnouncements, getBoardMembers, getDivineNine } from "@/lib/data";
import { getSiteContent } from "@/lib/site-content";
import { getSiteSettings } from "@/lib/site-settings";
import { sanitizeHtml } from "@/lib/sanitizer";
import { pickSpotlightEvent, upcomingEvents, splitDate } from "@/lib/events";
import { getDivineNineBrand } from "@/lib/divine-nine-brand";
import { SectionHeading } from "@/components/site/section-heading";
import { StatsBar, statsFromSettings } from "@/components/site/stats-bar";
import { EventSpotlight } from "@/components/site/event-spotlight";

const PILLARS = [
  { icon: HandHeart, title: "Community Service", text: "Food drives, back-to-school events, and hands-on service across Solano County." },
  { icon: GraduationCap, title: "Educational Advancement", text: "Scholarships, mentoring, and college readiness for local students." },
  { icon: Vote, title: "Civic Engagement", text: "Voter registration, candidate forums, and a seat at the table for our community." },
  { icon: Landmark, title: "Cultural Preservation", text: "Honoring the history of the Divine Nine and Black excellence in our region." },
  { icon: Users, title: "Leadership Development", text: "Training the next generation of chapter and community leaders." },
];

export default async function Home() {
  const [content, settings, allEvents, { announcements }, { boardMembers }, organizations] = await Promise.all([
    getSiteContent(["home.hero.headline", "home.hero.tagline", "home.hero.image", "home.president.message", "home.mission"]),
    getSiteSettings(),
    getEvents(),
    getAnnouncements(),
    getBoardMembers(),
    getDivineNine(),
  ]);

  const spotlight = pickSpotlightEvent(allEvents);
  const moreUpcoming = upcomingEvents(allEvents)
    .filter((e) => e.id !== spotlight?.id)
    .slice(0, 3);
  const latestNews = announcements.slice(0, 3);
  const president = boardMembers.find((m) => m.title.toLowerCase() === "president");
  const stats = statsFromSettings(settings);
  const donateHref = settings.donationUrl || "/donations";

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-ivory">
        <div className="absolute inset-0">
          <Image
            src={content["home.hero.image"]}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-ink/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
        </div>
        <div className="container relative py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <p className="eyebrow mb-5 animate-fade-in-up">National Pan-Hellenic Council · Solano County</p>
            <h1 className="animate-fade-in-up font-headline text-4xl font-bold leading-[1.05] [text-wrap:balance] md:text-6xl lg:text-7xl">
              {content["home.hero.headline"]}
            </h1>
            <p className="mt-6 max-w-xl animate-fade-in-up text-lg leading-relaxed text-ivory/80 animation-delay-200 md:text-xl">
              {content["home.hero.tagline"]}
            </p>
            <div className="mt-9 flex flex-wrap gap-3 animate-fade-in-up animation-delay-400">
              <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
                <Link href={spotlight ? `/events/${spotlight.slug}` : "/events"}>
                  {spotlight ? "Join our next event" : "See upcoming events"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
                <Link href="/organizations">Meet the chapters</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <StatsBar stats={stats} />

      {/* Spotlight + pillars */}
      <section className="py-16 md:py-24">
        <div className="container">
          {spotlight ? (
            <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
              <EventSpotlight event={spotlight} />
              <div>
                <SectionHeading eyebrow="Also on the calendar" title="More from the chapters" className="mb-6" />
                {moreUpcoming.length === 0 ? (
                  <p className="text-sm text-muted-foreground">More events are being scheduled. Check back soon.</p>
                ) : (
                  <ul className="divide-y divide-border border-y border-border">
                    {moreUpcoming.map((event) => {
                      const { month, day } = splitDate(event);
                      const brand = getDivineNineBrand(event.hostOrganization);
                      return (
                        <li key={event.id}>
                          <Link href={`/events/${event.slug}`} className="group flex items-center gap-4 py-4">
                            <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-md border border-border bg-card">
                              <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.14em] text-gold">{month}</span>
                              <span className="mt-0.5 font-headline text-lg font-bold leading-none">{day}</span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold group-hover:underline underline-offset-4">{event.title}</p>
                              <p className="truncate text-sm text-muted-foreground">
                                {brand ? `${brand.shortName} · ` : ""}
                                {event.time}
                                {event.location ? ` · ${event.location}` : ""}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Button asChild variant="link" className="mt-4 h-auto p-0 font-semibold">
                  <Link href="/events">
                    Full calendar <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border p-10 text-center">
              <Calendar className="mx-auto h-8 w-8 text-gold" />
              <p className="mt-3 font-semibold">No upcoming events yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Join the mailing list and we will let you know when the next one is posted.</p>
            </div>
          )}
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-ink py-16 text-ivory md:py-24">
        <div className="container">
          <SectionHeading
            tone="inverse"
            eyebrow="What we do"
            title="Five commitments, nine organizations, one county."
            lede="Every NPHC council organizes its work around the same five focus areas. Here is what they look like in Solano."
          />
          <ul className="grid gap-px overflow-hidden rounded-lg border border-ivory/10 bg-ivory/10 sm:grid-cols-2 lg:grid-cols-5">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <li key={p.title} className="bg-ink p-6">
                  <Icon className="h-6 w-6 text-gold" />
                  <h3 className="mt-5 font-headline text-lg font-bold leading-snug">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/65">{p.text}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-8">
            <Button asChild variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
              <Link href="/programs">
                See our programs <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* President's message */}
      <section className="py-16 md:py-24">
        <div className="container grid items-center gap-10 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary">
              {president ? (
                <Image src={president.image} alt={president.name} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
              ) : (
                <div className="flex h-full items-center justify-center font-headline text-5xl text-muted-foreground">NPHC</div>
              )}
            </div>
          </div>
          <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
            <p className="eyebrow mb-4">From the president</p>
            <blockquote
              className="font-headline text-2xl leading-snug md:text-3xl [&_p]:mb-4 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["home.president.message"]) }}
            />
            {president && (
              <p className="mt-6 text-sm">
                <span className="font-semibold">{president.name}</span>
                <span className="text-muted-foreground"> · {president.title}, NPHC of Solano County</span>
              </p>
            )}
            <Button asChild variant="link" className="mt-4 h-auto p-0 font-semibold">
              <Link href="/about">
                Meet the executive board <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-border bg-card py-14 md:py-20">
        <div className="container grid gap-8 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="eyebrow mb-3">Our mission</p>
            <div className="gold-rule" />
          </div>
          <div
            className="text-lg leading-relaxed text-foreground/85 md:col-span-8 [&_p]:mb-4 [&_p:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(content["home.mission"]) }}
          />
        </div>
      </section>

      {/* Divine Nine */}
      <section className="py-16 md:py-24">
        <div className="container">
          <SectionHeading
            eyebrow="The Divine Nine"
            title="Nine organizations. One council."
            lede="Each chapter brings its own traditions and programs. Together they are the NPHC of Solano County."
            action={
              <Button asChild variant="outline">
                <Link href="/organizations">
                  Meet the chapters <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
            {organizations.map((org) => {
              const brand = getDivineNineBrand(org.name);
              return (
                <li key={org.id}>
                  <Link
                    href="/organizations"
                    className="group flex flex-col items-center gap-3 rounded-md border border-border bg-card p-4 transition-colors hover:border-gold"
                    title={org.name}
                  >
                    <span className="h-1 w-full rounded-full" style={{ background: brand?.colors[0] ?? "hsl(var(--brand-gold))" }} aria-hidden />
                    <Image src={org.logo} alt={org.name} width={120} height={120} className="h-16 w-16 object-contain" />
                    <span className="text-center font-headline text-sm font-bold leading-tight">{brand?.letters ?? org.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* News */}
      {latestNews.length > 0 && (
        <section className="border-t border-border py-16 md:py-24">
          <div className="container">
            <SectionHeading
              eyebrow="News"
              title="The latest from the council"
              action={
                <Button asChild variant="outline">
                  <Link href="/news">
                    All news <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              }
            />
            <div className="grid gap-8 md:grid-cols-3">
              {latestNews.map((item) => (
                <article key={item.id} className="flex flex-col border-t-2 border-ink pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{item.date}</p>
                  <h3 className="mt-3 font-headline text-xl font-bold leading-snug">
                    <Link href={`/news/${item.id}`} className="hover:underline underline-offset-4">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  <Link href={`/news/${item.id}`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold hover:underline underline-offset-4">
                    Read more <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Support */}
      <section className="bg-gold-soft py-16 md:py-24">
        <div className="container">
          <SectionHeading
            align="center"
            eyebrow="Get involved"
            title="Stay connected. Support the work."
            lede="Join the list for event announcements and scholarship deadlines, or give to the programs that serve Solano County."
          />
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
            <Link href="/mailing-list" className="group flex items-start gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-gold">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ink text-gold">
                <Mail className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-headline text-lg font-bold">Join the mailing list</span>
                <span className="mt-1 block text-sm text-muted-foreground">Events, news, and scholarship opportunities. A few emails a month.</span>
              </span>
            </Link>
            <a
              href={donateHref}
              target={settings.donationUrl ? "_blank" : undefined}
              rel={settings.donationUrl ? "noopener noreferrer" : undefined}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-6 transition-colors hover:border-gold"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ink text-gold">
                <Heart className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-headline text-lg font-bold">Make a gift</span>
                <span className="mt-1 block text-sm text-muted-foreground">Fund scholarships, youth programs, and community outreach.</span>
              </span>
            </a>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-gold" />
            Serving Vallejo, Fairfield, Vacaville, Benicia, Suisun City, Dixon, and Rio Vista.
          </p>
        </div>
      </section>
    </div>
  );
}
