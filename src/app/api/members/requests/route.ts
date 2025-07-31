import { NextRequest, NextResponse } from 'next/server';
import { requestService, activityService } from '@/lib/firestore';
import { verifyIdToken } from '@/lib/firebase-admin';
import { Request, RequestQuery } from '@/types/members';

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
    if (!decodedToken.admin) {
      query.submittedBy = decodedToken.uid;
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
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const requestData = await request.json();
    
    const newRequest: Omit<Request, 'id'> = {
      ...requestData,
      submittedBy: decodedToken.uid,
      submittedByName: decodedToken.name || decodedToken.email,
      submittedByEmail: decodedToken.email,
      submittedDate: new Date().toISOString(),
      status: 'pending',
      isActive: true
    };

    const requestId = await requestService.create(newRequest);
    
    // Log activity
    await activityService.log({
      userId: decodedToken.uid,
      userName: decodedToken.name || decodedToken.email,
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