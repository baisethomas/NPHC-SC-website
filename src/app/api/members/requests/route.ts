import { NextRequest, NextResponse } from 'next/server';
import { requestService, activityService } from '@/lib/firestore-admin';
import { isAdminUser, requireActiveMember } from '@/lib/authz';
import { requestCreateSchema } from '@/lib/member-api-schemas';
import { checkDurableRateLimit } from '@/lib/durable-rate-limiter';
import { RATE_LIMITS } from '@/lib/rate-limiter';
import { parsePagination } from '@/lib/pagination';
import { Request, RequestQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams.get('page'), searchParams.get('limit'));
    const query: RequestQuery = {
      type: searchParams.get('type') || undefined,
      status: searchParams.get('status') || undefined,
      submittedBy: searchParams.get('submittedBy') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      ...pagination,
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
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const rateLimit = await checkDurableRateLimit(
      `member-requests:${auth.user.uid}`,
      RATE_LIMITS.CREATE
    );
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const parsedRequest = requestCreateSchema.safeParse(await request.json());
    if (!parsedRequest.success) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }
    if (!auth.user.email) {
      return NextResponse.json({ error: 'Account email is required' }, { status: 400 });
    }
    const requestData = parsedRequest.data;
    
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