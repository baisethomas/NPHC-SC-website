import { NextRequest, NextResponse } from 'next/server';
import { documentService, activityService } from '@/lib/firestore';
import { requireAdmin, requireUser } from '@/lib/authz';
import { Document, DocumentQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const searchParams = request.nextUrl.searchParams;
    const query: DocumentQuery = {
      category: searchParams.get('category') || undefined,
      restricted: searchParams.get('restricted') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    const documents = await documentService.getAll(query);
    
    return NextResponse.json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const documentData = await request.json();
    
    const newDocument: Omit<Document, 'id'> = {
      ...documentData,
      uploadedBy: auth.user.uid,
      uploadedByName: auth.user.name || auth.user.email,
      lastUpdated: new Date().toISOString(),
      downloadCount: 0,
      isActive: true
    };

    const documentId = await documentService.create(newDocument);
    
    // Log activity
    await activityService.log({
      userId: auth.user.uid,
      userName: auth.user.name || auth.user.email,
      action: 'document_uploaded',
      resourceId: documentId,
      resourceType: 'document',
      resourceTitle: documentData.title,
      metadata: {
        category: documentData.category,
        version: documentData.version
      }
    });

    return NextResponse.json({
      success: true,
      data: { id: documentId },
      message: 'Document created successfully'
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
