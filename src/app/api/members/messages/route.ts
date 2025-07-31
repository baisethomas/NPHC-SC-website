import { NextRequest, NextResponse } from 'next/server';
import { messageService, activityService } from '@/lib/firestore';
import { verifyIdToken } from '@/lib/firebase-admin';
import { Message, MessageQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

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
        !message.readBy.some(read => read.userId === decodedToken.uid)
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
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken || !decodedToken.admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const messageData = await request.json();
    
    const newMessage: Omit<Message, 'id'> = {
      ...messageData,
      senderId: decodedToken.uid,
      senderName: decodedToken.name || decodedToken.email,
      senderRole: decodedToken.admin ? 'Admin' : 'Member',
      timestamp: new Date().toISOString(),
      readBy: [],
      isActive: true
    };

    const messageId = await messageService.create(newMessage);
    
    // Log activity
    await activityService.log({
      userId: decodedToken.uid,
      userName: decodedToken.name || decodedToken.email,
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