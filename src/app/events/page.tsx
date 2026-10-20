import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getEvents } from "@/lib/data";
import { upcomingEvents, pastEvents, pickSpotlightEvent } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { EventBanner } from "@/components/site/event-banner";
import { EventsBrowser } from "@/components/site/events-browser";

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = upcomingEvents(events);
  const past = pastEvents(events);
  const spotlight = pickSpotlightEvent(events);
  const rest = upcoming.filter((e) => e.id !== spotlight?.id);

  return (
    <div>
      <PageHero
        eyebrow="Calendar"
        title="Events"
        lede="Council events, chapter programs, and community gatherings across Solano County. Filter by the organization hosting, or switch to the calendar view."
      >
        <Button asChild variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
          <Link href="/mailing-list">
            Get event announcements <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </PageHero>

      {spotlight && (
        <section className="pt-10 md:pt-14">
          <div className="container">
            <EventBanner event={spotlight} />
          </div>
        </section>
      )}

      <section className="py-12 md:py-16">
        <div className="container">
          <EventsBrowser upcoming={rest} past={past} />
        </div>
      </section>
    </div>
  );
}
