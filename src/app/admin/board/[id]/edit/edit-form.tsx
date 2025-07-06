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
import { updateBoardMember } from "../../actions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { BoardMember } from "@/lib/data";
import { LoaderCircle } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  title: z.string().min(2, "Title must be at least 2 characters."),
});

export function EditBoardMemberForm({ member }: { member: BoardMember }) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: member.name,
      title: member.title,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await updateBoardMember({ id: member.id, ...values });

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: result.error,
        });
      } else {
        toast({
          title: "Board Member Updated!",
          description: "The board member has been updated successfully.",
        });
        router.push("/admin/board");
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
        <CardTitle>Edit Board Member</CardTitle>
        <CardDescription>Update the details for "{member.name}".</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="President" {...field} /></FormControl>
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
