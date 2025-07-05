const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = './serviceAccountKey.json';

// 1. Check if the file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`🔴 Error: Service account key file not found at '${serviceAccountPath}'.`);
  console.error("Please download it from your Firebase project settings and place it in the root of your project.");
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error(`🔴 Error: Could not parse the '${serviceAccountPath}' file. Make sure it is a valid JSON file.`);
  process.exit(1);
}

// 2. Check for project_id to help user verify
if (!serviceAccount.project_id) {
    console.error(`🔴 Error: The service account key file seems to be invalid or corrupted, as it's missing the 'project_id'.`);
    console.error("Please generate a new key file from the Firebase console.");
    process.exit(1);
}

console.log(`🔑 Initializing with service account for project: ${serviceAccount.project_id}`);

// The email of the user you want to make an admin.
const userEmail = 'YOUR_ADMIN_EMAIL@example.com'; // <-- IMPORTANT: Replace this!

if (userEmail.includes('YOUR_ADMIN_EMAIL')) {
    console.error("🔴 Error: Please replace 'YOUR_ADMIN_EMAIL@example.com' in set-admin-claim.js with the actual user's email address.");
    process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim() {
  try {
    console.log(`Looking up user: ${userEmail}...`);
    const user = await admin.auth().getUserByEmail(userEmail);
    console.log(`Found user UID: ${user.uid}. Setting admin claim...`);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Success! ${userEmail} has been made an admin.`);
    console.log("They will need to log out and log back in for the change to take effect.");
  } catch (error) {
    console.error('❌ Error setting custom claim:', error);
    if (error.code === 'auth/user-not-found') {
        console.error(`\nHint: The user with email '${userEmail}' was not found in Firebase Authentication. Please make sure the user exists and the email is spelled correctly.`);
    } else if (error.code === 'app/invalid-credential') {
        console.error("\nHint: This 'invalid-credential' error usually means your service account key is old or has been revoked. Please generate a new private key from your Firebase project settings and replace the serviceAccountKey.json file.");
    }
  } finally {
      // The Firebase Admin SDK may keep the process alive, so we explicitly exit.
      process.exit();
  }
}

setAdminClaim();
