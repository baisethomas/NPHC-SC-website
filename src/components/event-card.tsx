'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, ExternalLink, Users, Info } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitizer";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Event } from "@/lib/definitions";
import { RSVPButton } from "@/components/rsvp-button";
import { useState } from "react";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Safety check - ensure event has required fields
  if (!event || !event.title || !event.slug) {
    console.error('Invalid event data:', event);
    return null;
  }

  return (
    <>
      <Card className="flex flex-col overflow-hidden">
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
            {event.description && event.description.includes('<') && event.description.includes('>') ? (
              <div 
                className="prose prose-sm max-w-none line-clamp-3"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
              />
            ) : event.description ? (
              <p className="line-clamp-3">{event.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No description available.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setIsDialogOpen(true)}>
            View Details
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">{event.title}</DialogTitle>
            <DialogDescription>
              Full event details
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
              <Image 
                src={event.image} 
                alt={event.title} 
                fill 
                className="object-contain p-4" 
                data-ai-hint={event.image_hint} 
              />
            </div>
            
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
            
            <div className="flex gap-2 pt-4 border-t">
              {event.eventType === 'internal' && event.rsvpEnabled ? (
                <RSVPButton event={event} />
              ) : event.eventType === 'external' && event.externalLink ? (
                <Button asChild size="lg" className="flex-1">
                  <a href={event.externalLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Register on External Site
                  </a>
                </Button>
              ) : event.eventType === 'external' && event.rsvpLink ? (
                <Button asChild size="lg" className="flex-1">
                  <a href={event.rsvpLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </a>
                </Button>
              ) : (
                <Button size="lg" variant="outline" className="flex-1">
                  <Info className="h-4 w-4 mr-2" />
                  More Information Coming Soon
                </Button>
              )}
              <Button asChild variant="outline" size="lg">
                <Link href={`/events/${event.slug}`}>View Full Page</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
