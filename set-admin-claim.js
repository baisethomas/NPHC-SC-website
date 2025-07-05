const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccountPath = './serviceAccountKey.json';

// --- Step 1: Verify the service account file ---
if (!fs.existsSync(serviceAccountPath)) {
  console.error(`🔴 FATAL ERROR: Service account key file not found.`);
  console.error(`   - Expected file at: '${serviceAccountPath}'`);
  console.error(`   - Please download a new private key from your Firebase project settings and place it in the project's root directory.`);
  process.exit(1);
}

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error(`🔴 FATAL ERROR: Could not parse the '${serviceAccountPath}' file.`);
  console.error(`   - Please ensure it is a valid, unmodified JSON file.`);
  process.exit(1);
}

// --- Step 2: Verify the service account content ---
if (!serviceAccount.project_id) {
    console.error(`🔴 FATAL ERROR: The service account key file seems invalid or corrupted (missing 'project_id').`);
    console.error(`   - Please generate a new key file from the Firebase console.`);
    process.exit(1);
}

// --- Step 3: Verify the user email ---
// IMPORTANT: Replace this with the user's actual email!
const userEmail = 'admin@example.com'; 

if (userEmail.includes('YOUR_ADMIN_EMAIL') || userEmail.includes('admin@example.com')) {
    console.error("🔴 FATAL ERROR: You must replace the placeholder email in this script.");
    console.error(`   - Open 'set-admin-claim.js' and change '${userEmail}' to the user's email address.`);
    process.exit(1);
}

console.log(`✅ Script checks passed. Initializing Firebase for project: ${serviceAccount.project_id}`);
console.log(`-  Attempting to make '${userEmail}' an admin...`);

// --- Step 4: Initialize Firebase and set claim ---
async function main() {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    
      const user = await admin.auth().getUserByEmail(userEmail);
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      
      console.log(`\n✅ SUCCESS!`);
      console.log(`-  User '${userEmail}' (UID: ${user.uid}) has been granted admin privileges.`);
      console.log(`-  They must log out and log back in for the change to take effect.`);
      process.exit(0);
    
    } catch (error) {
      console.error('\n❌ SCRIPT FAILED. Error details:');
      
      if (error.code === 'auth/user-not-found') {
          console.error(`\n💡 HINT: The user with email '${userEmail}' was not found in Firebase Authentication. Please make sure the user account exists and the email is spelled correctly.`);
      } else if (error.code === 'app/invalid-credential') {
          console.error(`\n💡 HINT: This 'invalid-credential' error means your service account key is old, revoked, or for the wrong project.`);
          console.error(`   - ACTION: Generate a new private key from your Firebase project settings and replace your 'serviceAccountKey.json' file.`);
      } else {
        console.error(error);
      }
      process.exit(1);
    }
}

main();
