/**
 * Bootstrap/repair tool: assign roles to a user by email, directly via the
 * Admin SDK. Primary use is granting the first `super_admin` so the admin
 * panel's role-management UI (gated on manage_roles) becomes usable.
 *
 *   npx tsx scripts/set-admin.ts user@example.org                  # grants admin
 *   npx tsx scripts/set-admin.ts user@example.org super_admin      # grants super_admin
 *   npx tsx scripts/set-admin.ts user@example.org admin,treasurer  # any role list
 *
 * Reads credentials from FIREBASE_ADMIN_CREDENTIALS_JSON (or ADC), same as
 * scripts/migrate-roles.ts. Strips legacy `admin`/`role` claims and writes an
 * auditLogs entry, mirroring functions/src/admin/user-management.ts.
 */
import { existsSync, readFileSync } from 'fs';
import admin from 'firebase-admin';
import { normalizeRoles, type Role } from '../src/lib/roles';

function loadCredentialsJson(): string | undefined {
  // The env value embeds quotes/newlines that shells and --env-file mangle,
  // so prefer reading .env.local directly when it exists.
  if (existsSync('.env.local')) {
    const env = readFileSync('.env.local', 'utf8');
    const match = env.match(/^FIREBASE_ADMIN_CREDENTIALS_JSON="?(.+?)"?$/m);
    if (match) return match[1];
  }
  return process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;
}

function initializeAdmin() {
  if (admin.apps.length) return;

  const credentials = loadCredentialsJson();
  if (credentials) {
    const sanitized = credentials.replace(/\n/g, '\\n').replace(/\\\\n/g, '\\n');
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(sanitized)) });
    return;
  }

  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}

async function main() {
  const [email, roleArg] = process.argv.slice(2);
  if (!email || !email.includes('@')) {
    console.error('Usage: npx tsx scripts/set-admin.ts <email> [role[,role...]]');
    process.exitCode = 1;
    return;
  }

  const requested = (roleArg ?? 'admin').split(',').map((r) => r.trim());
  const roles: Role[] = normalizeRoles(requested);
  if (roles.length !== requested.length) {
    console.error(`Unknown role in "${roleArg}". Valid roles are defined in src/lib/roles.ts.`);
    process.exitCode = 1;
    return;
  }

  initializeAdmin();
  const auth = admin.auth();
  const db = admin.firestore();

  const user = await auth.getUserByEmail(email);
  const previousRoles = normalizeRoles(user.customClaims?.roles);
  const { admin: legacyAdmin, role: _legacyRole, ...retainedClaims } = user.customClaims ?? {};

  await auth.setCustomUserClaims(user.uid, { ...retainedClaims, roles });
  await db.collection('members').doc(user.uid).set(
    {
      authUid: user.uid,
      email: user.email ?? email,
      displayName: user.displayName ?? user.email ?? user.uid,
      roles,
      membershipStatus: 'approved',
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  await db.collection('auditLogs').add({
    action: 'set_user_roles',
    actorUid: 'cli:set-admin',
    targetUid: user.uid,
    previousRoles,
    newRoles: roles,
    hadLegacyAdminClaim: legacyAdmin === true,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    source: 'scripts/set-admin.ts',
  });

  console.log(`Set roles [${roles.join(', ')}] for ${email} (${user.uid}).`);
  console.log('The user must sign out and back in (or refresh their token) to pick up the new claims.');
}

main().catch((error) => {
  console.error('Failed to set roles:', error);
  process.exitCode = 1;
});
