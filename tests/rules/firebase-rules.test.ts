import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const rulesPath = (filename: string) => resolve(process.cwd(), filename);

describe('Firebase security rules', () => {
  let testEnv: RulesTestEnvironment;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'nphc-solano-rules-test',
      firestore: {
        rules: readFileSync(rulesPath('firestore.rules'), 'utf8'),
      },
      storage: {
        rules: readFileSync(rulesPath('storage.rules'), 'utf8'),
      },
    });
  });

  beforeEach(async () => {
    await testEnv.clearFirestore();
    await testEnv.clearStorage();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('denies anonymous Firestore reads', async () => {
    const anonymous = testEnv.unauthenticatedContext();

    await assertFails(anonymous.firestore().doc('members/member-1').get());
  });

  it('allows a member to read only their own profile', async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await context.firestore().doc('members/member-1').set({ displayName: 'Owner' });
    });

    const owner = testEnv.authenticatedContext('member-1');
    const otherMember = testEnv.authenticatedContext('member-2');

    await assertSucceeds(owner.firestore().doc('members/member-1').get());
    await assertFails(otherMember.firestore().doc('members/member-1').get());
  });

  it('allows an admin-role user to access protected Firestore content', async () => {
    const admin = testEnv.authenticatedContext('admin-1', { roles: ['admin'] });

    await assertSucceeds(
      admin.firestore().doc('cms_announcements/announcement-1').set({ title: 'Admin update' }),
    );
    await assertSucceeds(admin.firestore().doc('cms_announcements/announcement-1').get());
  });

  it('blocks client writes to auditLogs, payments, and invoices even for admins', async () => {
    const admin = testEnv.authenticatedContext('admin-1', { roles: ['admin'] });

    await assertFails(admin.firestore().doc('auditLogs/entry-1').set({ action: 'tamper' }));
    await assertFails(admin.firestore().doc('payments/payment-1').set({ amount: 0 }));
    await assertFails(admin.firestore().doc('invoices/invoice-1').set({ amount: 0 }));
    // Reads stay available to admins.
    await assertSucceeds(admin.firestore().doc('auditLogs/entry-1').get());
  });

  it('denies members write access to their own profile document', async () => {
    const owner = testEnv.authenticatedContext('member-1', { roles: ['member'] });

    await assertFails(owner.firestore().doc('members/member-1').set({ roles: ['admin'] }));
  });

  it('grants access via the legacy admin claim (until the bridge is retired)', async () => {
    const legacyAdmin = testEnv.authenticatedContext('legacy-1', { admin: true });

    await assertSucceeds(legacyAdmin.firestore().doc('events/event-1').get());
  });

  it('allows storage writes for admins and denies ordinary users', async () => {
    const admin = testEnv.authenticatedContext('admin-1', { roles: ['super_admin'] });
    const member = testEnv.authenticatedContext('member-1', { roles: ['member'] });
    const file = new Uint8Array([1, 2, 3]);

    await assertSucceeds(Promise.resolve(admin.storage().ref('uploads/admin-file.txt').put(file)));
    await assertFails(Promise.resolve(member.storage().ref('uploads/member-file.txt').put(file)));
  });

  it('denies elevated non-admin roles access to CMS collections', async () => {
    const editor = testEnv.authenticatedContext('editor-1', { roles: ['content_editor'] });
    const treasurer = testEnv.authenticatedContext('treasurer-1', { roles: ['treasurer'] });

    await assertFails(editor.firestore().doc('cms_announcements/a-1').set({ title: 'x' }));
    await assertFails(editor.firestore().doc('cms_announcements/a-1').get());
    await assertFails(treasurer.firestore().doc('payments/p-1').get());
  });

  it('denies members and anonymous users all storage reads', async () => {
    const member = testEnv.authenticatedContext('member-1', { roles: ['member'] });
    const anonymous = testEnv.unauthenticatedContext();

    await assertFails(Promise.resolve(member.storage().ref('documents/file.pdf').getDownloadURL()));
    await assertFails(Promise.resolve(anonymous.storage().ref('documents/file.pdf').getDownloadURL()));
  });

  it('denies anonymous reads of legacy public-site collections (server-rendered only)', async () => {
    const anonymous = testEnv.unauthenticatedContext();

    await assertFails(anonymous.firestore().doc('events/event-1').get());
    await assertFails(anonymous.firestore().doc('announcements/news-1').get());
    await assertFails(anonymous.firestore().doc('organizations/org-1').get());
  });

  it('denies tokens without a roles claim instead of erroring', async () => {
    const noRoles = testEnv.authenticatedContext('plain-1');

    await assertFails(noRoles.firestore().doc('events/event-1').get());
  });
});
