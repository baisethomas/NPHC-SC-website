
// Admin management functions for the members portal

import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable, HttpsCallable } from 'firebase/functions';
import { app } from './firebase';

const functions = getFunctions(app);

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  customClaims?: {
    admin?: boolean;
    role?: string;
  };
  disabled?: boolean;
  emailVerified?: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

export interface SetAdminClaimsRequest {
  uid: string;
  isAdmin: boolean;
  role?: string;
}

export interface BatchUpdateRequest {
  updates: {
    uid: string;
    customClaims: Record<string, unknown>;
  }[];
}

// Cloud Functions for admin management
export const adminFunctions = {
  // Set admin claims for a user
  setAdminClaims: httpsCallable<SetAdminClaimsRequest, { success: boolean; message: string }>(
    functions, 
    'setAdminClaims'
  ),

  // Remove admin claims from a user
  removeAdminClaims: httpsCallable<{ uid: string }, { success: boolean; message: string }>(
    functions, 
    'removeAdminClaims'
  ),

  // Get all users with admin privileges
  listAdminUsers: httpsCallable<void, AdminUser[]>(
    functions, 
    'listAdminUsers'
  ),

  // Get user by UID with custom claims
  getUser: httpsCallable<{ uid: string }, AdminUser>(
    functions, 
    'getUser'
  ),

  // Get user by email with custom claims
  getUserByEmail: httpsCallable<{ email: string }, AdminUser>(
    functions, 
    'getUserByEmail'
  ),

  // List all users with pagination
  listUsers: httpsCallable<
    { pageToken?: string; maxResults?: number }, 
    { users: AdminUser[]; pageToken?: string }
  >(
    functions, 
    'listUsers'
  ),

  // Disable/enable user account
  updateUserDisabled: httpsCallable<
    { uid: string; disabled: boolean }, 
    { success: boolean; message: string }
  >(
    functions, 
    'updateUserDisabled'
  ),

  // Update user display name
  updateUserDisplayName: httpsCallable<
    { uid: string; displayName: string }, 
    { success: boolean; message: string }
  >(
    functions, 
    'updateUserDisplayName'
  ),

  // Delete user account
  deleteUser: httpsCallable<{ uid: string }, { success: boolean; message: string }>(
    functions, 
    'deleteUser'
  ),

  // Batch update custom claims
  batchUpdateClaims: httpsCallable<BatchUpdateRequest, { success: boolean; message: string }>(
    functions, 
    'batchUpdateClaims'
  ),

  // Send password reset email
  sendPasswordResetEmail: httpsCallable<
    { email: string }, 
    { success: boolean; message: string }
  >(
    functions, 
    'sendPasswordResetEmail'
  ),

  // Send email verification
  sendEmailVerification: httpsCallable<
    { uid: string }, 
    { success: boolean; message: string }
  >(
    functions, 
    'sendEmailVerification'
  )
};

// Helper functions for admin operations
export const adminHelpers = {
  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return false;
    
    try {
      const tokenResult = await user.getIdTokenResult();
      return tokenResult.claims.admin === true;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  },

  // Get current user's custom claims
  async getCurrentUserClaims(): Promise<Record<string, unknown>> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return {};
    
    try {
      const tokenResult = await user.getIdTokenResult();
      return tokenResult.claims;
    } catch (error) {
      console.error('Error getting user claims:', error);
      return {};
    }
  },

  // Refresh user token to get updated claims
  async refreshUserToken(): Promise<void> {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) return;
    
    try {
      await user.getIdToken(true); // Force refresh
    } catch (error) {
      console.error('Error refreshing user token:', error);
    }
  },

  // Format admin user data for display
  formatAdminUser(user: AdminUser): {
    uid: string;
    email: string;
    displayName: string;
    isAdmin: boolean;
    role: string;
    status: string;
    createdAt: string;
    lastSignIn: string;
  } {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'No name',
      isAdmin: user.customClaims?.admin || false,
      role: user.customClaims?.role || 'member',
      status: user.disabled ? 'disabled' : 'active',
      createdAt: user.metadata?.creationTime || 'Unknown',
      lastSignIn: user.metadata?.lastSignInTime || 'Never'
    };
  },

  // Validate admin permissions before actions
  async validateAdminAction(action: string): Promise<boolean> {
    const isAdmin = await this.isCurrentUserAdmin();
    
    if (!isAdmin) {
      console.error(`Admin action '${action}' denied: User is not an admin`);
      return false;
    }
    
    return true;
  }
};

