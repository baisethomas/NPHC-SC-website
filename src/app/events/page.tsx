import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ExternalLink, Users, Info } from "lucide-react";
import { getEvents } from "@/lib/data";
import { EventCalendar } from "@/components/event-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { sanitizeHtml } from "@/lib/sanitizer";

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
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="list">Event List</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="space-y-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {events.map((event) => (
                  <Card key={event.slug} className="flex flex-col overflow-hidden">
                    <div className="relative h-64 w-full bg-muted">
                      <Image src={event.image} alt={event.title} fill className="object-contain" data-ai-hint={event.image_hint} />
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
                      <div className="text-foreground/80 mt-4">
                        {event.description.includes('<') && event.description.includes('>') ? (
                          <div 
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
                          />
                        ) : (
                          <p>{event.description}</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button asChild variant="outline" className="flex-1">
                        <Link href={`/events/${event.slug}`}>View Details</Link>
                      </Button>
                      
                      {event.eventType === 'internal' && event.rsvpEnabled ? (
                        <Button asChild className="flex-1">
                          <Link href={`/events/${event.slug}`}>
                            <Users className="h-4 w-4 mr-2" />
                            RSVP
                          </Link>
                        </Button>
                      ) : event.eventType === 'external' && event.externalLink ? (
                        <Button asChild className="flex-1">
                          <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Register
                          </a>
                        </Button>
                      ) : event.eventType === 'external' && event.rsvpLink ? (
                        <Button asChild className="flex-1">
                          <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Learn More
                          </a>
                        </Button>
                      ) : (
                        <Button disabled variant="secondary" className="flex-1">
                          <Info className="h-4 w-4 mr-2" />
                          Info Only
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="calendar" className="space-y-0">
              <EventCalendar events={events} />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
