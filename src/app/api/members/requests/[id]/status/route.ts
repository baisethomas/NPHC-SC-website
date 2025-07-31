import { NextRequest, NextResponse } from 'next/server';
import { requestService, activityService } from '@/lib/firestore';
import { verifyIdToken } from '@/lib/firebase-admin';
import { Request } from '@/types/members';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { status, reviewNotes } = await request.json();
    
    if (!['pending', 'under_review', 'approved', 'denied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await requestService.updateStatus(
      params.id,
      status,
      decodedToken.uid,
      decodedToken.name || decodedToken.email,
      reviewNotes
    );

    // Get the request to log activity
    const updatedRequest = await requestService.getById(params.id);
    
    if (updatedRequest) {
      // Log activity
      await activityService.log({
        userId: decodedToken.uid,
        userName: decodedToken.name || decodedToken.email,
        action: status === 'approved' ? 'request_approved' : 'request_denied',
        resourceId: params.id,
        resourceType: 'request',
        resourceTitle: updatedRequest.title,
        metadata: {
          newStatus: status,
          reviewNotes: reviewNotes || ''
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Request ${status} successfully`
    });
  } catch (error) {
    console.error('Error updating request status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}