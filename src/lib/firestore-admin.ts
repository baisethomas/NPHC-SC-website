// Server-side Firestore operations using Firebase Admin SDK.
// Use this in API routes and Server Actions — NOT the client-side firestore.ts.
//
// List queries are bounded cursor queries. Filters that Firestore can express
// are applied in the query; text and per-user visibility filters remain at
// the API layer because they cannot be indexed safely in this schema.

import { adminDb } from './firebase-admin';
import {
  Document,
  MeetingNote,
  Message,
  Request,
  Activity,
  ActivityQuery,
  PaginatedResponse,
  DocumentQuery,
  MeetingQuery,
  MessageQuery,
  RequestQuery,
} from '@/types/members';
import { decodeFirestoreCursor, encodeFirestoreCursor } from './firestore-cursor';
import { FieldPath, FieldValue, Query, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';

const COLLECTIONS = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  MEETINGS: 'meetings',
  MESSAGES: 'messages',
  REQUESTS: 'requests',
  ACTIVITIES: 'activities',
  ORGANIZATIONS: 'organizations',
} as const;

function timestampToString(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function getDb() {
  if (!adminDb) throw new Error('Firebase Admin DB is not initialized.');
  return adminDb;
}

function pageSize(limit: number | undefined): number {
  return Math.min(Math.max(limit ?? 10, 1), 50);
}

async function getCursorPage<T>(
  query: Query,
  orderField: string,
  params: { cursor?: string; limit?: number; page?: number },
  map: (snapshot: QueryDocumentSnapshot) => T,
  matches: (item: T) => boolean = () => true
): Promise<PaginatedResponse<T>> {
  const limit = pageSize(params.limit);
  let pagedQuery = query
    .orderBy(orderField, 'desc')
    .orderBy(FieldPath.documentId(), 'desc');

  if (params.cursor) {
    const cursor = decodeFirestoreCursor(params.cursor);
    pagedQuery = pagedQuery.startAfter(Timestamp.fromDate(new Date(cursor.value)), cursor.id);
  }

  const snapshot = await pagedQuery.limit(limit + 1).get();
  const pageDocuments = snapshot.docs.slice(0, limit);
  const hasMore = snapshot.docs.length > limit;
  const lastDocument = pageDocuments.at(-1);

  return {
    items: pageDocuments.map(map).filter(matches),
    nextCursor:
      hasMore && lastDocument
        ? encodeFirestoreCursor({
            value: timestampToString(lastDocument.get(orderField)),
            id: lastDocument.id,
          })
        : undefined,
    hasMore,
    // Offset page numbers are retained in query types for migration only.
    page: 1,
    limit,
  };
}

// ---------------------------------------------------------------------------
// Document service
// ---------------------------------------------------------------------------
export const documentService = {
  async getAll(queryParams: DocumentQuery = {}): Promise<PaginatedResponse<Document>> {
    const db = getDb();
    let query: Query = db
      .collection(COLLECTIONS.DOCUMENTS)
      .where('isActive', '==', true);

    if (queryParams.category) query = query.where('category', '==', queryParams.category);
    if (queryParams.restricted !== undefined) {
      query = query.where('restricted', '==', queryParams.restricted);
    }

    return getCursorPage(
      query,
      'lastUpdated',
      queryParams,
      (d) => ({
        id: d.id,
        ...(d.data() as Omit<Document, 'id'>),
        lastUpdated: timestampToString(d.data().lastUpdated),
      }),
      (document) => {
        if (!queryParams.search) return true;
        const term = queryParams.search.toLowerCase();
        return (
          document.title.toLowerCase().includes(term) ||
          document.description?.toLowerCase().includes(term)
        );
      }
    );
  },

  async getById(id: string): Promise<Document | null> {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.DOCUMENTS).doc(id).get();
    if (!snap.exists) return null;
    return {
      id: snap.id,
      ...(snap.data() as Omit<Document, 'id'>),
      lastUpdated: timestampToString(snap.data()!.lastUpdated),
    };
  },

  async create(document: Omit<Document, 'id'>): Promise<string> {
    const db = getDb();
    const ref = await db.collection(COLLECTIONS.DOCUMENTS).add({
      ...document,
      lastUpdated: FieldValue.serverTimestamp(),
      downloadCount: 0,
      isActive: true,
    });
    return ref.id;
  },

  async update(id: string, updates: Partial<Document>): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.DOCUMENTS).doc(id).update({
      ...updates,
      lastUpdated: FieldValue.serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.DOCUMENTS).doc(id).update({ isActive: false });
  },

  async incrementDownloadCount(id: string): Promise<void> {
    const db = getDb();
    await db
      .collection(COLLECTIONS.DOCUMENTS)
      .doc(id)
      .update({ downloadCount: FieldValue.increment(1) });
  },
};

