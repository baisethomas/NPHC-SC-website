import { NextRequest, NextResponse } from 'next/server';
import { messageService } from '@/lib/firestore';
import { requireUser } from '@/lib/authz';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

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