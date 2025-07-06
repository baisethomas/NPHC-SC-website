
import admin from 'firebase-admin';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;

try {
  if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error("FATAL: NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set. Please check your .env.local file.");
    }
    admin.initializeApp({ projectId });
    console.log("Firebase Admin SDK initialized successfully.");
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

export { adminDb, adminAuth };
