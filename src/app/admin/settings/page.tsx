"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { getSiteSettingsForAdmin, updateSiteSettings } from "./actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-2xl font-bold text-slate-900">Site Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage the contact details, social links, and donation link shown on the
          public website. Leave a field blank to hide it.
        </p>
      </div>
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
    <Card className="border-slate-200 shadow-none">
      <CardContent className="grid gap-6 p-6 md:grid-cols-[240px_1fr]">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}
