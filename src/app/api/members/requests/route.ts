import { NextRequest, NextResponse } from 'next/server';
import { requestService, activityService } from '@/lib/firestore';
import { isAdminUser, requireUser } from '@/lib/authz';
import { Request, RequestQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const searchParams = request.nextUrl.searchParams;
    const query: RequestQuery = {
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      submittedBy: searchParams.get('submittedBy') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    // If not admin, filter to only show user's own requests
    if (!isAdminUser(auth.user)) {
      query.submittedBy = auth.user.uid;
    }

    const requests = await requestService.getAll(query);
    
    return NextResponse.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const requestData = await request.json();
    
    const newRequest: Omit<Request, 'id'> = {
      ...requestData,
      submittedBy: auth.user.uid,
      submittedByName: auth.user.name || auth.user.email,
      submittedByEmail: auth.user.email,
      submittedDate: new Date().toISOString(),
      status: 'pending',
      isActive: true
    };

    const requestId = await requestService.create(newRequest);
    
    // Log activity
    await activityService.log({
      userId: auth.user.uid,
      userName: auth.user.name || auth.user.email,
      action: 'request_submitted',
      resourceId: requestId,
      resourceType: 'request',
      resourceTitle: requestData.title,
      metadata: {
        type: requestData.type,
        priority: requestData.priority
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: requestId },
      message: 'Request submitted successfully'
    });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}