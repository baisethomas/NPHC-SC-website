import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/lib/firestore-admin';
import { requireActiveMember } from '@/lib/authz';
import { getMemberAccessRecord } from '@/lib/member-access';
import { canViewMessage } from '@/lib/member-content-access';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const message = await messageService.getById(id);
    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const member = await getMemberAccessRecord(auth.user.uid);
    if (!canViewMessage(message, auth.user, member)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await messageService.markAsRead(id, auth.user.uid);

    return NextResponse.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}