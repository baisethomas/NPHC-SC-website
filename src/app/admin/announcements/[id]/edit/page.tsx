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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAnnouncementById, updateAnnouncement } from "../../actions";
import { uploadAnnouncementImage } from "@/lib/storage";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  date: z.string().min(2, "Date is required."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  image: z
    .any()
    .refine((files) => !files || files.length === 0 || files.length === 1, "Image must be a single file.")
    .refine((files) => !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine((files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0].type), ".jpg, .jpeg, .png and .webp files are accepted."),
});

export default function EditAnnouncementPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState({ title: "", date: "", description: "", imageUrl: "" });

  useEffect(() => {
    async function fetchData() {
      const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
      if (!id) return setLoading(false);
      const data = await getAnnouncementById(id);
      if (data) {
        setInitialData({
          title: data.title || "",
          date: data.date || "",
          description: data.description || "",
          imageUrl: data.imageUrl || "",
        });
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...initialData, image: undefined },
    values: { ...initialData, image: undefined },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';
    if (!id) return;
    let imageUrl = initialData.imageUrl || "";
    if (values.image && values.image.length > 0) {
      imageUrl = await uploadAnnouncementImage(values.image[0]);
    }
    const result = await updateAnnouncement(id, {
      ...values,
      imageUrl,
    });
    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Update Error",
        description: result.error,
      });
    } else {
      toast({
        title: "Announcement Updated!",
        description: "The announcement has been updated successfully.",
      });
      router.push("/admin/announcements");
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Announcement</CardTitle>
        <CardDescription>Update the details for this announcement.</CardDescription>
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
                <FormControl><Textarea placeholder="Join us for our biggest fundraising event..." className="min-h-[150px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="image" render={({ field }) => (
              <FormItem>
                <FormLabel>Image (optional)</FormLabel>
                {initialData.imageUrl && (
                  <div className="mb-2">
                    <img src={initialData.imageUrl} alt="Current" className="max-h-32 rounded" />
                  </div>
                )}
                <FormControl><Input type="file" accept="image/*" {...form.register("image")} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Updating..." : "Update Announcement"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 