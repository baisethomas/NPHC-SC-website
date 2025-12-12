import { NextRequest, NextResponse } from 'next/server';
import { requestService, activityService } from '@/lib/firestore';
import { requireAdmin } from '@/lib/authz';
import { Request } from '@/types/members';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { status, reviewNotes } = await request.json();
    
    if (!['pending', 'under_review', 'approved', 'denied'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await requestService.updateStatus(
      id,
      status,
      auth.user.uid,
      auth.user.name || auth.user.email,
      reviewNotes
    );

    // Get the request to log activity
    const updatedRequest = await requestService.getById(id);
    
    if (updatedRequest) {
      // Log activity
      await activityService.log({
        userId: auth.user.uid,
        userName: auth.user.name || auth.user.email,
        action: status === 'approved' ? 'request_approved' : 'request_denied',
        resourceId: id,
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