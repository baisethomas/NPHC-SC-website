import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration for project 'nphc-solano-hub'
const firebaseConfig = {
  apiKey: "AIzaSyCK9lhuocccN4icc56lnxPabVhnzeWzxC8",
  authDomain: "nphc-solano-hub.firebaseapp.com",
  projectId: "nphc-solano-hub",
  storageBucket: "nphc-solano-hub.firebasestorage.app",
  messagingSenderId: "114000308171",
  appId: "1:114000308171:web:083414be67b8f03b24784e"
};

// IMPORTANT: Please go to your Firebase project settings and ensure all of these
// credentials are correct. Using environment variables is strongly recommended
// for production.

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
