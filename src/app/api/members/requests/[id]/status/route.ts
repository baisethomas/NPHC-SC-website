import { NextRequest, NextResponse } from 'next/server';
import { requestService, activityService } from '@/lib/firestore-admin';
import { requirePermission } from '@/lib/authz-v2';
import { PERMISSIONS } from '@/lib/roles';
import { Request } from '@/types/members';
import { requestStatusSchema } from '@/lib/member-api-schemas';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requirePermission(request, PERMISSIONS.APPROVE_MEMBERS);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const parsedStatus = requestStatusSchema.safeParse(await request.json());
    if (!parsedStatus.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const { status, reviewNotes } = parsedStatus.data;

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
      // Log activity with the transition that actually happened; "under
      // review" and "reopened" are not denials.
      const ACTIVITY_ACTION = {
        approved: 'request_approved',
        denied: 'request_denied',
        under_review: 'request_under_review',
        pending: 'request_reopened',
      } as const;
      await activityService.log({
        userId: auth.user.uid,
        userName: auth.user.name || auth.user.email,
        action: ACTIVITY_ACTION[status],
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