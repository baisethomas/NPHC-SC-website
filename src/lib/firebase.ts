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
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. In your project, go to Project Settings (gear icon) > General tab.
// 3. Under "Your apps", click the web icon (</>) to register a new web app.
// 4. After registering, you'll see the firebaseConfig object. Copy these values.
// 5. Create a file named .env.local in the root of your project.
// 6. Add your config values to .env.local like this:
//    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
//    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
//    ...and so on for all the keys.
// 7. Go to the "Firestore Database" section in the Firebase console and create a database.
// 8. Create a collection named "events".
// 9. Add documents to the "events" collection that match the structure of the Event interface in src/lib/data.ts. The document ID should be the event's slug.

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
