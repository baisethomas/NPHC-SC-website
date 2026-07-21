import type { AuthzUser } from '@/lib/authz';
import type { Document, Message } from '@/types/members';
import type { MemberAccessRecord } from '@/lib/member-access';
import { isAdminUser } from '@/lib/authz';

export function canAccessDocument(
  document: Document,
  user: AuthzUser,
  member: MemberAccessRecord | null
): boolean {
  if (!document.restricted || isAdminUser(user)) return true;

  return (
    document.restrictedRoles?.includes(member?.role ?? '') === true
  );
}

export function documentResponse(document: Document): Omit<Document, 'fileUrl'> {
  const { fileUrl: _fileUrl, ...safeDocument } = document;
  return safeDocument;
}

export function canViewMessage(
  message: Message,
  user: AuthzUser,
  member: MemberAccessRecord | null
): boolean {
  if (isAdminUser(user)) return true;

  // A user with no member record must never satisfy a role filter: the empty
  // string matches nothing, so this helper fails closed even if a caller
  // forgets to gate on active membership first.
  const role = member?.role ?? '';
  if (message.targetAudience === 'admins') return false;
  if (message.targetAudience === 'officers' && role !== 'officer') return false;

  if (message.targetRoles?.length && !message.targetRoles.includes(role)) {
    return false;
  }

  return !message.targetOrganizations?.length ||
    message.targetOrganizations.includes(member?.organizationId ?? '');
}

export function messageResponse(message: Message, userId: string) {
  const { readBy, attachments, ...safeMessage } = message;
  return {
    ...safeMessage,
    readBy: readBy.filter((read) => read.userId === userId),
    attachments: attachments?.map(({ fileUrl: _fileUrl, ...attachment }) => attachment),
  };
}
