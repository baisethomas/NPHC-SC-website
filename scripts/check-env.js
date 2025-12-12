#!/usr/bin/env node

/**
 * Script to verify all required environment variables are set
 */

// Load .env.local file
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const requiredVars = {
  'NEXT_PUBLIC_FIREBASE_API_KEY': 'Firebase API Key',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase Auth Domain',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase Project ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'Firebase Storage Bucket',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': 'Firebase Messaging Sender ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID': 'Firebase App ID',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'Google Maps API Key',
  'GOOGLE_APPLICATION_CREDENTIALS': 'Google Application Credentials path'
};

const optionalVars = {
  'NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST': 'Admin Email Allowlist (optional)',
  'ADMIN_EMAIL_ALLOWLIST': 'Server-side Admin Email Allowlist (optional)'
};

console.log('\n🔍 Checking Environment Variables...\n');

let allGood = true;

// Check required variables
console.log('Required Variables:');
for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  if (value) {
    // Mask sensitive values
    const displayValue = varName.includes('KEY') || varName.includes('CREDENTIALS')
      ? `${value.substring(0, 10)}...${value.substring(value.length - 5)}`
      : value;
    console.log(`  ✓ ${varName}: ${displayValue}`);
  } else {
    console.log(`  ✗ ${varName}: MISSING - ${description}`);
    allGood = false;
  }
}

// Check optional variables
console.log('\nOptional Variables:');
for (const [varName, description] of Object.entries(optionalVars)) {
  const value = process.env[varName];
  if (value) {
    console.log(`  ✓ ${varName}: Set`);
  } else {
    console.log(`  ○ ${varName}: Not set (${description})`);
  }
}

// Verify service account file exists if GOOGLE_APPLICATION_CREDENTIALS is set
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const fs = require('fs');
  const path = require('path');
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS.startsWith('./')
    ? path.join(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
    : process.env.GOOGLE_APPLICATION_CREDENTIALS;
  
  if (fs.existsSync(credentialsPath)) {
    console.log(`\n✓ Service account file found at: ${credentialsPath}`);
    try {
      const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      if (serviceAccount.project_id === process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.log(`✓ Service account project ID matches Firebase project ID`);
      } else {
        console.log(`⚠ Service account project ID (${serviceAccount.project_id}) doesn't match Firebase project ID (${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID})`);
      }
    } catch (error) {
      console.log(`✗ Error reading service account file: ${error.message}`);
      allGood = false;
    }
  } else {
    console.log(`\n✗ Service account file not found at: ${credentialsPath}`);
    allGood = false;
  }
}

console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All required environment variables are set correctly!');
  process.exit(0);
} else {
  console.log('❌ Some required environment variables are missing!');
  console.log('Please check your .env.local file.');
  process.exit(1);
}

