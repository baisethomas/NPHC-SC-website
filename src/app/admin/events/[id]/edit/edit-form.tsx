
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, LoaderCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { LocationAutocomplete } from "@/components/location-autocomplete";

import { uploadFile } from "@/lib/storage";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import type { Event } from "@/lib/definitions";
import Image from "next/image";

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
  image: z
    .any()
    .optional() // Make image optional
    .refine(
        (files) => !files || files.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE,
        `Max file size is 5MB.`
    )
    .refine(
        (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
        ".jpg, .jpeg, .png and .webp files are accepted."
    ),
});

export function EditEventForm({ event }: { event: Event }) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...event,
      date: new Date(event.date), // Convert date string to Date object
      image: undefined,
    },
  });

  const fileRef = form.register("image");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let imageUrl = event.image; // Default to old image
      const imageFile = values.image?.[0] as File | undefined;

      if (imageFile) {
        // If a new image is uploaded, upload it and get the new URL
        imageUrl = await uploadFile(imageFile);
      }

      const formattedDate = format(values.date, "MMMM d, yyyy");

      const updatedEvent: Event = {
        ...event, // Keep original id, slug, etc.
        title: values.title,
        date: formattedDate,
        time: values.time,
        location: values.location,
        description: values.description,
        image: imageUrl, // Use new or old URL
      };

      await setDoc(doc(db, "events", event.id), updatedEvent);

      toast({
        title: "Event Updated!",
        description: "The event has been updated successfully.",
      });

      router.push("/admin/events");
      router.refresh();

    } catch (error) {
      console.error("Event update failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: `There was a problem updating the event: ${errorMessage}`,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Event</CardTitle>
        <CardDescription>Update the details for &quot;{event.title}&quot;.</CardDescription>
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
                          disabled={(date) => date < new Date("1900-01-01")}
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
            
            <div className="space-y-2">
                <Label>Current Image</Label>
                <div className="w-full max-w-[200px] h-[150px] bg-muted rounded-md border relative">
                  <Image src={event.image} alt={event.title} fill className="p-2 object-contain" />
                </div>
            </div>

            <FormField control={form.control} name="image" render={() => (
                <FormItem>
                    <FormLabel>Upload New Image (Optional)</FormLabel>
                    <FormControl>
                        <Input type="file" {...fileRef} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Join us for an elegant evening..." className="min-h-[150px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <><LoaderCircle className="animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
