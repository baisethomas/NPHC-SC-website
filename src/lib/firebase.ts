import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBHFOButhSLZ1OFa17LsOIr_8JwrG4zRRs",
  authDomain: "sc-panhell.firebaseapp.com",
  projectId: "sc-panhell",
  storageBucket: "sc-panhell.appspot.com",
  messagingSenderId: "372097989483",
  appId: "1:372097989483:web:9bac533d3dd6f35499ea2e"
};

// IMPORTANT: For production applications, it's strongly recommended to use
// environment variables to store your Firebase credentials rather than hardcoding
// them in your source code.

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
