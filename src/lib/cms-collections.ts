// ASPIRATIONAL SCHEMA — most of these collections are not built. Nothing in
// the app imports this file today; the production data layer uses its own
// collection map in src/lib/firestore-admin.ts over the legacy collections.
// Only `members` and `auditLogs` below exist with real data. Consult
// CMS_ROADMAP.md before building against any of the others.
export const CMS_COLLECTIONS = {
  MEMBERS: 'members',
  MEMBERSHIP_TIERS: 'membershipTiers',
  EVENTS: 'cms_events',
  REGISTRATIONS: 'registrations',
  INVOICES: 'invoices',
  PAYMENTS: 'payments',
  DONATIONS: 'donations',
  ANNOUNCEMENTS: 'cms_announcements',
  CONTENT_PAGES: 'contentPages',
  DOCUMENTS: 'cms_documents',
  COMMITTEES: 'committees',
  AUDIT_LOGS: 'auditLogs',
  ANALYTICS_DAILY: 'analyticsDaily',
} as const;

export const LEGACY_COLLECTIONS = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  MEETINGS: 'meetings',
  MESSAGES: 'messages',
  REQUESTS: 'requests',
  ACTIVITIES: 'activities',
  ORGANIZATIONS: 'organizations',
  EVENTS: 'events',
  ANNOUNCEMENTS: 'announcements',
  BOARD: 'boardMembers',
  PROGRAMS: 'programs',
} as const;
