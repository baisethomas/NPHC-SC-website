'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Calendar, Clock, MapPin } from 'lucide-react';
import { type Announcement, type Event } from '@/lib/definitions';
import { sanitizeHtml } from '@/lib/sanitizer';
import Image from 'next/image';

interface AnnouncementPreviewProps {
  announcement: Partial<Announcement>;
  trigger?: React.ReactNode;
}

interface EventPreviewProps {
  event: Partial<Event>;
  trigger?: React.ReactNode;
}

export function AnnouncementPreview({ announcement, trigger }: AnnouncementPreviewProps) {
  const isHtml = announcement.description?.includes('<') && announcement.description?.includes('>');
  const paragraphs = isHtml ? [] : announcement.description?.split('\n').filter(p => p.trim() !== '') || [];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {announcement.title}</DialogTitle>
          <DialogDescription>
            Preview how your announcement will appear on the website
          </DialogDescription>
        </DialogHeader>
        <div className="bg-background">
          <section className="py-12 bg-muted">
            <div className="container">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-headline font-bold mb-3">
                  {announcement.title || 'Your Title Here'}
                </h1>
                <div className="flex items-center justify-center text-muted-foreground mb-4">
                  <Calendar className="mr-2 h-5 w-5" />
                  <p>{announcement.date || 'Date not set'}</p>
                </div>
                {announcement.imageUrl && (
                  <div className="flex justify-center mb-6">
                    <Image
                      src={announcement.imageUrl}
                      alt={announcement.title || 'Preview'}
                      width={600}
                      height={400}
                      className="rounded-lg max-h-96 w-auto object-contain shadow"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
          <section className="py-16 md:py-24">
            <div className="container">
              <div className="max-w-3xl mx-auto space-y-6 text-lg leading-relaxed text-foreground/90">
                {isHtml ? (
                  <div 
                    className="prose prose-lg max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(announcement.description || '') }}
                  />
                ) : (
                  paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                )}
                {!announcement.description && (
                  <p className="text-muted-foreground italic">Description will appear here...</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EventPreview({ event, trigger }: EventPreviewProps) {
  const isHtml = event.description?.includes('<') && event.description?.includes('>');

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preview: {event.title}</DialogTitle>
          <DialogDescription>
            Preview how your event will appear on the website
          </DialogDescription>
        </DialogHeader>
        <div className="container py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              {event.image ? (
                <Image
                  src={event.image}
                  alt={event.title || 'Preview'}
                  width={600}
                  height={450}
                  className="rounded-lg shadow-lg object-contain w-full aspect-[4/3] bg-muted"
                />
              ) : (
                <div className="rounded-lg shadow-lg w-full aspect-[4/3] bg-muted flex items-center justify-center text-muted-foreground">
                  Event image will appear here
                </div>
              )}
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl font-headline font-bold">
                {event.title || 'Your Event Title'}
              </h1>
              
              <div className="space-y-4 text-lg">
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  <span>{event.date || 'Date not set'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Clock className="mr-3 h-5 w-5 text-primary" />
                  <span>{event.time || 'Time not set'}</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <MapPin className="mr-3 h-5 w-5 text-primary" />
                  <span>{event.location || 'Location not set'}</span>
                </div>
              </div>
              
              <div className="text-foreground/80 leading-relaxed">
                {event.description ? (
                  isHtml ? (
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.description) }}
                    />
                  ) : (
                    <p>{event.description}</p>
                  )
                ) : (
                  <p className="text-muted-foreground italic">Description will appear here...</p>
                )}
              </div>
              
              <Button size="lg" className="mt-4">
                RSVP / Learn More
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