// ---------------------------------------------------------------------------
// Message service
// ---------------------------------------------------------------------------
export const messageService = {
  async getAll(queryParams: MessageQuery = {}): Promise<PaginatedResponse<Message>> {
    const db = getDb();
    let query: Query = db
      .collection(COLLECTIONS.MESSAGES)
      .where('isActive', '==', true);

    if (queryParams.category) query = query.where('category', '==', queryParams.category);
    if (queryParams.priority) query = query.where('priority', '==', queryParams.priority);
    if (queryParams.pinnedOnly) query = query.where('pinned', '==', true);

    return getCursorPage(query, 'timestamp', queryParams, (d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, 'id'>),
        timestamp: timestampToString(d.data().timestamp),
      }));
  },

  async getById(id: string): Promise<Message | null> {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.MESSAGES).doc(id).get();
    if (!snap.exists) return null;
    return {
      id: snap.id,
      ...(snap.data() as Omit<Message, 'id'>),
      timestamp: timestampToString(snap.data()!.timestamp),
    };
  },

  async create(message: Omit<Message, 'id'>): Promise<string> {
    const db = getDb();
    const ref = await db.collection(COLLECTIONS.MESSAGES).add({
      ...message,
      timestamp: FieldValue.serverTimestamp(),
      readBy: [],
      isActive: true,
    });
    return ref.id;
  },

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const db = getDb();
    const ref = db.collection(COLLECTIONS.MESSAGES).doc(messageId);
    const snap = await ref.get();
    if (!snap.exists) return;

    const data = snap.data() as Message;
    const readBy = data.readBy || [];
    if (!readBy.some((r) => r.userId === userId)) {
      readBy.push({ userId, readAt: new Date().toISOString() });
      await ref.update({ readBy });
    }
  },

  async update(id: string, updates: Partial<Message>): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.MESSAGES).doc(id).update(updates);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.MESSAGES).doc(id).update({ isActive: false });
  },
};

// ---------------------------------------------------------------------------
// Activity service
// ---------------------------------------------------------------------------
export const activityService = {
  async log(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const db = getDb();
      await db.collection(COLLECTIONS.ACTIVITIES).add({
        ...activity,
        timestamp: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      // Activity logging should never break the main flow
      console.error('Error logging activity:', error);
    }
  },

  async getRecent(queryParams: ActivityQuery = {}): Promise<PaginatedResponse<Activity>> {
    const db = getDb();
    let query: Query = db
      .collection(COLLECTIONS.ACTIVITIES)
    if (queryParams.userId) query = query.where('userId', '==', queryParams.userId);

    return getCursorPage(query, 'timestamp', queryParams, (d) => ({
      id: d.id,
      ...(d.data() as Omit<Activity, 'id'>),
      timestamp: timestampToString(d.data().timestamp),
    }));
  },
};

// ---------------------------------------------------------------------------
// Meeting service
// ---------------------------------------------------------------------------
export const meetingService = {
  async getAll(queryParams: MeetingQuery = {}): Promise<PaginatedResponse<MeetingNote>> {
    const db = getDb();
    let query: Query = db
      .collection(COLLECTIONS.MEETINGS)
      .where('isActive', '==', true);

    if (queryParams.type) query = query.where('type', '==', queryParams.type);
    if (queryParams.status) query = query.where('status', '==', queryParams.status);
    if (queryParams.dateFrom) {
      query = query.where('date', '>=', Timestamp.fromDate(new Date(queryParams.dateFrom)));
    }
    if (queryParams.dateTo) {
      query = query.where('date', '<=', Timestamp.fromDate(new Date(queryParams.dateTo)));
    }

    return getCursorPage(query, 'date', queryParams, (d) => ({
        id: d.id,
        ...(d.data() as Omit<MeetingNote, 'id'>),
        date: timestampToString(d.data().date),
        lastModified: timestampToString(d.data().lastModified),
      }));
  },

  async getById(id: string): Promise<MeetingNote | null> {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.MEETINGS).doc(id).get();
    if (!snap.exists) return null;
    return {
      id: snap.id,
      ...(snap.data() as Omit<MeetingNote, 'id'>),
      date: timestampToString(snap.data()!.date),
      lastModified: timestampToString(snap.data()!.lastModified),
    };
  },

  async create(meeting: Omit<MeetingNote, 'id'>): Promise<string> {
    const db = getDb();
    const ref = await db.collection(COLLECTIONS.MEETINGS).add({
      ...meeting,
      date: meeting.date ? Timestamp.fromDate(new Date(meeting.date)) : FieldValue.serverTimestamp(),
      lastModified: FieldValue.serverTimestamp(),
      isActive: true,
    });
    return ref.id;
  },

  async update(id: string, updates: Partial<MeetingNote>): Promise<void> {
    const db = getDb();
    const updateData: Record<string, unknown> = {
      ...updates,
      lastModified: FieldValue.serverTimestamp(),
    };
    if (updates.date) {
      updateData.date = Timestamp.fromDate(new Date(updates.date));
    }
    await db.collection(COLLECTIONS.MEETINGS).doc(id).update(updateData);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.MEETINGS).doc(id).update({ isActive: false });
  },
};

