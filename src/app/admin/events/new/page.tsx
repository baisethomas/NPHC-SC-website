
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

import { uploadFile } from "@/lib/storage";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { Event } from "@/lib/definitions";
import { slugify } from "@/lib/definitions";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { EventPreview } from "@/components/ui/content-preview";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.date({
    required_error: "A date for the event is required.",
  }),
  time: z.string().min(2, "Time is required."),
  location: z.string().min(2, "Location is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  eventType: z.enum(['internal', 'external', 'info_only']),
  rsvpEnabled: z.boolean(),
  externalLink: z.string().url().optional().or(z.literal("")),
  maxAttendees: z.number().optional(),
  image: z
    .any()
    .refine((files) => files?.length == 1, "Image is required.")
    .refine((files) => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted."
    ),
}).refine((data) => {
  if (data.eventType === 'external' && !data.externalLink) {
    return false;
  }
  return true;
}, {
  message: "External link is required for external events",
  path: ["externalLink"],
});

export default function NewEventPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      time: "",
      location: "",
      description: "",
      eventType: "internal" as const,
      rsvpEnabled: true,
      externalLink: "",
      maxAttendees: undefined,
      image: undefined,
    },
  });

  const fileRef = form.register("image");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const imageFile = values.image[0] as File;

    try {
      const imageUrl = await uploadFile(imageFile);
      
      const slug = slugify(values.title);

      const formattedDate = new Date(values.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const newEvent: Event = {
        id: slug,
        slug: slug,
        title: values.title,
        date: formattedDate,
        time: values.time,
        location: values.location,
        description: values.description,
        image: imageUrl,
        image_hint: "community event",
        rsvpLink: values.externalLink || "#",
        eventType: values.eventType,
        rsvpEnabled: values.rsvpEnabled,
        externalLink: values.externalLink || undefined,
        maxAttendees: values.maxAttendees,
        currentAttendees: 0,
      };

      await setDoc(doc(db, "events", slug), newEvent);

      toast({
        title: "Event Created!",
        description: "The new event has been added successfully.",
      });

      router.push("/admin/events");
      router.refresh();

    } catch (error) {
      console.error("Event creation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `There was a problem creating the event: ${errorMessage}`,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
        <CardDescription>Fill out the form below to add a new event to the website.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl><Input placeholder="Annual Gala..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="time" render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <FormControl><Input placeholder="6:00 PM - 10:00 PM" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <LocationAutocomplete field={field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="image" render={({ field }) => (
                <FormItem>
                    <FormLabel>Event Image</FormLabel>
                    <FormControl>
                        <Input type="file" {...fileRef} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <RichTextEditor 
                    content={field.value} 
                    onChange={field.onChange}
                    placeholder="Join us for an elegant evening... You can use formatting, headings, lists, and more."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
              <FormField control={form.control} name="eventType" render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="internal">NPHC Internal Event</SelectItem>
                      <SelectItem value="external">Chapter/External Event</SelectItem>
                      <SelectItem value="info_only">Information Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="rsvpEnabled" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable RSVP</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Allow people to RSVP for this event
                    </p>
                  </div>
                </FormItem>
              )} />
            </div>

            {form.watch("eventType") === "external" && (
              <FormField control={form.control} name="externalLink" render={({ field }) => (
                <FormItem>
                  <FormLabel>External Registration Link</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://eventbrite.com/event/..." 
                      {...field} 
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Link to Eventbrite, Facebook event, or other registration page
                  </p>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            {form.watch("eventType") === "internal" && form.watch("rsvpEnabled") && (
              <FormField control={form.control} name="maxAttendees" render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Attendees (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="50" 
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <p className="text-sm text-muted-foreground">
                    Leave empty for unlimited capacity
                  </p>
                  <FormMessage />
                </FormItem>
              )} />
            )}
            
            <div className="flex gap-4">
              <EventPreview 
                event={{
                  title: form.watch("title"),
                  date: form.watch("date") ? new Date(form.watch("date")).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : undefined,
                  time: form.watch("time"),
                  location: form.watch("location"),
                  description: form.watch("description"),
                  image: form.watch("image")?.[0] ? URL.createObjectURL(form.watch("image")[0]) : undefined
                }}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
