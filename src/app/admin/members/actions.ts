'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import admin from 'firebase-admin';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { requirePermissionSession } from '@/lib/server-auth';
import { PERMISSIONS, ROLES, normalizeRoles, type Role } from '@/lib/roles';
import { CMS_COLLECTIONS } from '@/lib/cms-collections';
import type { MembershipStatus } from '@/types/cms';

export interface AdminMemberRecord {
  id: string;
  authUid: string;
  email: string;
  displayName: string;
  roles: Role[];
  membershipStatus: MembershipStatus;
  isActive: boolean;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

type ActionResult = { success: true } | { error: string };

const MEMBERSHIP_STATUSES: readonly MembershipStatus[] = [
  'pending',
  'approved',
  'suspended',
  'rejected',
];

const uidSchema = z.string().min(1, 'A member ID is required.').max(128);

const setRolesSchema = z.object({
  uid: uidSchema,
  roles: z.array(z.enum(ROLES)).max(ROLES.length),
});

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
  organizationId: z.string().trim().max(200).optional(),
});

function toIsoString(value: unknown): string | undefined {
  if (value instanceof admin.firestore.Timestamp) {
    return value.toDate().toISOString();
  }
  if (typeof value === 'string' && value) {
    return value;
  }
  return undefined;
}

function toMembershipStatus(value: unknown): MembershipStatus {
  return MEMBERSHIP_STATUSES.includes(value as MembershipStatus)
    ? (value as MembershipStatus)
    : 'pending';
}

/**
 * Mirrors functions/src/admin/user-management.ts: strips the pre-RBAC claims
 * (`admin`, `role`) so a demotion cannot be undone by a legacy claim, then
 * writes the new `roles` claim.
 */
async function applyRoleClaims(
  auth: NonNullable<typeof adminAuth>,
  user: admin.auth.UserRecord,
  roles: Role[]
): Promise<void> {
  const { admin: _legacyAdmin, role: _legacyRole, ...retainedClaims } = user.customClaims ?? {};
  await auth.setCustomUserClaims(user.uid, {
    ...retainedClaims,
    roles,
  });
}

async function writeAuditLog(
  db: NonNullable<typeof adminDb>,
  entry: Record<string, unknown>
): Promise<void> {
  await db.collection(CMS_COLLECTIONS.AUDIT_LOGS).add({
    ...entry,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    source: 'admin-ui',
  });
}

export async function getMembers(): Promise<{
  members: AdminMemberRecord[];
  error: string | null;
}> {
  const auth = await requirePermissionSession(PERMISSIONS.MANAGE_MEMBERS);
  if (!auth.ok) return { members: [], error: auth.error };

  if (!adminDb) {
    return { members: [], error: 'Database not available' };
  }

  try {
    // No orderBy: some legacy docs are missing createdAt and a single-field
    // orderBy silently drops documents without that field. Sort in memory.
    const snapshot = await adminDb.collection(CMS_COLLECTIONS.MEMBERS).limit(500).get();

    const members = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        authUid: typeof data.authUid === 'string' && data.authUid ? data.authUid : doc.id,
        email: typeof data.email === 'string' ? data.email : '',
        displayName: typeof data.displayName === 'string' ? data.displayName : '',
        roles: normalizeRoles(data.roles),
        membershipStatus: toMembershipStatus(data.membershipStatus),
        isActive: data.isActive === true,
        organizationId:
          typeof data.organizationId === 'string' && data.organizationId
            ? data.organizationId
            : undefined,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
      } satisfies AdminMemberRecord;
    });

    members.sort((a, b) =>
      (a.displayName || a.email).localeCompare(b.displayName || b.email, 'en', {
        sensitivity: 'base',
      })
    );

    return { members, error: null };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { members: [], error: 'Failed to load members. Please try again.' };
  }
}

