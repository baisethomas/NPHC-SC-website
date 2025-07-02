import { getEventBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await getEventBySlug(params.slug);

  if (!event) {
    notFound();
  }

  return (
    <div className="container py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <Image
            src={event.image}
            alt={event.title}
            width={800}
            height={600}
            className="rounded-lg shadow-lg object-cover w-full aspect-[4/3]"
            data-ai-hint={event.image_hint}
          />
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-headline font-bold">{event.title}</h1>
          
          <div className="space-y-4 text-lg">
            <div className="flex items-center text-muted-foreground">
              <Calendar className="mr-3 h-5 w-5 text-primary" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Clock className="mr-3 h-5 w-5 text-primary" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-3 h-5 w-5 text-primary" />
              <span>{event.location}</span>
            </div>
          </div>
          
          <p className="text-foreground/80 leading-relaxed">{event.description}</p>
          
          <Button asChild size="lg" className="mt-4">
            <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
              RSVP / Learn More
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
