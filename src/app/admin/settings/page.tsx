"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getSiteSettingsForAdmin, updateSiteSettings } from "./actions";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
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
  meetingCadence: z.string().trim().max(160, "Keep the meeting line under 160 characters."),
  yearChartered: z.string().trim().regex(/^(\d{4})?$/, "Enter a four-digit year."),
  statChapters: z.string().trim().max(20),
  statScholarships: z.string().trim().max(20),
  statServiceHours: z.string().trim().max(20),
  statMembers: z.string().trim().max(20),
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
  meetingCadence: "",
  yearChartered: "",
  statChapters: "",
  statScholarships: "",
  statServiceHours: "",
  statMembers: "",
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
    <div className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Contact details, social links, stats, and the donation link shown on the public website. Leave a field blank to hide it."
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <SettingsSection
            title="Contact Info"
            description="Shown on the Contact page."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Council facts"
            description="Shown in the footer and the homepage stats bar. Leave a number blank to hide that stat."
          >
              <FormField
                control={form.control}
                name="yearChartered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year chartered</FormLabel>
                    <FormControl>
                      <Input placeholder="1998" inputMode="numeric" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="meetingCadence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting cadence</FormLabel>
                    <FormControl>
                      <Input placeholder="General body meets the second Thursday of each month." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="statChapters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chapters represented</FormLabel>
                      <FormControl>
                        <Input placeholder="12" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statMembers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Active members</FormLabel>
                      <FormControl>
                        <Input placeholder="200+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statScholarships"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scholarship dollars awarded</FormLabel>
                      <FormControl>
                        <Input placeholder="$25,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="statServiceHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service hours this year</FormLabel>
                      <FormControl>
                        <Input placeholder="1,500" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
          </SettingsSection>

          <SettingsSection
            title="Social Links"
            description="Icons appear in the site footer only for links that are set."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Donations"
            description="Where the Donate buttons on the Donations page send visitors."
          >
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
          </SettingsSection>

          <SettingsSection
            title="Footer"
            description="Text shown after the copyright year in the site footer."
          >
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
          </SettingsSection>

          <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50/95 px-4 py-3 backdrop-blur lg:-mx-8 lg:px-8">
            {form.formState.isDirty && !isSaving && (
              <span className="text-sm text-slate-500">Unsaved changes</span>
            )}
            <Button
              type="submit"
              disabled={isLoading || isSaving || !form.formState.isDirty}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-6 border-b border-border py-8 first:pt-0 md:grid-cols-[240px_1fr]">
      <div>
        <h3 className="font-headline text-lg font-bold leading-tight">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="max-w-xl space-y-4">{children}</div>
    </section>
  );
}
