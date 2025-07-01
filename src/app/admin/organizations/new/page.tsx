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
import { createOrganization } from "../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  chapter: z.string().min(2, "Chapter must be at least 2 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  link: z.string().url("Please enter a valid URL."),
});

export default function NewOrganizationPage() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      chapter: "",
      description: "",
      link: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await createOrganization(values);

    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.error,
      });
    } else {
      toast({
        title: "Organization Added!",
        description: "The new organization has been added successfully.",
      });
      router.push("/admin/organizations");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Organization</CardTitle>
        <CardDescription>Fill out the form below to add a new organization.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl><Input placeholder="Alpha Kappa Alpha Sorority, Inc." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="chapter" render={({ field }) => (
              <FormItem>
                <FormLabel>Chapter Name</FormLabel>
                <FormControl><Input placeholder="Mu Eta Omega Chapter" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem>
                <FormLabel>Website Link</FormLabel>
                <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="A short description of the organization..." className="min-h-[150px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Adding..." : "Add Organization"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
