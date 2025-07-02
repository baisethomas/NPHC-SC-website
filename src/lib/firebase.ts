import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration.
// These values should be stored in a .env.local file at the root of your project.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// HOW TO CONNECT TO FIREBASE:
// 1. In the root of your project, rename the `.env.local.example` file to `.env.local`.
// 2. Open your Firebase project at https://console.firebase.google.com/
// 3. Go to Project Settings (gear icon) > General tab.
// 4. Under "Your apps", click the web icon (</>) to find your web app configuration.
// 5. Copy the values from your Firebase config into the `.env.local` file. The project ID is already set for you.
// 6. In Firebase, go to the "Firestore Database" section and create a database.
// 7. Create a collection named "events".
// 8. Add documents to the "events" collection that match the structure of the Event interface in src/lib/data.ts. The document ID should be the event's slug.

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
