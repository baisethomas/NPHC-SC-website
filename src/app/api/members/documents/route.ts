import { NextRequest, NextResponse } from 'next/server';
import { documentService, activityService } from '@/lib/firestore-admin';
import { requireActiveMember } from '@/lib/authz';
import { requirePermission } from '@/lib/authz-v2';
import { PERMISSIONS } from '@/lib/roles';
import { getMemberAccessRecord } from '@/lib/member-access';
import { canAccessDocument, documentResponse } from '@/lib/member-content-access';
import { documentCreateSchema } from '@/lib/member-api-schemas';
import { parsePagination } from '@/lib/pagination';
import { Document, DocumentQuery } from '@/types/members';

export async function GET(request: NextRequest) {
  try {
    const auth = await requireActiveMember(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const searchParams = request.nextUrl.searchParams;
    const pagination = parsePagination(searchParams.get('page'), searchParams.get('limit'));
    const query: DocumentQuery = {
      category: searchParams.get('category') || undefined,
      restricted: searchParams.get('restricted') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined,
      cursor: searchParams.get('cursor') || undefined,
      ...pagination,
    };

    const documents = await documentService.getAll(query);
    const member = await getMemberAccessRecord(auth.user.uid);
    const visibleDocuments = documents.items
      .filter((document) => canAccessDocument(document, auth.user, member))
      .map(documentResponse);
    
    return NextResponse.json({
      success: true,
      data: { ...documents, items: visibleDocuments }
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
    const auth = await requirePermission(request, PERMISSIONS.MANAGE_DOCUMENTS);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const parsedDocument = documentCreateSchema.safeParse(await request.json());
    if (!parsedDocument.success) {
      return NextResponse.json({ error: 'Invalid document payload' }, { status: 400 });
    }
    const documentData = parsedDocument.data;
    
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
