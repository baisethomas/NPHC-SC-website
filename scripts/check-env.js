#!/usr/bin/env node

/**
 * Validate local Firebase configuration without exposing secret values.
 * --ci validates the committed template only; CI must not require secrets.
 */
const fs = require('fs');
const path = require('path');

const publicVariables = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
];

const documentedVariables = [
  ...publicVariables,
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CREDENTIALS_JSON',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST',
  'ADMIN_EMAIL_ALLOWLIST',
];

const isCiCheck = process.argv.includes('--ci');
const envPath = path.join(process.cwd(), '.env.local');
const templatePath = path.join(process.cwd(), '.env.example');

function parseEnv(content) {
  return new Map(
    content
      .split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=/))
      .filter(Boolean)
      .map((match) => match[1])
      .map((key) => [key, true])
  );
}

if (!isCiCheck && fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

if (!fs.existsSync(templatePath)) {
  console.error('Missing .env.example. Add a secret-free environment template.');
  process.exit(1);
}

const templateVariables = parseEnv(fs.readFileSync(templatePath, 'utf8'));
const undocumented = documentedVariables.filter((name) => !templateVariables.has(name));
if (undocumented.length) {
  console.error(`.env.example is missing: ${undocumented.join(', ')}`);
  process.exit(1);
}

if (isCiCheck) {
  console.log('.env.example documents all supported environment variables.');
  process.exit(0);
}

const missingPublic = publicVariables.filter((name) => !process.env[name]);
if (missingPublic.length) {
  console.error(`Missing required public Firebase configuration: ${missingPublic.join(', ')}`);
  process.exit(1);
}

// Validate the shape (not just the presence) of the admin credentials so a
// malformed value fails here instead of as runtime 500s. Mirrors the newline
// re-escaping in src/lib/firebase-admin.ts. Never print the value.
if (process.env.FIREBASE_ADMIN_CREDENTIALS_JSON) {
  try {
    const sanitized = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON.replace(/\n/g, '\\n');
    const parsed = JSON.parse(sanitized);
    if (!parsed.client_email || !parsed.private_key) {
      console.error(
        'FIREBASE_ADMIN_CREDENTIALS_JSON parses but is missing client_email/private_key.'
      );
      process.exit(1);
    }
  } catch {
    console.error('FIREBASE_ADMIN_CREDENTIALS_JSON is set but is not valid JSON.');
    process.exit(1);
  }
}

const hasExplicitAdminCredentials =
  Boolean(process.env.FIREBASE_ADMIN_CREDENTIALS_JSON) ||
  Boolean(process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY);
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (credentialsPath && !fs.existsSync(path.resolve(process.cwd(), credentialsPath))) {
  console.error(`GOOGLE_APPLICATION_CREDENTIALS does not exist: ${credentialsPath}`);
  process.exit(1);
}

console.log('Public Firebase configuration is present.');
console.log(
  hasExplicitAdminCredentials || credentialsPath
    ? 'Firebase Admin credentials are configured.'
    : 'Firebase Admin will use Application Default Credentials when server routes run.'
);

