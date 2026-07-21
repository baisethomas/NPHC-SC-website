import { NextRequest, NextResponse } from 'next/server';
import { meetingService, activityService } from '@/lib/firestore-admin';
import { requireActiveMember } from '@/lib/authz';
import { requirePermission, withRoles } from '@/lib/authz-v2';
import { hasPermission, PERMISSIONS } from '@/lib/roles';
import { meetingCreateSchema } from '@/lib/member-api-schemas';
import { parsePagination } from '@/lib/pagination';
import { MeetingNote, MeetingQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    // Only meeting managers may see unapproved drafts or executive-session
    // notes; regular members are limited to approved, non-executive minutes.
    const canManageMeetings = hasPermission(
      withRoles(auth.user).roles,
      PERMISSIONS.MANAGE_DOCUMENTS
    );

    const searchParams = request.nextUrl.searchParams;
    const requestedType = searchParams.get('type') || undefined;
    const requestedStatus = searchParams.get('status') || undefined;
    if (!canManageMeetings && requestedType === 'executive') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const pagination = parsePagination(searchParams.get('page'), searchParams.get('limit'));
    const query: MeetingQuery = {
      type: requestedType,
      status: canManageMeetings ? requestedStatus : 'approved',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      ...pagination,
    };

    const meetings = await meetingService.getAll(query);
    if (!canManageMeetings) {
      meetings.items = meetings.items.filter((meeting) => meeting.type !== 'executive');
    }

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
    const auth = await requirePermission(request, PERMISSIONS.MANAGE_DOCUMENTS);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const parsedMeeting = meetingCreateSchema.safeParse(await request.json());
    if (!parsedMeeting.success) {
      return NextResponse.json({ error: 'Invalid meeting payload' }, { status: 400 });
    }
    const meetingData = parsedMeeting.data;
    
    const newMeeting: Omit<MeetingNote, 'id'> = {
      ...meetingData,
      createdBy: auth.user.uid,
      createdByName: auth.user.name || auth.user.email,
      lastModified: new Date().toISOString(),
      lastModifiedBy: auth.user.uid,
      attachments: [],
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