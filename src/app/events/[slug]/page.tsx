import { getEventBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ExternalLink, Info } from 'lucide-react';
import { RSVPButton } from '@/components/rsvp-button';

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
            className="rounded-lg shadow-lg object-contain w-full aspect-[4/3] bg-muted"
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
          
          <div className="text-foreground/80 leading-relaxed">
            {event.description.includes('<') && event.description.includes('>') ? (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description }}
              />
            ) : (
              <p>{event.description}</p>
            )}
          </div>
          
          <div className="mt-6">
            {event.eventType === 'internal' && event.rsvpEnabled ? (
              <RSVPButton event={event} />
            ) : event.eventType === 'external' && event.externalLink ? (
              <Button asChild size="lg" className="w-full">
                <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Register on External Site
                </a>
              </Button>
            ) : event.eventType === 'external' && event.rsvpLink ? (
              <Button asChild size="lg" className="w-full">
                <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn More
                </a>
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="w-full">
                <Info className="h-4 w-4 mr-2" />
                More Information Coming Soon
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
