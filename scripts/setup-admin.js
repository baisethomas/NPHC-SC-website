#!/usr/bin/env node

/**
 * Admin Setup Script for NPHC Members Portal
 * 
 * This script sets up admin privileges for users in Firebase Authentication.
 * It uses the Firebase Admin SDK to set custom claims that grant admin access.
 * 
 * Usage:
 *   node scripts/setup-admin.js <email>
 *   
 * Example:
 *   node scripts/setup-admin.js baise.thomas@gmail.com
 * 
 * Requirements:
 * - Firebase Admin SDK credentials configured (GOOGLE_APPLICATION_CREDENTIALS or Application Default Credentials)
 * - NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable set
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin SDK
let adminAuth = null;

try {
  if (!admin.apps.length) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      console.error('❌ ERROR: NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable is not set.');
      console.error('Please check your .env.local file.');
      process.exit(1);
    }

    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId,
    });
    
    console.log('✅ Firebase Admin SDK initialized successfully.');
  }
  
  adminAuth = admin.auth();
} catch (error) {
  console.error('❌ FATAL ERROR: Failed to initialize Firebase Admin SDK');
  console.error('This usually means:');
  console.error('1. Missing Google Cloud credentials');
  console.error('2. Incorrect NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  console.error('3. Service account doesn\'t have proper permissions');
  console.error('\nOriginal error:', error.message);
  
  console.error('\n📖 To fix this:');
  console.error('1. Make sure you have Application Default Credentials set up:');
  console.error('   gcloud auth application-default login');
  console.error('2. OR set GOOGLE_APPLICATION_CREDENTIALS to point to a service account key file');
  console.error('3. Verify your project ID in .env.local');
  
  process.exit(1);
}

/**
 * Set admin privileges for a user
 */
async function setAdminClaims(email, isAdmin = true, role = 'admin') {
  try {
    console.log(`🔍 Looking up user: ${email}`);
    
    // Get user by email
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid} (${userRecord.email})`);
    
    // Set custom claims
    const customClaims = {
      admin: isAdmin,
      role: role,
      permissions: [
        'manage_documents',
        'manage_meetings', 
        'manage_messages',
        'manage_requests',
        'view_analytics'
      ]
    };
    
    await adminAuth.setCustomUserClaims(userRecord.uid, customClaims);
    
    console.log(`✅ Admin privileges ${isAdmin ? 'granted' : 'revoked'} for ${email}`);
    console.log(`📋 Custom claims set:`, customClaims);
    
    return userRecord;
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ ERROR: User ${email} not found.`);
      console.error('Make sure the user has signed up for an account first.');
    } else {
      console.error(`❌ ERROR: Failed to set admin claims for ${email}`);
      console.error('Error:', error.message);
    }
    throw error;
  }
}

/**
 * List all users with admin privileges
 */
async function listAdminUsers() {
  try {
    console.log('🔍 Scanning for users with admin privileges...\n');
    
    const listUsersResult = await adminAuth.listUsers();
    const adminUsers = [];
    
    for (const userRecord of listUsersResult.users) {
      if (userRecord.customClaims && userRecord.customClaims.admin) {
        adminUsers.push({
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName || 'No name',
          role: userRecord.customClaims.role || 'admin',
          disabled: userRecord.disabled,
          emailVerified: userRecord.emailVerified
        });
      }
    }
    
    if (adminUsers.length === 0) {
      console.log('⚠️  No users with admin privileges found.');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):\n`);
      adminUsers.forEach(user => {
        console.log(`📋 ${user.email}`);
        console.log(`   UID: ${user.uid}`);
        console.log(`   Name: ${user.displayName}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.disabled ? 'DISABLED' : 'ACTIVE'}`);
        console.log(`   Email Verified: ${user.emailVerified ? 'YES' : 'NO'}`);
        console.log('');
      });
    }
    
    return adminUsers;
    
  } catch (error) {
    console.error('❌ ERROR: Failed to list admin users');
    console.error('Error:', error.message);
    throw error;
  }
}

/**
 * Check if a user has admin privileges
 */
async function checkUserClaims(email) {
  try {
    console.log(`🔍 Checking admin claims for: ${email}`);
    
    const userRecord = await adminAuth.getUserByEmail(email);
    console.log(`✅ Found user: ${userRecord.uid}`);
    
    if (userRecord.customClaims) {
      console.log('📋 Custom claims:', userRecord.customClaims);
      
      if (userRecord.customClaims.admin) {
        console.log('✅ User has admin privileges');
      } else {
        console.log('❌ User does NOT have admin privileges');
      }
    } else {
      console.log('❌ User has no custom claims (no admin privileges)');
    }
    
    return userRecord;
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ ERROR: User ${email} not found.`);
    } else {
      console.error(`❌ ERROR: Failed to check user claims for ${email}`);
      console.error('Error:', error.message);
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🚀 NPHC Members Portal - Admin Setup Script\n');
    
    console.log('Usage:');
    console.log('  node scripts/setup-admin.js <email>           # Grant admin access');
    console.log('  node scripts/setup-admin.js --check <email>   # Check user claims');
    console.log('  node scripts/setup-admin.js --list            # List all admins');
    console.log('  node scripts/setup-admin.js --revoke <email>  # Revoke admin access');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/setup-admin.js baise.thomas@gmail.com');
    console.log('  node scripts/setup-admin.js --check baise.thomas@gmail.com');
    console.log('  node scripts/setup-admin.js --list');
    console.log('');
    
    return;
  }
  
  try {
    const command = args[0];
    
    if (command === '--list') {
      await listAdminUsers();
      
    } else if (command === '--check' && args[1]) {
      await checkUserClaims(args[1]);
      
    } else if (command === '--revoke' && args[1]) {
      await setAdminClaims(args[1], false, 'member');
      
    } else if (command.includes('@')) {
      // Email provided directly
      await setAdminClaims(command, true, 'admin');
      
    } else {
      console.error('❌ ERROR: Invalid arguments');
      console.error('Use --help to see usage information');
      process.exit(1);
    }
    
    console.log('\n✅ Operation completed successfully!');
    console.log('💡 The user may need to sign out and sign back in to see the changes.');
    
  } catch (error) {
    console.error('\n❌ Operation failed!');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  setAdminClaims,
  checkUserClaims,
  listAdminUsers
};