import { getEventBySlug } from '@/lib/data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, ExternalLink, Info } from 'lucide-react';
import { RSVPButton } from '@/components/rsvp-button';
import { sanitizeHtml } from '@/lib/sanitizer';

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
      console.warn(`Event not found for slug: ${slug}`);
      notFound();
    }

    // Validate required fields
    if (!event.title || !event.image) {
      console.error(`Event missing required fields. Title: ${event.title}, Image: ${event.image}`);
      throw new Error('Event data is incomplete');
    }

    // Ensure event has id and slug
    if (!event.id) {
      event.id = event.slug || slug;
    }
    if (!event.slug) {
      event.slug = event.id || slug;
    }

    return (
      <div className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <Image
              src={event.image || '/placeholder-event.jpg'}
              alt={event.title || 'Event'}
              width={800}
              height={600}
              className="rounded-lg shadow-lg object-contain w-full aspect-[4/3] bg-muted"
              data-ai-hint={event.image_hint || 'event image'}
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-headline font-bold">{event.title}</h1>
            
            <div className="space-y-4 text-lg">
              {event.date && (
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  <span>{event.date}</span>
                </div>
              )}
              {event.time && (
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-3 h-5 w-5 text-primary" />
                  <span>{event.time}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-3 h-5 w-5 text-primary" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
            
            <div className="text-foreground/80 leading-relaxed">
              {event.description && event.description.includes('<') && event.description.includes('>') ? (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
                />
              ) : event.description ? (
                <p>{event.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description available.</p>
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
  } catch (error) {
    const resolvedParams = await params;
    console.error(`Error loading event page for slug: ${resolvedParams.slug}`, error);
    // Return a user-friendly error page instead of throwing
    return (
      <div className="container py-16 md:py-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error Loading Event</h1>
          <p className="text-muted-foreground">
            We encountered an error while loading this event. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
