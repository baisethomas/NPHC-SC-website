import { describe, expect, it } from 'vitest';
import {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasRole,
} from '@/lib/roles';

describe('roles and permissions', () => {
  it('grants every permission to super administrators', () => {
    expect(hasPermission(['super_admin'], PERMISSIONS.MANAGE_ROLES)).toBe(true);
    expect(hasPermission(['super_admin'], PERMISSIONS.VIEW_AUDIT_LOG)).toBe(true);
  });

  it('limits event managers to event permissions', () => {
    expect(hasPermission(['event_manager'], PERMISSIONS.MANAGE_EVENTS)).toBe(true);
    expect(hasPermission(['event_manager'], PERMISSIONS.CHECK_IN_ATTENDEES)).toBe(true);
    expect(hasPermission(['event_manager'], PERMISSIONS.MANAGE_MEMBERS)).toBe(false);
  });

  it('combines permissions across roles', () => {
    expect(
      hasPermission(
        ['content_editor', 'comms_manager'],
        PERMISSIONS.SEND_COMMUNICATIONS
      )
    ).toBe(true);
    expect(hasRole(['content_editor', 'comms_manager'], 'content_editor')).toBe(true);
  });

  it('defines permission mappings for every role', () => {
    expect(Object.keys(ROLE_PERMISSIONS)).toHaveLength(10);
  });
});
