import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvents, getAnnouncements, getBoardMembers, getDivineNine, getPrograms } from "@/lib/data";
import { getSiteContent } from "@/lib/site-content";
import { getSiteSettings } from "@/lib/site-settings";
import { pickSpotlightEvent, upcomingEvents } from "@/lib/events";
import { pullQuote } from "@/lib/text";
import { SectionHeading } from "@/components/site/section-heading";
import { EventBanner } from "@/components/site/event-banner";
import { EventAgenda } from "@/components/site/event-agenda";
import { DivineNineTiles, DivineNineChips } from "@/components/site/divine-nine-tiles";

const PILLARS = [
  { title: "Community service", text: "Food drives, back-to-school events, and hands-on service across Solano County." },
  { title: "Educational advancement", text: "Scholarships, mentoring, and college readiness for local students." },
  { title: "Civic engagement", text: "Voter registration, candidate forums, and a seat at the table for our community." },
  { title: "Cultural preservation", text: "Honoring the history of the Divine Nine and Black excellence in our region." },
  { title: "Leadership development", text: "Training the next generation of chapter and community leaders." },
];

export default async function Home() {
  const [content, settings, allEvents, { announcements }, { boardMembers }, organizations, { programs }] = await Promise.all([
    getSiteContent(["home.hero.headline", "home.hero.tagline", "home.hero.image", "home.president.message"]),
    getSiteSettings(),
    getEvents(),
    getAnnouncements(),
    getBoardMembers(),
    getDivineNine(),
    getPrograms(),
  ]);

  const spotlight = pickSpotlightEvent(allEvents);
  const moreUpcoming = upcomingEvents(allEvents)
    .filter((e) => e.id !== spotlight?.id)
    .slice(0, 4);
  const latestNews = announcements.slice(0, 3);
  const president = boardMembers.find((m) => m.title.toLowerCase() === "president");
  const quote = pullQuote(content["home.president.message"]);
  const programPhotos = programs.filter((p) => p.image && p.status !== "inactive").slice(0, 3);
  const donateHref = settings.donationUrl || "/donations";

  return (
    <div className="flex flex-col">
      {/* Hero: words on the left, the community on the right, no overlay */}
      <section className="bg-background">
        <div className="grid lg:grid-cols-2">
          <div className="container flex flex-col justify-center py-14 lg:mr-0 lg:max-w-[700px] lg:py-24 lg:pr-12">
            <p className="eyebrow mb-5">National Pan-Hellenic Council · Solano County</p>
            <h1 className="font-headline text-5xl font-bold leading-[1.02] [text-wrap:balance] md:text-6xl lg:text-7xl">
              {content["home.hero.headline"]}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground md:text-xl">
              {content["home.hero.tagline"]}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gold text-ink hover:bg-gold/90">
                <Link href={spotlight ? `/events/${spotlight.slug}` : "/events"}>
                  {spotlight ? "Join our next event" : "See upcoming events"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/organizations">Meet the chapters</Link>
              </Button>
            </div>
            <p className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <DivineNineChips />
              <span>
                Nine organizations
                {settings.yearChartered ? ` · Chartered ${settings.yearChartered}` : " · One council"}
              </span>
            </p>
          </div>
          <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[600px]">
            <Image
              src={content["home.hero.image"]}
              alt="Members of the NPHC of Solano County at a community event"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gold" aria-hidden />
          </div>
        </div>
      </section>

      {/* Next event: shown only when there is one */}
      {spotlight && (
        <section className="py-12 md:py-16">
          <div className="container">
            <EventBanner event={spotlight} />
            {moreUpcoming.length > 0 && (
              <div className="mt-12 md:mt-16">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <h2 className="font-headline text-2xl font-bold md:text-3xl">Also on the calendar</h2>
                  <Link href="/events" className="shrink-0 text-sm font-semibold hover:underline underline-offset-4">
                    Full calendar <ArrowRight className="inline h-3.5 w-3.5" />
                  </Link>
                </div>
                <EventAgenda events={moreUpcoming} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* The Divine Nine, in their own colors */}
      <section className={spotlight ? "border-t border-border py-16 md:py-24" : "py-16 md:py-24"}>
        <div className="container">
          <SectionHeading
            title="Nine organizations. One council."
            lede="The historically Black Greek-letter organizations that make up the NPHC, in founding order. Each has a chapter serving Solano County."
            action={
              <Button asChild variant="outline">
                <Link href="/organizations">
                  Meet the chapters <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          />
          <DivineNineTiles organizations={organizations} />
        </div>
      </section>

      {/* What we do: a numbered list, with program photos when we have them */}
      <section className="bg-ink py-16 text-ivory md:py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">
                Five commitments. One county.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-ivory/70 md:text-lg">
                Every NPHC council organizes its work around the same five focus areas. Here is what they look like in Solano.
              </p>
              {programPhotos.length > 0 && (
                <ul className="mt-8 grid grid-cols-3 gap-2">
                  {programPhotos.map((p) => (
                    <li key={p.id} className="relative aspect-square overflow-hidden rounded-md bg-ivory/10">
                      <Image src={p.image as string} alt={p.imageHint || p.name} fill className="object-cover" sizes="(min-width: 1024px) 15vw, 33vw" />
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild variant="outline" className="mt-8 border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
                <Link href="/programs">
                  See our programs <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ol className="divide-y divide-ivory/10 border-y border-ivory/10 lg:col-span-7">
              {PILLARS.map((p, i) => (
                <li key={p.title} className="grid grid-cols-[3rem_1fr] gap-4 py-6 md:grid-cols-[4rem_1fr]">
                  <span className="font-headline text-2xl font-bold tabular-nums text-gold md:text-3xl">0{i + 1}</span>
                  <div>
                    <h3 className="font-headline text-xl font-bold leading-snug md:text-2xl">{p.title}</h3>
                    <p className="mt-2 max-w-prose text-sm leading-relaxed text-ivory/65 md:text-base">{p.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* From the president: one sentence, one portrait */}
      {quote && (
        <section className="py-16 md:py-24">
          <div className="container grid items-center gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-5 lg:col-span-4">
              <div className="relative">
                <div className="absolute -bottom-3 -left-3 h-full w-full rounded-lg bg-gold-soft" aria-hidden />
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary">
                  {president ? (
                    <Image src={president.image} alt={president.name} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center font-headline text-5xl text-muted-foreground">NPHC</div>
                  )}
                </div>
              </div>
            </div>
            <div className="md:col-span-7 lg:col-span-7 lg:col-start-6">
              <span className="block font-headline text-7xl leading-none text-gold" aria-hidden>
                “
              </span>
              <blockquote className="-mt-6 font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
                {quote}
              </blockquote>
              {president && (
                <p className="mt-6 text-sm">
                  <span className="font-semibold">{president.name}</span>
                  <span className="text-muted-foreground"> · {president.title}, NPHC of Solano County</span>
                </p>
              )}
              <Button asChild variant="link" className="mt-3 h-auto p-0 font-semibold">
                <Link href="/about#president">
                  Read the full letter <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* News */}
      {latestNews.length > 0 && (
        <section className="border-t border-border py-16 md:py-24">
          <div className="container">
            <SectionHeading
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
        <div className="container grid items-center gap-8 md:grid-cols-12">
          <div className="md:col-span-7">
            <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">Stay connected. Support the work.</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/75 md:text-lg">
              A few emails a month with events, news, and scholarship deadlines. Or give directly to the programs that serve Solano County.
            </p>
            <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-gold" />
              Serving Vallejo, Fairfield, Vacaville, Benicia, Suisun City, Dixon, and Rio Vista.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:col-span-5 md:justify-end">
            <Button asChild size="lg" className="bg-ink text-ivory hover:bg-ink/90">
              <Link href="/mailing-list">
                Join the mailing list <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-ink/30 bg-transparent">
              <a href={donateHref} target={settings.donationUrl ? "_blank" : undefined} rel={settings.donationUrl ? "noopener noreferrer" : undefined}>
                Make a gift
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
