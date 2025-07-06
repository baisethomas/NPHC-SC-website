import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";
import { getEvents } from "@/lib/data";

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div>
      <section className="bg-muted py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-headline font-bold">Upcoming Events</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            Stay connected and join us for our upcoming community events, workshops, and celebrations.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event) => (
              <Card key={event.slug} className="flex flex-col overflow-hidden">
                <div className="relative h-64 w-full bg-muted">
                  <Image src={event.image} alt={event.title} layout="fill" objectFit="contain" data-ai-hint={event.image_hint} />
                </div>
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="flex items-start text-sm text-muted-foreground mb-3 space-x-3">
                    <Calendar className="h-4 w-4 mt-1 shrink-0" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-start text-sm text-muted-foreground mb-3 space-x-3">
                    <Clock className="h-4 w-4 mt-1 shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-start text-sm text-muted-foreground mb-3 space-x-3">
                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <p className="text-foreground/80 mt-4">{event.description}</p>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.slug}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
