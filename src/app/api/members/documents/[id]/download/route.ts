import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/firestore';
import { verifyIdToken } from '@/lib/firebase-admin';

export async function POST(
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
    
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const document = await documentService.getById(params.id);
    
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if user has access to restricted documents
    if (document.restricted && !decodedToken.admin) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Increment download count
    await documentService.incrementDownloadCount(params.id);

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