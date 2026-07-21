import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

const ROLES = new Set([
  'super_admin',
  'admin',
  'content_editor',
  'membership_manager',
  'event_manager',
  'treasurer',
  'comms_manager',
  'committee_lead',
  'member',
  'visitor',
]);

export const setUserRoles = onCall(async (request) => {
  const callerRoles = request.auth?.token.roles;
  if (!Array.isArray(callerRoles) || !callerRoles.includes('super_admin')) {
    throw new HttpsError('permission-denied', 'Super administrator access is required.');
  }

  const { uid, roles } = request.data as { uid?: unknown; roles?: unknown };
  if (typeof uid !== 'string' || !Array.isArray(roles) || !roles.every((role) => typeof role === 'string' && ROLES.has(role))) {
    throw new HttpsError('invalid-argument', 'A user ID and valid roles are required.');
  }

  const normalizedRoles = [...new Set(roles)];
  const auth = getAuth();
  const db = getFirestore();
  const user = await auth.getUser(uid);

  // Drop the pre-RBAC claims (`admin`, `role`) so a demotion here cannot be
  // undone by a legacy claim that security rules and authz still honor.
  const { admin: _legacyAdmin, role: _legacyRole, ...retainedClaims } = user.customClaims ?? {};
  await auth.setCustomUserClaims(uid, {
    ...retainedClaims,
    roles: normalizedRoles,
  });
  await db.collection('members').doc(uid).set(
    {
      authUid: uid,
      email: user.email ?? '',
      displayName: user.displayName ?? user.email ?? uid,
      roles: normalizedRoles,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  // Role grants are the most sensitive operation in the system; every change
  // leaves a trace. auditLogs is client-write-blocked in firestore.rules.
  await db.collection('auditLogs').add({
    action: 'set_user_roles',
    actorUid: request.auth?.uid ?? null,
    targetUid: uid,
    previousRoles: (user.customClaims?.roles as string[] | undefined) ?? [],
    newRoles: normalizedRoles,
    hadLegacyAdminClaim: user.customClaims?.admin === true,
    timestamp: FieldValue.serverTimestamp(),
  });

  return { uid, roles: normalizedRoles };
});
