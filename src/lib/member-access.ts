import { adminDb } from '@/lib/firebase-admin';

export type MembershipStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

export interface MemberAccessRecord {
  authUid?: string;
  membershipStatus?: MembershipStatus;
  isActive?: boolean;
  role?: string;
  organizationId?: string;
}

/**
 * Finds a member profile linked to a Firebase Auth UID. New records should
 * use the UID as the document ID; the authUid lookup supports legacy IDs.
 */
export async function getMemberAccessRecord(
  uid: string
): Promise<MemberAccessRecord | null> {
  if (!adminDb) return null;

  const directRecord = await adminDb.collection('members').doc(uid).get();
  if (directRecord.exists) {
    return directRecord.data() as MemberAccessRecord;
  }

  const linkedRecord = await adminDb
    .collection('members')
    .where('authUid', '==', uid)
    .limit(1)
    .get();

  return linkedRecord.empty
    ? null
    : (linkedRecord.docs[0].data() as MemberAccessRecord);
}

export function isApprovedActiveMember(record: MemberAccessRecord | null): boolean {
  return record?.membershipStatus === 'approved' && record.isActive === true;
}
