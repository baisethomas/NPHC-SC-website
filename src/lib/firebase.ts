import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

// Your web app's Firebase configuration read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

// Wrap the entire initialization in a try-catch to provide a clear error message if it fails.
try {
  // Check if all environment variables are defined.
  const allVarsDefined = Object.values(firebaseConfig).every(v => v);
  if (!allVarsDefined) {
    // This will be caught below and logged.
    throw new Error("One or more Firebase environment variables are missing in .env.local. Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set.");
  }

  // Initialize Firebase
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  // App Check: attests requests come from this app (bot/abuse protection).
  // Activates only in the browser and only once the site key env var is set,
  // so the app keeps working before the console registration is done.
  const appCheckSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_ENTERPRISE_SITE_KEY;
  if (typeof window !== "undefined" && appCheckSiteKey) {
    if (process.env.NODE_ENV !== "production") {
      // Dev builds use a debug token (register it in Firebase console →
      // App Check → Apps → Manage debug tokens; value appears in devtools).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN =
        process.env.NEXT_PUBLIC_APPCHECK_DEBUG_TOKEN ?? true;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }

  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
} catch (error) {
  console.error("🔴 CRITICAL FIREBASE CONFIG ERROR:", error instanceof Error ? error.message : String(error));
  console.error("🔴 The application will not function correctly. Please check your .env.local file and restart the server.");
  // Assign dummy objects to prevent hard crashes on import, but functions will fail at runtime.
  app = {} as FirebaseApp;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  auth = {} as Auth;
}

export { db, storage, auth };