async function setMembershipStatus(
  uid: string,
  status: MembershipStatus,
  isActive: boolean
): Promise<ActionResult> {
  const auth = await requirePermissionSession(PERMISSIONS.APPROVE_MEMBERS);
  if (!auth.ok) return { error: auth.error };

  if (!adminDb || !adminAuth) {
    return { error: 'Server is not configured for member management.' };
  }

  const validatedUid = uidSchema.safeParse(uid);
  if (!validatedUid.success) {
    return { error: 'Invalid member ID.' };
  }

  try {
    const memberRef = adminDb.collection(CMS_COLLECTIONS.MEMBERS).doc(validatedUid.data);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      return { error: 'Member record not found.' };
    }
    const previousStatus = toMembershipStatus(memberSnap.data()?.membershipStatus);

    const update: Record<string, unknown> = {
      membershipStatus: status,
      isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // On approval, make sure the user actually gains portal access: if their
    // Auth token has no roles yet, grant the baseline `member` role.
    if (status === 'approved') {
      const userRecord = await adminAuth.getUser(validatedUid.data).catch(() => null);
      if (userRecord && normalizeRoles(userRecord.customClaims?.roles).length === 0) {
        await applyRoleClaims(adminAuth, userRecord, ['member']);
        const docRoles = normalizeRoles(memberSnap.data()?.roles);
        if (docRoles.length === 0) {
          update.roles = ['member'];
        }
      }
    }

    await memberRef.update(update);

    await writeAuditLog(adminDb, {
      action: 'set_membership_status',
      actorUid: auth.user.uid,
      targetUid: validatedUid.data,
      previousStatus,
      newStatus: status,
    });

    revalidatePath('/admin/members');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error(`Failed to set membership status to ${status}:`, error);
    return { error: 'Failed to update the member. Please try again.' };
  }
}

export async function approveMember(uid: string): Promise<ActionResult> {
  return setMembershipStatus(uid, 'approved', true);
}

export async function rejectMember(uid: string): Promise<ActionResult> {
  return setMembershipStatus(uid, 'rejected', false);
}

export async function suspendMember(uid: string): Promise<ActionResult> {
  return setMembershipStatus(uid, 'suspended', false);
}

export async function reactivateMember(uid: string): Promise<ActionResult> {
  return setMembershipStatus(uid, 'approved', true);
}

export async function setMemberRoles(uid: string, roles: Role[]): Promise<ActionResult> {
  const auth = await requirePermissionSession(PERMISSIONS.MANAGE_ROLES);
  if (!auth.ok) return { error: auth.error };

  if (!adminDb || !adminAuth) {
    return { error: 'Server is not configured for member management.' };
  }

  const validated = setRolesSchema.safeParse({ uid, roles });
  if (!validated.success) {
    return { error: 'Invalid member ID or roles.' };
  }

  const normalizedRoles = normalizeRoles(validated.data.roles);

  try {
    const userRecord = await adminAuth.getUser(validated.data.uid);
    const previousRoles = normalizeRoles(userRecord.customClaims?.roles);

    await applyRoleClaims(adminAuth, userRecord, normalizedRoles);

    await adminDb.collection(CMS_COLLECTIONS.MEMBERS).doc(validated.data.uid).set(
      {
        authUid: validated.data.uid,
        roles: normalizedRoles,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    // Role grants are the most sensitive operation in the system; every
    // change leaves a trace. auditLogs is client-write-blocked in rules.
    await writeAuditLog(adminDb, {
      action: 'set_user_roles',
      actorUid: auth.user.uid,
      targetUid: validated.data.uid,
      previousRoles,
      newRoles: normalizedRoles,
      hadLegacyAdminClaim: userRecord.customClaims?.admin === true,
    });

    revalidatePath('/admin/members');
    return { success: true };
  } catch (error) {
    console.error('Failed to set member roles:', error);
    if (error instanceof Error && error.message.includes('no user record')) {
      return { error: 'No auth account found for this member.' };
    }
    return { error: 'Failed to update roles. Please try again.' };
  }
}

export async function updateMemberProfile(
  uid: string,
  values: z.infer<typeof updateProfileSchema>
): Promise<ActionResult> {
  const auth = await requirePermissionSession(PERMISSIONS.MANAGE_MEMBERS);
  if (!auth.ok) return { error: auth.error };

  if (!adminDb) {
    return { error: 'Database not available' };
  }

  const validatedUid = uidSchema.safeParse(uid);
  if (!validatedUid.success) {
    return { error: 'Invalid member ID.' };
  }

  const validated = updateProfileSchema.safeParse(values);
  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? 'Invalid fields.' };
  }

  try {
    const memberRef = adminDb.collection(CMS_COLLECTIONS.MEMBERS).doc(validatedUid.data);
    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      return { error: 'Member record not found.' };
    }

    await memberRef.update({
      displayName: validated.data.displayName,
      organizationId: validated.data.organizationId
        ? validated.data.organizationId
        : admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    revalidatePath('/admin/members');
    return { success: true };
  } catch (error) {
    console.error('Failed to update member profile:', error);
    return { error: 'Failed to update the profile. Please try again.' };
  }
}
