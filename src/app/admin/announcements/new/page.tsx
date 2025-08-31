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
import { createAnnouncement } from "../actions";
import { uploadAnnouncementImage } from "@/lib/storage";
import { AnnouncementPreview } from "@/components/ui/content-preview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string().min(2, "Date is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  status: z.enum(['draft', 'published', 'scheduled']).default('published'),
  scheduledDate: z.string().optional(),
  image: z
    .any()
    .refine((files) => !files || files.length === 0 || files.length === 1, "Image must be a single file.")
    .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine((files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), ".jpg, .jpeg, .png and .webp files are accepted."),
}).refine((data) => {
  if (data.status === 'scheduled' && !data.scheduledDate) {
    return false;
  }
  return true;
}, {
  message: "Scheduled date is required when status is scheduled",
  path: ["scheduledDate"],
});

export default function NewAnnouncementPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      description: "",
      status: "published" as const,
      scheduledDate: "",
      image: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    let imageUrl = "";
    if (values.image && values.image.length > 0) {
      imageUrl = await uploadAnnouncementImage(values.image[0]);
    }
    const result = await createAnnouncement({
      ...values,
      imageUrl,
    });

    if (result?.error) {
       toast({
        variant: "destructive",
        title: "Submission Error",
        description: result.error,
       });
    } else {
       toast({
        title: "Announcement Created!",
        description: "The new announcement has been added successfully.",
      });
      router.push("/admin/announcements");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Announcement</CardTitle>
        <CardDescription>Fill out the form below to add a new announcement to the website.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="Annual Scholarship Gala..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl><Input placeholder="August 15, 2024" {...field} /></FormControl>
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
                    placeholder="Join us for our biggest fundraising event... You can use formatting, headings, lists, and more."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="image" render={() => (
              <FormItem>
                <FormLabel>Image (optional)</FormLabel>
                <FormControl><Input type="file" accept="image/*" {...form.register("image")} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              
              {form.watch("status") === "scheduled" && (
                <FormField control={form.control} name="scheduledDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Publish Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              )}
            </div>
            
            <div className="flex gap-4">
              <AnnouncementPreview 
                announcement={{
                  title: form.watch("title"),
                  date: form.watch("date"),
                  description: form.watch("description"),
                  imageUrl: form.watch("image")?.[0] ? URL.createObjectURL(form.watch("image")[0]) : undefined
                }}
              />
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Creating..." : "Create Announcement"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
