import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration for project 'nphc-solano-hub'
const firebaseConfig = {
  apiKey: "AIzaSyBHFOButhSLZ1OFa17LsOIr_8JwrG4zRRs",
  authDomain: "nphc-solano-hub.firebaseapp.com",
  projectId: "nphc-solano-hub",
  storageBucket: "nphc-solano-hub.appspot.com",
  messagingSenderId: "372097989483",
  appId: "1:372097989483:web:9bac533d3dd6f35499ea2e"
};

// IMPORTANT: The projectId has been updated. Please go to your Firebase project
// settings for 'nphc-solano-hub' and ensure all of these credentials are
// correct. Using environment variables is strongly recommended for production.

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
