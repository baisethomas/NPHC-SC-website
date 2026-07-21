import { NextRequest, NextResponse } from 'next/server';
import { documentService } from '@/lib/firestore-admin';
import { admin } from '@/lib/firebase-admin';
import { requireActiveMember } from '@/lib/authz';
import { getMemberAccessRecord } from '@/lib/member-access';
import { canAccessDocument } from '@/lib/member-content-access';
import { requireActiveMemberSession } from '@/lib/server-auth';
import { isSafeStoragePath, isTrustedFileUrl } from '@/lib/member-api-schemas';

export async function POST(
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

    // Increment download count
    await documentService.incrementDownloadCount(id);

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: `/api/members/documents/${id}/download`,
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const auth = await requireActiveMemberSession();
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

    const document = await documentService.getById(id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const member = await getMemberAccessRecord(auth.user.uid);
    if (!canAccessDocument(document, auth.user, member)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Re-validate stored pointers at serve time: records created before the
    // schema tightened (or written by any other path) must never reach the
    // bucket-wide read or server-side fetch below.
    if (document.storagePath && !isSafeStoragePath(document.storagePath)) {
      console.error(`Blocked unsafe storagePath on document ${id}`);
      return NextResponse.json({ error: 'Document is temporarily unavailable' }, { status: 502 });
    }
    if (!document.storagePath && document.fileUrl && !isTrustedFileUrl(document.fileUrl)) {
      console.error(`Blocked untrusted fileUrl on document ${id}`);
      return NextResponse.json({ error: 'Document is temporarily unavailable' }, { status: 502 });
    }

    await documentService.incrementDownloadCount(id);
    if (document.storagePath) {
      const [contents] = await admin
        .storage()
        .bucket()
        .file(document.storagePath)
        .download();
      return new NextResponse(new Uint8Array(contents), {
        headers: {
          'Content-Disposition': `attachment; filename="${document.fileName.replace(/"/g, '')}"`,
          'Content-Type': document.mimeType,
          'Cache-Control': 'private, no-store',
        },
      });
    }

    if (!document.fileUrl) {
      return NextResponse.json({ error: 'Document is temporarily unavailable' }, { status: 502 });
    }
    const source = await fetch(document.fileUrl);
    if (!source.ok || !source.body) {
      console.error(`Document proxy failed for ${id}: ${source.status}`);
      return NextResponse.json({ error: 'Document is temporarily unavailable' }, { status: 502 });
    }

    return new NextResponse(source.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${document.fileName.replace(/"/g, '')}"`,
        'Content-Type': source.headers.get('content-type') ?? document.mimeType,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Error proxying document download:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}