import { NextRequest, NextResponse } from 'next/server';
import { messageService, activityService } from '@/lib/firestore';
import { requireAdmin, requireUser } from '@/lib/authz';
import { Message, MessageQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const searchParams = request.nextUrl.searchParams;
    const query: MessageQuery = {
      category: searchParams.get('category') || undefined,
      priority: searchParams.get('priority') || undefined,
      unreadOnly: searchParams.get('unreadOnly') === 'true',
      pinnedOnly: searchParams.get('pinnedOnly') === 'true',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const messages = await messageService.getAll(query);
    
    // Filter messages based on user's read status if unreadOnly is true
    if (query.unreadOnly) {
      messages.items = messages.items.filter(message => 
        !message.readBy.some(read => read.userId === auth.user.uid)
      );
    }
    
    return NextResponse.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const messageData = await request.json();
    
    const newMessage: Omit<Message, 'id'> = {
      ...messageData,
      senderId: auth.user.uid,
      senderName: auth.user.name || auth.user.email,
      senderRole: 'Admin',
      timestamp: new Date().toISOString(),
      readBy: [],
      isActive: true
    };

    const messageId = await messageService.create(newMessage);
    
    // Log activity
    await activityService.log({
      userId: auth.user.uid,
      userName: auth.user.name || auth.user.email,
      action: 'message_sent',
      resourceId: messageId,
      resourceType: 'message',
      resourceTitle: messageData.title,
      metadata: {
        category: messageData.category,
        priority: messageData.priority,
        targetAudience: messageData.targetAudience
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: messageId },
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}