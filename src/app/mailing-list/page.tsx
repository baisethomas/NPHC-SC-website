"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { subscribeToMailingList } from "./actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { PageHero } from "@/components/site/page-hero";

const formSchema = z.object({
  firstName: z.string().min(1, {
    message: "First name is required.",
  }),
  lastName: z.string().min(1, {
    message: "Last name is required.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  privacy: z.boolean().refine((value) => value, {
    message: "You must agree to receive communications to subscribe.",
  }),
});

const WHAT_YOU_GET = [
  { title: "Event announcements", text: "Council and chapter events across Solano County, with enough notice to plan." },
  { title: "Scholarship deadlines", text: "When applications open and close, so no student misses the window." },
  { title: "Council news", text: "Leadership updates, program launches, and ways to get involved." },
];

export default function MailingListPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      privacy: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await subscribeToMailingList({
        email: values.email,
        name: `${values.firstName} ${values.lastName}`.trim(),
      });
      if (result.success) {
        toast({
          title: "You're Subscribed!",
          description: "Thanks for joining our mailing list. Watch your inbox for updates.",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Subscription Failed",
          description: result.error ?? "Something went wrong. Please try again.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Subscription Failed",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <PageHero
        eyebrow="Mailing list"
        title="Hear about it first."
        lede="Event announcements, scholarship deadlines, and council news. A few emails a month, and you can leave any time."
      />
      <div className="container grid gap-12 py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <h2 className="font-headline text-3xl font-bold leading-tight [text-wrap:balance] md:text-4xl">What you will get</h2>
          <ol className="mt-6 divide-y divide-border border-y border-border">
            {WHAT_YOU_GET.map((item, i) => (
              <li key={item.title} className="grid grid-cols-[3rem_1fr] gap-4 py-5">
                <span className="font-headline text-2xl font-bold tabular-nums text-gold">0{i + 1}</span>
                <div>
                  <p className="font-headline text-lg font-bold leading-snug">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            We respect your privacy. Your information is only used to send updates about NPHC Solano County, and every email has an unsubscribe link.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-lg border border-border bg-card p-6 md:p-8">
            <p className="eyebrow mb-2">Subscribe</p>
            <h2 className="font-headline text-2xl font-bold">Join the mailing list</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          I agree to receive communications from NPHC Solano County and understand I can unsubscribe at any time.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full bg-gold text-ink hover:bg-gold/90" disabled={isSubmitting}>
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
