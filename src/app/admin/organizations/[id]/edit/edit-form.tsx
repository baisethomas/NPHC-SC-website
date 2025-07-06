
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateOrganization } from "../../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { Organization } from "@/lib/definitions";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
  link: z.string().url("Please enter a valid URL."),
  president: z.string().min(2, "President name must be at least 2 characters."),
});

export function EditOrganizationForm({ organization }: { organization: Organization }) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      link: organization.link,
      president: organization.president,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateOrganization({ id: organization.id, ...values });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.error,
        });
      } else {
        toast({
          title: "Organization Updated!",
          description: "The organization has been updated successfully.",
        });
        router.push("/admin/organizations");
        router.refresh();
      }
    } catch (error) {
       console.error("Update failed:", error);
       const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
       toast({
        variant: "destructive",
        title: "Update Error",
        description: `An unexpected error occurred: ${errorMessage}`,
       });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Organization</CardTitle>
        <CardDescription>Update the details for "{organization.name} - {organization.chapter}".</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="link" render={({ field }) => (
              <FormItem>
                <FormLabel>Website Link</FormLabel>
                <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="president" render={({ field }) => (
              <FormItem>
                <FormLabel>President Name</FormLabel>
                <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
