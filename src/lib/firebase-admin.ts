
import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors
if (!admin.apps.length) {
  try {
    // When running in a Google Cloud environment (like Firebase Studio),
    // the SDK can automatically find the service account credentials.
    admin.initializeApp({
        // The project ID is required for the Admin SDK to know which project to talk to
        // when credentials are automatically discovered.
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
    console.log("Firebase Admin SDK initialized successfully using Application Default Credentials.");
  } catch (error) {
    console.error("Firebase Admin SDK initialization error:", error);
    // Provide a more helpful error message if the project ID is missing.
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.error("FATAL: NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set. The Admin SDK cannot function without it.");
    }
  }
}

const adminDb = admin.firestore();
const adminAuth = admin.auth();

export { adminDb, adminAuth };
