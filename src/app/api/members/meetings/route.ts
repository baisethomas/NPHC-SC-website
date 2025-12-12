import { NextRequest, NextResponse } from 'next/server';
import { meetingService, activityService } from '@/lib/firestore';
import { requireAdmin, requireUser } from '@/lib/authz';
import { MeetingNote, MeetingQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

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
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const meetingData = await request.json();
    
    const newMeeting: Omit<MeetingNote, 'id'> = {
      ...meetingData,
      createdBy: auth.user.uid,
      createdByName: auth.user.name || auth.user.email,
      lastModified: new Date().toISOString(),
      lastModifiedBy: auth.user.uid,
      attachments: meetingData.attachments || [],
      isActive: true
    };

    const meetingId = await meetingService.create(newMeeting);
    
    // Log activity
    await activityService.log({
      userId: auth.user.uid,
      userName: auth.user.name || auth.user.email,
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