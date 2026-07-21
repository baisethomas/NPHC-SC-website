"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getSiteSettingsForAdmin, updateSiteSettings } from "./actions";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const optionalHttpsUrl = z
  .string()
  .trim()
  .url("Please enter a valid URL.")
  .startsWith("https://", "URL must start with https://")
  .or(z.literal(""));

const formSchema = z.object({
  contactEmail: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .or(z.literal("")),
  contactPhone: z.string().trim().max(50, "Phone number is too long."),
  mailingAddress: z.string().trim().max(500, "Mailing address is too long."),
  facebookUrl: optionalHttpsUrl,
  instagramUrl: optionalHttpsUrl,
  twitterUrl: optionalHttpsUrl,
  donationUrl: optionalHttpsUrl,
  footerText: z.string().trim().max(300, "Footer text is too long."),
});

type FormValues = z.infer<typeof formSchema>;

const emptyValues: FormValues = {
  contactEmail: "",
  contactPhone: "",
  mailingAddress: "",
  facebookUrl: "",
  instagramUrl: "",
  twitterUrl: "",
  donationUrl: "",
  footerText: "",
};

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      try {
        const result = await getSiteSettingsForAdmin();
        if (cancelled) return;
        if ("settings" in result) {
          form.reset(result.settings);
        } else {
          toast({
            variant: "destructive",
            title: "Could not load settings",
            description: result.error,
          });
        }
      } catch {
        if (!cancelled) {
          toast({
            variant: "destructive",
            title: "Could not load settings",
            description: "An unexpected error occurred. Please refresh the page.",
          });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [form, toast]);

  async function onSubmit(values: FormValues) {
    setIsSaving(true);
    try {
      const result = await updateSiteSettings(values);
      if ("success" in result) {
        toast({
          title: "Settings Saved",
          description: "Your site settings have been updated.",
        });
        form.reset(values);
      } else {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: result.error,
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>
          Manage the contact details, social links, and donation link shown on the
          public website. Leave a field blank to hide it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Contact Info</h3>
                <p className="text-sm text-muted-foreground">
                  Shown on the Contact page.
                </p>
              </div>
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="info@nphcsolano.org" {...field} />
                    </FormControl>
                    <FormDescription>
                      If blank, info@nphcsolano.org is used.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(707) 555-0123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mailingAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mailing Address (optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={"P.O. Box 123\nFairfield, CA 94533"}
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Social Links</h3>
                <p className="text-sm text-muted-foreground">
                  Icons appear in the site footer only for links that are set.
                </p>
              </div>
              <FormField
                control={form.control}
                name="facebookUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://facebook.com/nphcsolano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagramUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://instagram.com/nphcsolano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="twitterUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter / X URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://x.com/nphcsolano" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Donations</h3>
                <p className="text-sm text-muted-foreground">
                  Where the Donate buttons on the Donations page send visitors.
                </p>
              </div>
              <FormField
                control={form.control}
                name="donationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Donation URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://donate.example.org/nphc-solano"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      If blank, donation buttons show an &quot;online donations coming
                      soon&quot; note instead.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Separator />

            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Footer</h3>
                <p className="text-sm text-muted-foreground">
                  Text shown after the copyright year in the site footer.
                </p>
              </div>
              <FormField
                control={form.control}
                name="footerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Text (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="NPHC of Solano County. All Rights Reserved."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <Button type="submit" disabled={isLoading || isSaving}>
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
