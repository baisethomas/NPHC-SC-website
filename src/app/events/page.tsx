import Link from "next/link";
import { Mail } from "lucide-react";
import { getEvents } from "@/lib/data";
import { upcomingEvents, pastEvents } from "@/lib/events";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { EventsBrowser } from "@/components/site/events-browser";

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = upcomingEvents(events);
  const past = pastEvents(events);

  return (
    <div>
      <PageHero
        eyebrow="Calendar"
        title="Events"
        lede="Council events, chapter programs, and community gatherings across Solano County. Filter by the organization hosting, or switch to the calendar view."
      >
        <Button asChild variant="outline" className="border-ivory/30 bg-transparent text-ivory hover:bg-ivory/10 hover:text-ivory">
          <Link href="/mailing-list">
            <Mail className="h-4 w-4" /> Get event announcements
          </Link>
        </Button>
      </PageHero>

      <section className="py-12 md:py-16">
        <div className="container">
          <EventsBrowser upcoming={upcoming} past={past} />
        </div>
      </section>
    </div>
  );
}
