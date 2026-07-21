import { NextRequest, NextResponse } from 'next/server';
import { documentService, activityService } from '@/lib/firestore-admin';
import { requireActiveMember } from '@/lib/authz';
import { requirePermission } from '@/lib/authz-v2';
import { PERMISSIONS } from '@/lib/roles';
import { getMemberAccessRecord } from '@/lib/member-access';
import { canAccessDocument, documentResponse } from '@/lib/member-content-access';
import { documentUpdateSchema } from '@/lib/member-api-schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const document = await documentService.getById(id);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const member = await getMemberAccessRecord(auth.user.uid);
    if (!canAccessDocument(document, auth.user, member)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: documentResponse(document)
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requirePermission(request, PERMISSIONS.MANAGE_DOCUMENTS);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const parsedUpdates = documentUpdateSchema.safeParse(await request.json());
    if (!parsedUpdates.success || Object.keys(parsedUpdates.data).length === 0) {
      return NextResponse.json({ error: 'Invalid document update' }, { status: 400 });
    }
    
    await documentService.update(id, parsedUpdates.data);

    return NextResponse.json({
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requirePermission(request, PERMISSIONS.MANAGE_DOCUMENTS);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    await documentService.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}