// ---------------------------------------------------------------------------
// Request service
// ---------------------------------------------------------------------------
export const requestService = {
  async getAll(queryParams: RequestQuery = {}): Promise<PaginatedResponse<Request>> {
    const db = getDb();
    let query: Query = db
      .collection(COLLECTIONS.REQUESTS)
      .where('isActive', '==', true);

    if (queryParams.type) query = query.where('type', '==', queryParams.type);
    if (queryParams.status) query = query.where('status', '==', queryParams.status);
    if (queryParams.submittedBy) {
      query = query.where('submittedBy', '==', queryParams.submittedBy);
    }
    if (queryParams.dateFrom) {
      query = query.where('submittedDate', '>=', Timestamp.fromDate(new Date(queryParams.dateFrom)));
    }
    if (queryParams.dateTo) {
      query = query.where('submittedDate', '<=', Timestamp.fromDate(new Date(queryParams.dateTo)));
    }

    return getCursorPage(query, 'submittedDate', queryParams, (d) => ({
        id: d.id,
        ...(d.data() as Omit<Request, 'id'>),
        submittedDate: timestampToString(d.data().submittedDate),
        reviewedDate: d.data().reviewedDate
          ? timestampToString(d.data().reviewedDate)
          : undefined,
      }));
  },

  async getById(id: string): Promise<Request | null> {
    const db = getDb();
    const snap = await db.collection(COLLECTIONS.REQUESTS).doc(id).get();
    if (!snap.exists) return null;
    return {
      id: snap.id,
      ...(snap.data() as Omit<Request, 'id'>),
      submittedDate: timestampToString(snap.data()!.submittedDate),
      reviewedDate: snap.data()!.reviewedDate
        ? timestampToString(snap.data()!.reviewedDate)
        : undefined,
    };
  },

  async create(request: Omit<Request, 'id'>): Promise<string> {
    const db = getDb();
    const ref = await db.collection(COLLECTIONS.REQUESTS).add({
      ...request,
      submittedDate: FieldValue.serverTimestamp(),
      status: 'pending',
      isActive: true,
    });
    return ref.id;
  },

  async updateStatus(
    id: string,
    status: Request['status'],
    reviewedBy: string,
    reviewedByName: string,
    reviewNotes?: string
  ): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.REQUESTS).doc(id).update({
      status,
      reviewedBy,
      reviewedByName,
      reviewedDate: FieldValue.serverTimestamp(),
      reviewNotes: reviewNotes || '',
    });
  },

  async update(id: string, updates: Partial<Request>): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.REQUESTS).doc(id).update(updates);
  },

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.collection(COLLECTIONS.REQUESTS).doc(id).update({ isActive: false });
  },
};
