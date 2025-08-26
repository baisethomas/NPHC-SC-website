import { NextRequest, NextResponse } from 'next/server';
import { requestService, activityService } from '@/lib/firestore';
import { verifyIdToken } from '@/lib/firebase-admin';
import { Request, RequestQuery } from '@/types/members';
import { requestQuerySchema, createRequestSchema, validateQueryParams, validateRequest } from '@/lib/validation-schemas';
import { handleApiError } from '@/lib/error-handler';
import { applyRateLimit, RATE_LIMITS } from '@/lib/rate-limiter';

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for read operations
    const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.READ, undefined, 'requests');
    if (rateLimitResponse) return rateLimitResponse;

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
    const validationResult = validateQueryParams(requestQuerySchema, request.nextUrl.searchParams);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validationResult.errors },
        { status: 400 }
      );
    }
    
    const query = validationResult.data as RequestQuery;

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
    return handleApiError(error, 'GET /api/members/requests');
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for create operations (more restrictive)
    const rateLimitResponse = applyRateLimit(request, RATE_LIMITS.CREATE, undefined, 'requests');
    if (rateLimitResponse) return rateLimitResponse;

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
    
    // Validate request data
    const validationResult = validateRequest(createRequestSchema, requestData);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;
    const newRequest: Omit<Request, 'id'> = {
      ...validatedData,
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
    return handleApiError(error, 'POST /api/members/requests');
  }
}