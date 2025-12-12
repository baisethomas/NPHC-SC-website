import admin from 'firebase-admin';

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
  console.warn("--- FIREBASE ADMIN SDK INITIALIZATION WARNING ---");
  console.warn("This is likely due to missing or incorrect Application Default Credentials in the environment.");
  console.warn("All admin database operations (create, delete) may fail until this is resolved.");
  console.warn("Original error:", error);
  console.warn("---------------------------------------------------------");
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
