import type { Role } from '@/lib/roles';

export type MembershipStatus = 'pending' | 'approved' | 'suspended' | 'rejected';

export interface Member {
  id: string;
  authUid: string;
  email: string;
  displayName: string;
  roles: Role[];
  membershipStatus: MembershipStatus;
  isActive: boolean;
  organizationId?: string;
  membershipTierId?: string;
  createdAt?: string;
  updatedAt?: string;
}
