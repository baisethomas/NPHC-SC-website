
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
  console.error("--- CRITICAL: FIREBASE ADMIN SDK INITIALIZATION FAILED ---");
  console.error("This is likely due to missing or incorrect Application Default Credentials in the environment.");
  console.error("All admin database operations (create, delete) will fail until this is resolved.");
  console.error("Original error:", error);
  console.error("---------------------------------------------------------");
}

export { adminDb, adminAuth };
