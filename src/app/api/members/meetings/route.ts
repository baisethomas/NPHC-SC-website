import { NextRequest, NextResponse } from 'next/server';
import { meetingService, activityService } from '@/lib/firestore';
import { verifyIdToken } from '@/lib/firebase-admin';
import { MeetingNote, MeetingQuery } from '@/types/members';

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
    const query: MeetingQuery = {
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const meetings = await meetingService.getAll(query);
    
    return NextResponse.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
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

    const meetingData = await request.json();
    
    const newMeeting: Omit<MeetingNote, 'id'> = {
      ...meetingData,
      createdBy: decodedToken.uid,
      createdByName: decodedToken.name || decodedToken.email,
      lastModified: new Date().toISOString(),
      lastModifiedBy: decodedToken.uid,
      attachments: meetingData.attachments || [],
      isActive: true
    };

    const meetingId = await meetingService.create(newMeeting);
    
    // Log activity
    await activityService.log({
      userId: decodedToken.uid,
      userName: decodedToken.name || decodedToken.email,
      action: 'meeting_created',
      resourceId: meetingId,
      resourceType: 'meeting',
      resourceTitle: meetingData.title,
      metadata: {
        type: meetingData.type,
        date: meetingData.date
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: meetingId },
      message: 'Meeting created successfully'
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}