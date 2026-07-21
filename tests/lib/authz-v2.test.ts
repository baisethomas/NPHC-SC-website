import { describe, expect, it } from 'vitest';
import { getRolesFromClaims } from '@/lib/authz-v2';

describe('getRolesFromClaims', () => {
  it('uses valid roles custom claims', () => {
    expect(getRolesFromClaims({ roles: ['event_manager', 'member', 'invalid'] })).toEqual([
      'event_manager',
      'member',
    ]);
  });

  it('maps the legacy admin claim during the migration window', () => {
    expect(getRolesFromClaims({ admin: true })).toEqual(['admin']);
  });

  it('treats unrecognized claims as a visitor', () => {
    expect(getRolesFromClaims({ roles: ['not-a-role'] })).toEqual(['visitor']);
  });
});
