export const ROLES = [
  'super_admin',
  'admin',
  'content_editor',
  'membership_manager',
  'event_manager',
  'treasurer',
  'comms_manager',
  'committee_lead',
  'member',
  'visitor',
] as const;

export type Role = (typeof ROLES)[number];

export const PERMISSIONS = {
  MANAGE_ROLES: 'manage_roles',
  MANAGE_SITE_SETTINGS: 'manage_site_settings',
  EDIT_CONTENT: 'edit_content',
  PUBLISH_ANNOUNCEMENTS: 'publish_announcements',
  MANAGE_MEMBERS: 'manage_members',
  APPROVE_MEMBERS: 'approve_members',
  MANAGE_TIERS: 'manage_tiers',
  VIEW_DIRECTORY: 'view_directory',
  MANAGE_EVENTS: 'manage_events',
  CHECK_IN_ATTENDEES: 'check_in_attendees',
  MANAGE_PAYMENTS: 'manage_payments',
  PROCESS_REFUNDS: 'process_refunds',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  SEND_COMMUNICATIONS: 'send_communications',
  MANAGE_DOCUMENTS: 'manage_documents',
  MANAGE_COMMITTEES: 'manage_committees',
  VIEW_ANALYTICS: 'view_analytics',
  VIEW_AUDIT_LOG: 'view_audit_log',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS.filter((permission) => permission !== PERMISSIONS.MANAGE_ROLES),
  content_editor: [PERMISSIONS.EDIT_CONTENT, PERMISSIONS.MANAGE_DOCUMENTS],
  membership_manager: [
    PERMISSIONS.MANAGE_MEMBERS,
    PERMISSIONS.APPROVE_MEMBERS,
    PERMISSIONS.MANAGE_TIERS,
    PERMISSIONS.VIEW_DIRECTORY,
  ],
  event_manager: [PERMISSIONS.MANAGE_EVENTS, PERMISSIONS.CHECK_IN_ATTENDEES],
  treasurer: [
    PERMISSIONS.MANAGE_PAYMENTS,
    PERMISSIONS.PROCESS_REFUNDS,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
  ],
  comms_manager: [
    PERMISSIONS.EDIT_CONTENT,
    PERMISSIONS.PUBLISH_ANNOUNCEMENTS,
    PERMISSIONS.SEND_COMMUNICATIONS,
  ],
  committee_lead: [
    PERMISSIONS.MANAGE_COMMITTEES,
    PERMISSIONS.VIEW_DIRECTORY,
  ],
  member: [PERMISSIONS.VIEW_DIRECTORY],
  visitor: [],
};

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export function normalizeRoles(value: unknown): Role[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter(isRole))];
}

export function hasRole(roles: readonly Role[], role: Role): boolean {
  return roles.includes(role);
}

export function hasPermission(
  roles: readonly Role[],
  permission: Permission
): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role].includes(permission));
}
