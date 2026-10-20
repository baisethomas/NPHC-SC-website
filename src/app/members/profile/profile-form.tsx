'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DIVINE_NINE_SHORT_NAMES } from '@/lib/divine-nine-brand';
import { updateOwnProfile } from './actions';
import type { OwnProfileInput } from './schema';

const NONE = '__none';

const schema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  organization: z.string(),
  chapter: z.string().trim().max(120, 'Chapter name is too long.'),
  phone: z.string().trim().max(30, 'Phone number is too long.'),
  avatarUrl: z
    .string()
    .trim()
    .url('Enter a full https:// link.')
    .startsWith('https://', 'Photo links must start with https://')
    .or(z.literal('')),
  showInDirectory: z.boolean(),
});

export function ProfileForm({ initial }: { initial: OwnProfileInput }) {
  const { toast } = useToast();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: initial,
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setSaving(true);
    try {
      const result = await updateOwnProfile({ ...values, organization: values.organization === NONE ? '' : values.organization });
      if ('success' in result) {
        toast({ title: 'Profile saved', description: 'Your directory listing is up to date.' });
        form.reset(values);
        router.refresh();
      } else {
        toast({ variant: 'destructive', title: 'Could not save', description: result.error });
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} autoComplete="name" />
              </FormControl>
              <FormDescription>How you appear in the directory and on RSVPs.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="organization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || NONE}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your organization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>Not listed</SelectItem>
                    {DIVINE_NINE_SHORT_NAMES.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chapter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chapter</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Eta Lambda Lambda" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="(707) 555-0123" autoComplete="tel" {...field} />
                </FormControl>
                <FormDescription>Only visible to signed-in members.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Photo link (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://…" {...field} />
                </FormControl>
                <FormDescription>A link to a photo of you. Uploads are coming later.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="showInDirectory"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <FormLabel>Show me in the member directory</FormLabel>
                <FormDescription>Turn this off to hide your profile from other members.</FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-3">
          {form.formState.isDirty && !saving && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
          <Button type="submit" disabled={saving || !form.formState.isDirty} className="bg-ink text-ivory hover:bg-ink/90">
            {saving ? 'Saving…' : 'Save profile'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
