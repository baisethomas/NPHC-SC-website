import { NextRequest, NextResponse } from 'next/server';
import { messageService, activityService } from '@/lib/firestore';
import { verifyIdToken } from '@/lib/firebase-admin';
import { Message, MessageQuery } from '@/types/members';
import { messageQuerySchema, createMessageSchema, validateQueryParams, validateRequest } from '@/lib/validation-schemas';

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

    // Validate query parameters
    const validationResult = validateQueryParams(messageQuerySchema, request.nextUrl.searchParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.errors },
        { status: 400 }
      );
    }
    
    const query = validationResult.data as MessageQuery;

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
    
    // Validate message data
    const validationResult = validateRequest(createMessageSchema, messageData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid message data', details: validationResult.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const newMessage: Omit<Message, 'id'> = {
      ...validatedData,
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