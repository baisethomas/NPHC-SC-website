import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/firestore';
import { isAdminUser, requireUser } from '@/lib/authz';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const document = await documentService.getById(id);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user has access to restricted documents
    if (document.restricted && !isAdminUser(auth.user)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Increment download count
    await documentService.incrementDownloadCount(id);

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: document.fileUrl,
        fileName: document.fileName
      }
    });
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}