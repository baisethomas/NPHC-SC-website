# Vercel Deployment Guide - Firebase Admin SDK

## Overview
Vercel doesn't support uploading files like `serviceAccountKey.json`. Instead, you need to use environment variables.

## Option 1: Use FIREBASE_ADMIN_CREDENTIALS_JSON (Recommended)

This is the easiest and most secure method for Vercel.

### Step 1: Convert JSON to Single-Line String

Run this command to get the JSON as a single-line string:

```bash
cat serviceAccountKey.json | jq -c .
```

Or if you don't have `jq` installed:

```bash
cat serviceAccountKey.json | tr -d '\n' | sed 's/"/\\"/g'
```

### Step 2: Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add a new environment variable:
   - **Name**: `FIREBASE_ADMIN_CREDENTIALS_JSON`
   - **Value**: Paste the entire JSON as a single-line string (from Step 1)
   - **Environment**: Select all environments (Production, Preview, Development)

### Step 3: Redeploy

After adding the environment variable, trigger a new deployment or wait for the next automatic deployment.

---

## Option 2: Use Separate Environment Variables

If you prefer to split the credentials, you can use:

- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

### Step 1: Extract Values

From your `serviceAccountKey.json`:
- **client_email**: `firebase-adminsdk-fbsvc@nphc-solano-hub.iam.gserviceaccount.com`
- **private_key**: The entire private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`

### Step 2: Add to Vercel

1. Go to **Settings** → **Environment Variables**
2. Add `FIREBASE_ADMIN_CLIENT_EMAIL` with the client_email value
3. Add `FIREBASE_ADMIN_PRIVATE_KEY` with the private_key value (keep the newlines as `\n`)

---

## Important Notes

1. **Never commit `serviceAccountKey.json` to git** - It's already in `.gitignore`
2. **The `GOOGLE_APPLICATION_CREDENTIALS` variable won't work in Vercel** - Vercel doesn't support file-based credentials
3. **Environment variables are encrypted** - Vercel stores them securely
4. **Apply to all environments** - Make sure to add the variable to Production, Preview, and Development

## Verification

After deployment, check your Vercel function logs. You should see:
```
Firebase Admin SDK initialized with FIREBASE_ADMIN_CREDENTIALS_JSON.
```

If you see initialization errors, double-check:
- The JSON string is valid (no extra quotes or escaping issues)
- The environment variable is set for the correct environment
- The project ID matches: `nphc-solano-hub`

