import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";

const events = [
  {
    title: "Annual Scholarship Gala",
    date: "October 26, 2024",
    time: "6:00 PM - 10:00 PM",
    location: "The Wednesday Club of Suisun",
    description: "Join us for an elegant evening of dining and celebration as we award scholarships to deserving local students. Formal attire requested.",
    image: "https://placehold.co/600x400.png",
    image_hint: "gala event",
    rsvpLink: "#"
  },
  {
    title: "Meet the Greeks Community Day",
    date: "September 5, 2024",
    time: "12:00 PM - 4:00 PM",
    location: "Solano Community College Quad",
    description: "A fun-filled day for the community to meet members of the Divine Nine, enjoy music, food, and learn about what we do.",
    image: "https://placehold.co/600x400.png",
    image_hint: "community fair",
    rsvpLink: "#"
  },
  {
    title: "Annual Summer Cookout",
    date: "August 10, 2024",
    time: "12:00 PM - 5:00 PM",
    location: "Fairfield Community Park",
    description: "Bring your family and friends for our annual summer cookout. Food, games, and fellowship for all ages.",
    image: "https://placehold.co/600x400.png",
    image_hint: "family picnic",
    rsvpLink: "#"
  },
  {
    title: "Financial Literacy Workshop",
    date: "November 12, 2024",
    time: "7:00 PM - 8:30 PM",
    location: "Virtual Event (Zoom)",
    description: "A free virtual workshop open to the public, covering topics like budgeting, investing, and building credit.",
    image: "https://placehold.co/600x400.png",
    image_hint: "finance workshop",
    rsvpLink: "#"
  },
];

export default function EventsPage() {
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
              <Card key={event.title} className="flex flex-col overflow-hidden">
                <div className="relative h-64 w-full">
                  <Image src={event.image} alt={event.title} layout="fill" objectFit="cover" data-ai-hint={event.image_hint} />
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
                    <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer">RSVP / Learn More</a>
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
