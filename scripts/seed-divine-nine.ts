/**
 * Seeds the Firestore `divineNine` collection from the hardcoded Divine Nine
 * array in src/lib/definitions.ts. Doc ids are the slugified organization
 * names; each doc stores { name, logo, hint, order }.
 *
 *   npx tsx scripts/seed-divine-nine.ts           # seeds only if the collection is empty
 *   npx tsx scripts/seed-divine-nine.ts --force   # overwrites existing docs
 *
 * Reads credentials from .env.local FIREBASE_ADMIN_CREDENTIALS_JSON (with the
 * newline re-escape) or falls back to Application Default Credentials, same as
 * scripts/set-admin.ts.
 */
import { existsSync, readFileSync } from 'fs';
import admin from 'firebase-admin';
import { getDivineNineOrganizations, slugify } from '../src/lib/definitions';

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
  const force = process.argv.includes('--force');

  initializeAdmin();
  const db = admin.firestore();
  const collection = db.collection('divineNine');

  const existing = await collection.limit(1).get();
  if (!existing.empty && !force) {
    console.log("The 'divineNine' collection already has documents. Re-run with --force to overwrite.");
    return;
  }

  const organizations = getDivineNineOrganizations();
  const batch = db.batch();
  organizations.forEach((org, index) => {
    const id = slugify(org.name);
    batch.set(collection.doc(id), {
      name: org.name,
      logo: org.logo,
      hint: org.hint,
      order: index,
    });
  });
  await batch.commit();

  console.log(`Seeded ${organizations.length} Divine Nine organizations into 'divineNine'${force ? ' (forced overwrite)' : ''}.`);
}

main().catch((error) => {
  console.error('Failed to seed Divine Nine organizations:', error);
  process.exitCode = 1;
});
