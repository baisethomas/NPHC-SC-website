import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { join } from 'path';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  if (!admin.apps.length) {
    const projectId =
      process.env.FIREBASE_ADMIN_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    const credentialsJson = process.env.FIREBASE_ADMIN_CREDENTIALS_JSON;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!projectId) {
      throw new Error(
        'FATAL: FIREBASE_ADMIN_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID fallback) is not set.'
      );
    }

    // Prefer explicit service account credentials (Vercel-friendly).
    if (credentialsJson) {
      const parsed = JSON.parse(credentialsJson);
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
        projectId,
      });
      console.log('Firebase Admin SDK initialized with FIREBASE_ADMIN_CREDENTIALS_JSON.');
    } else if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // Vercel often stores multiline private keys with escaped newlines.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        projectId,
      });
      console.log('Firebase Admin SDK initialized with FIREBASE_ADMIN_CLIENT_EMAIL/PRIVATE_KEY.');
    } else if (credentialsPath) {
      // Try to read the service account key file from the path specified in GOOGLE_APPLICATION_CREDENTIALS
      try {
        // Resolve path relative to project root if it starts with ./
        const resolvedPath = credentialsPath.startsWith('./') 
          ? join(process.cwd(), credentialsPath)
          : credentialsPath;
        
        const serviceAccount = JSON.parse(readFileSync(resolvedPath, 'utf8'));
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId,
        });
        console.log(`Firebase Admin SDK initialized with service account file: ${resolvedPath}`);
      } catch (fileError) {
        console.warn(`Failed to read service account file from ${credentialsPath}, falling back to applicationDefault().`);
        // Fallback to applicationDefault() if file read fails
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId,
        });
        console.log('Firebase Admin SDK initialized with applicationDefault() credentials (fallback).');
      }
    } else {
      // Fallback for local environments configured with ADC (gcloud).
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
      });
      console.log('Firebase Admin SDK initialized with applicationDefault() credentials.');
    }
  }
  // If initialization is successful, get the services.
  adminDb = admin.firestore();
  adminAuth = admin.auth();
} catch (error) {
  console.error("--- FIREBASE ADMIN SDK INITIALIZATION ERROR ---");
  console.error("This is likely due to missing or incorrect Application Default Credentials in the environment.");
  console.error("All admin database operations (create, delete) may fail until this is resolved.");
  console.error("Original error:", error);
  console.error("---------------------------------------------------------");
}

// Helper function to verify Firebase ID tokens
export async function verifyIdToken(token: string) {
  if (!adminAuth) {
    console.warn('Firebase Admin Auth not initialized. Cannot verify token.');
    return null;
  }
  
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.warn('Token verification failed:', error);
    return null;
  }
}

export { adminDb, adminAuth };
