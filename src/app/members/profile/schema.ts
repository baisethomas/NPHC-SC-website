import { z } from 'zod';
import { DIVINE_NINE_SHORT_NAMES } from '@/lib/divine-nine-brand';

// Shared between the server action and the client form. Lives outside
// actions.ts because a "use server" module may only export async functions.

const optionalHttpsUrl = z
  .string()
  .trim()
  .url('Enter a full https:// link.')
  .startsWith('https://', 'Photo links must start with https://')
  .or(z.literal(''));

export const ownProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  organization: z.enum(['', ...DIVINE_NINE_SHORT_NAMES] as [string, ...string[]]),
  chapter: z.string().trim().max(120, 'Chapter name is too long.'),
  phone: z.string().trim().max(30, 'Phone number is too long.'),
  avatarUrl: optionalHttpsUrl,
  showInDirectory: z.boolean(),
});

export type OwnProfileInput = z.infer<typeof ownProfileSchema>;
