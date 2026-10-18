import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import type { MemberProfile } from '@/lib/definitions';

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && '_seconds' in (value as Record<string, unknown>)) {
    const seconds = Number((value as { _seconds: number })._seconds);
    return new Date(seconds * 1000).toISOString();
  }
  return undefined;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * Builds a plain, serializable MemberProfile from a Firestore `members` doc.
 * Member docs carry extra server-side fields (Timestamps, nested prefs, role
 * arrays) that must not be spread into props handed to client components.
 */
export function toMemberProfile(id: string, data: FirebaseFirestore.DocumentData): MemberProfile {
  const status = data.membershipStatus;
  return {
    id,
    authUid: optionalString(data.authUid),
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    email: typeof data.email === 'string' ? data.email : '',
    role: typeof data.role === 'string' ? data.role : '',
    organization: typeof data.organization === 'string' ? data.organization : '',
    chapter: optionalString(data.chapter),
    avatarUrl: optionalString(data.avatarUrl),
    phone: optionalString(data.phone),
    showInDirectory: typeof data.showInDirectory === 'boolean' ? data.showInDirectory : undefined,
    joinedAt: toIsoString(data.joinedAt ?? data.joinDate),
    membershipStatus:
      status === 'pending' || status === 'approved' || status === 'suspended' || status === 'rejected'
        ? status
        : undefined,
    isActive: typeof data.isActive === 'boolean' ? data.isActive : undefined,
  };
}

/**
 * Reads the signed-in member's own profile document. Looks up by doc id first
 * (members/{uid}), then by the legacy `authUid` field. Server-only.
 */
export async function getOwnMemberProfile(uid: string): Promise<MemberProfile | null> {
  if (!adminDb) return null;

  const direct = await adminDb.collection('members').doc(uid).get();
  if (direct.exists) {
    return toMemberProfile(direct.id, direct.data() ?? {});
  }

  const linked = await adminDb.collection('members').where('authUid', '==', uid).limit(1).get();
  if (!linked.empty) {
    const doc = linked.docs[0];
    return toMemberProfile(doc.id, doc.data());
  }
  return null;
}