// Admin role constants
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member'
} as const;

export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

// Admin permissions
export const ADMIN_PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_DOCUMENTS: 'manage_documents',
  MANAGE_MEETINGS: 'manage_meetings',
  MANAGE_MESSAGES: 'manage_messages',
  MANAGE_REQUESTS: 'manage_requests',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SYSTEM: 'manage_system'
} as const;

export type AdminPermission = typeof ADMIN_PERMISSIONS[keyof typeof ADMIN_PERMISSIONS];

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  [ADMIN_ROLES.SUPER_ADMIN]: [
    ADMIN_PERMISSIONS.MANAGE_USERS,
    ADMIN_PERMISSIONS.MANAGE_DOCUMENTS,
    ADMIN_PERMISSIONS.MANAGE_MEETINGS,
    ADMIN_PERMISSIONS.MANAGE_MESSAGES,
    ADMIN_PERMISSIONS.MANAGE_REQUESTS,
    ADMIN_PERMISSIONS.VIEW_ANALYTICS,
    ADMIN_PERMISSIONS.MANAGE_SYSTEM
  ],
  [ADMIN_ROLES.ADMIN]: [
    ADMIN_PERMISSIONS.MANAGE_DOCUMENTS,
    ADMIN_PERMISSIONS.MANAGE_MEETINGS,
    ADMIN_PERMISSIONS.MANAGE_MESSAGES,
    ADMIN_PERMISSIONS.MANAGE_REQUESTS,
    ADMIN_PERMISSIONS.VIEW_ANALYTICS
  ],
  [ADMIN_ROLES.MODERATOR]: [
    ADMIN_PERMISSIONS.MANAGE_MESSAGES,
    ADMIN_PERMISSIONS.MANAGE_REQUESTS
  ],
  [ADMIN_ROLES.MEMBER]: []
};

// Permission checker
export function hasPermission(userRole: AdminRole, permission: AdminPermission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission);
}

// Bulk operations helper
export const bulkOperations = {
  async makeUsersAdmin(userIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const uid of userIds) {
      try {
        await adminFunctions.setAdminClaims({ uid, isAdmin: true });
        success.push(uid);
      } catch (error) {
        console.error(`Failed to make user ${uid} admin:`, error);
        failed.push(uid);
      }
    }

    return { success, failed };
  },

  async removeAdminFromUsers(userIds: string[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    for (const uid of userIds) {
      try {
        await adminFunctions.removeAdminClaims({ uid });
        success.push(uid);
      } catch (error) {
        console.error(`Failed to remove admin from user ${uid}:`, error);
        failed.push(uid);
      }
    }

    return { success, failed };
  },

  async updateUserRoles(updates: { uid: string; role: AdminRole }[]): Promise<{ success: string[]; failed: string[] }> {
    const success: string[] = [];
    const failed: string[] = [];

    const batchUpdates = updates.map(({ uid, role }) => ({
      uid,
      customClaims: { 
        admin: role !== ADMIN_ROLES.MEMBER,
        role 
      }
    }));

    try {
      await adminFunctions.batchUpdateClaims({ updates: batchUpdates });
      success.push(...updates.map(u => u.uid));
    } catch (error) {
      console.error('Failed to batch update user roles:', error);
      failed.push(...updates.map(u => u.uid));
    }

    return { success, failed };
  }
};
