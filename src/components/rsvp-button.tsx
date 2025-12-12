'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createRSVP } from '@/app/events/rsvp-actions';
import { useToast } from '@/hooks/use-toast';
import { Users, Check } from 'lucide-react';
import { type Event } from '@/lib/definitions';

const rsvpFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  guestCount: z.number().min(1).max(10),
});

interface RSVPButtonProps {
  event: Event;
  hasRSVPd?: boolean;
}

export function RSVPButton({ event, hasRSVPd = false }: RSVPButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rsvpComplete, setRsvpComplete] = useState(hasRSVPd);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof rsvpFormSchema>>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      guestCount: 1,
    },
  });

  const onSubmit = async (values: z.infer<typeof rsvpFormSchema>) => {
    setIsSubmitting(true);
    
    const result = await createRSVP({
      eventId: event.id,
      ...values,
    });

    if (result.error) {
      toast({
        variant: "destructive",
        title: "RSVP Failed",
        description: result.error,
      });
    } else {
      toast({
        title: "RSVP Confirmed!",
        description: "We've saved your spot. See you at the event!",
      });
      setRsvpComplete(true);
      setIsOpen(false);
      form.reset();
    }
    
    setIsSubmitting(false);
  };

  const isAtCapacity = event.maxAttendees && event.currentAttendees && 
                     event.currentAttendees >= event.maxAttendees;

  if (rsvpComplete) {
    return (
      <Button disabled className="bg-green-600 hover:bg-green-600">
        <Check className="h-4 w-4 mr-2" />
        You&apos;re Going!
      </Button>
    );
  }

  if (isAtCapacity) {
    return (
      <Button disabled variant="outline">
        Event Full
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Users className="h-4 w-4 mr-2" />
          RSVP
          {event.maxAttendees && (
            <span className="ml-2 text-sm opacity-75">
              ({event.currentAttendees || 0}/{event.maxAttendees})
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>RSVP for {event.title}</DialogTitle>
          <DialogDescription>
            {event.date} at {event.time}
            {event.maxAttendees && (
              <div className="mt-2 text-sm">
                Spots available: {event.maxAttendees - (event.currentAttendees || 0)}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (Optional)</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="guestCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Attendees</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'person' : 'people'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Confirm RSVP'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
