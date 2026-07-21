import admin from 'firebase-admin';
import { normalizeRoles, type Role } from '../src/lib/roles';

const apply = process.argv.includes('--apply');
const allowlist = new Set(
  (process.env.ADMIN_EMAIL_ALLOWLIST ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

function initializeAdmin() {
  if (admin.apps.length) return;

  const credentials = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;
  if (credentials) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(credentials)) });
    return;
  }

  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

function deriveRoles(user: admin.auth.UserRecord): Role[] {
  const claims = user.customClaims ?? {};
  const migratedRoles = normalizeRoles(claims.roles);
  if (migratedRoles.length > 0) return migratedRoles;

  const legacyRole = normalizeRoles([claims.role]);
  if (legacyRole.length > 0) return legacyRole;

  // Legacy admins never held manage_roles authority; keep it that way.
  // Promote to super_admin only by explicit manual action after migration.
  if (claims.admin === true || (user.email && allowlist.has(user.email.toLowerCase()))) {
    return ['admin'];
  }

  return ['visitor'];
}

async function migrate() {
  initializeAdmin();
  const auth = admin.auth();
  const db = admin.firestore();
  let pageToken: string | undefined;
  let processed = 0;

  do {
    const page = await auth.listUsers(1_000, pageToken);
    pageToken = page.pageToken;

    for (const user of page.users) {
      const roles = deriveRoles(user);
      const memberRef = db.collection('members').doc(user.uid);
      const current = await memberRef.get();
      const currentData = current.data() ?? {};
      const memberData = {
        ...currentData,
        authUid: user.uid,
        email: user.email ?? currentData.email ?? '',
        displayName: user.displayName ?? currentData.displayName ?? user.email ?? user.uid,
        roles,
        membershipStatus:
          currentData.membershipStatus ??
          (roles.includes('visitor') ? 'pending' : 'approved'),
        isActive: currentData.isActive ?? !user.disabled,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      console.log(
        `${apply ? 'Applying' : 'Would apply'} ${user.uid}: ${roles.join(', ')}`
      );
      if (apply) {
        const { admin: _legacyAdmin, role: _legacyRole, ...retainedClaims } =
          user.customClaims ?? {};
        await auth.setCustomUserClaims(user.uid, { ...retainedClaims, roles });
        await memberRef.set(memberData, { merge: true });
      }
      processed += 1;
    }
  } while (pageToken);

  console.log(`${apply ? 'Migrated' : 'Dry-run checked'} ${processed} users.`);
}

migrate().catch((error) => {
  console.error('Role migration failed:', error);
  process.exitCode = 1;
});
