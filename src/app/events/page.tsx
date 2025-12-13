import { getEvents } from "@/lib/data";
import { EventCalendar } from "@/components/event-calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventCard } from "@/components/event-card";

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
                  <EventCard key={event.slug} event={event} />
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
