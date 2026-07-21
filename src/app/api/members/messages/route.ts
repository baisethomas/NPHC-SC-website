import { NextRequest, NextResponse } from 'next/server';
import { messageService, activityService } from '@/lib/firestore-admin';
import { requireActiveMember } from '@/lib/authz';
import { requirePermission } from '@/lib/authz-v2';
import { PERMISSIONS } from '@/lib/roles';
import { getMemberAccessRecord } from '@/lib/member-access';
import { canViewMessage, messageResponse } from '@/lib/member-content-access';
import { messageCreateSchema } from '@/lib/member-api-schemas';
import { parsePagination } from '@/lib/pagination';
import { Message, MessageQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams.get('page'), searchParams.get('limit'));
    const query: MessageQuery = {
      category: searchParams.get('category') || undefined,
      priority: searchParams.get('priority') || undefined,
      unreadOnly: searchParams.get('unreadOnly') === 'true',
      pinnedOnly: searchParams.get('pinnedOnly') === 'true',
      cursor: searchParams.get('cursor') || undefined,
      ...pagination,
    };

    const messages = await messageService.getAll(query);
    const member = await getMemberAccessRecord(auth.user.uid);
    let visibleMessages = messages.items.filter((message) =>
      canViewMessage(message, auth.user, member)
    );
    
    // Filter messages based on user's read status if unreadOnly is true
    if (query.unreadOnly) {
      visibleMessages = visibleMessages.filter(message => 
        !message.readBy.some(read => read.userId === auth.user.uid)
      );
    }

    const responseMessages = visibleMessages.map((message) =>
      messageResponse(message, auth.user.uid)
    );
    
    return NextResponse.json({
      success: true,
      data: {
        ...messages,
        items: responseMessages,
      }
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
    const auth = await requirePermission(request, PERMISSIONS.SEND_COMMUNICATIONS);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const parsedMessage = messageCreateSchema.safeParse(await request.json());
    if (!parsedMessage.success) {
      return NextResponse.json({ error: 'Invalid message payload' }, { status: 400 });
    }
    const messageData = parsedMessage.data;
    
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