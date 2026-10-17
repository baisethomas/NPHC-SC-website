import { adminDb } from '@/lib/firebase-admin';
import type { MemberProfile } from '@/lib/definitions';

/**
 * Reads the signed-in member's own profile document. Looks up by doc id first
 * (members/{uid}), then by the legacy `authUid` field. Server-only.
 */
export async function getOwnMemberProfile(uid: string): Promise<MemberProfile | null> {
  if (!adminDb) return null;

  const direct = await adminDb.collection('members').doc(uid).get();
  if (direct.exists) {
    return { id: direct.id, ...(direct.data() as Omit<MemberProfile, 'id'>) };
  }

  const linked = await adminDb.collection('members').where('authUid', '==', uid).limit(1).get();
  if (!linked.empty) {
    const doc = linked.docs[0];
    return { id: doc.id, ...(doc.data() as Omit<MemberProfile, 'id'>) };
  }
  return null;
}
