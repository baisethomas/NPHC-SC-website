// Server-side Firestore operations using Firebase Admin SDK.
// Use this in API routes and Server Actions — NOT the client-side firestore.ts.
//
// Queries use only orderBy (no composite where+orderBy) so that no manual
// Firestore composite indexes are required. All equality / boolean filters
// are applied in-memory after fetching.

import { adminDb } from './firebase-admin';
import {
  Document,
  MeetingNote,
  Message,
  Request,
  Activity,
  PaginatedResponse,
  DocumentQuery,
  MeetingQuery,
  MessageQuery,
  RequestQuery,
} from '@/types/members';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

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

// ---------------------------------------------------------------------------
// Document service
// ---------------------------------------------------------------------------
export const documentService = {
  async getAll(queryParams: DocumentQuery = {}): Promise<PaginatedResponse<Document>> {
    const db = getDb();

    const snapshot = await db
      .collection(COLLECTIONS.DOCUMENTS)
      .orderBy('lastUpdated', 'desc')
      .get();

    let documents: Document[] = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Document, 'id'>),
        lastUpdated: timestampToString(d.data().lastUpdated),
      }))
      .filter((d) => d.isActive);

    if (queryParams.category) {
      documents = documents.filter((d) => d.category === queryParams.category);
    }
    if (queryParams.restricted !== undefined) {
      documents = documents.filter((d) => d.restricted === queryParams.restricted);
    }
    if (queryParams.search) {
      const term = queryParams.search.toLowerCase();
      documents = documents.filter(
        (d) =>
          d.title.toLowerCase().includes(term) ||
          d.description?.toLowerCase().includes(term)
      );
    }

    const pageSize = queryParams.limit || 10;
    return {
      items: documents,
      total: documents.length,
      page: queryParams.page || 1,
      limit: pageSize,
      totalPages: Math.ceil(documents.length / pageSize),
    };
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

    const snapshot = await db
      .collection(COLLECTIONS.MESSAGES)
      .orderBy('timestamp', 'desc')
      .get();

    let messages: Message[] = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Message, 'id'>),
        timestamp: timestampToString(d.data().timestamp),
      }))
      .filter((m) => m.isActive);

    if (queryParams.category) {
      messages = messages.filter((m) => m.category === queryParams.category);
    }
    if (queryParams.priority) {
      messages = messages.filter((m) => m.priority === queryParams.priority);
    }
    if (queryParams.pinnedOnly) {
      messages = messages.filter((m) => m.pinned);
    }
    if (queryParams.limit) {
      messages = messages.slice(0, queryParams.limit);
    }

    const pageSize = queryParams.limit || 10;
    return {
      items: messages,
      total: messages.length,
      page: queryParams.page || 1,
      limit: pageSize,
      totalPages: Math.ceil(messages.length / pageSize),
    };
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

  async getRecent(limitCount: number = 10): Promise<Activity[]> {
    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.ACTIVITIES)
      .orderBy('timestamp', 'desc')
      .limit(limitCount)
      .get();

    return snapshot.docs.map((d) => ({
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

    const snapshot = await db
      .collection(COLLECTIONS.MEETINGS)
      .orderBy('date', 'desc')
      .get();

    let meetings: MeetingNote[] = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<MeetingNote, 'id'>),
        date: timestampToString(d.data().date),
        lastModified: timestampToString(d.data().lastModified),
      }))
      .filter((m) => m.isActive);

    if (queryParams.type) {
      meetings = meetings.filter((m) => m.type === queryParams.type);
    }
    if (queryParams.status) {
      meetings = meetings.filter((m) => m.status === queryParams.status);
    }

    const pageSize = queryParams.limit || 10;
    return {
      items: meetings,
      total: meetings.length,
      page: queryParams.page || 1,
      limit: pageSize,
      totalPages: Math.ceil(meetings.length / pageSize),
    };
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

    const snapshot = await db
      .collection(COLLECTIONS.REQUESTS)
      .orderBy('submittedDate', 'desc')
      .get();

    let requests: Request[] = snapshot.docs
      .map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Request, 'id'>),
        submittedDate: timestampToString(d.data().submittedDate),
        reviewedDate: d.data().reviewedDate
          ? timestampToString(d.data().reviewedDate)
          : undefined,
      }))
      .filter((r) => r.isActive);

    if (queryParams.type) {
      requests = requests.filter((r) => r.type === queryParams.type);
    }
    if (queryParams.status) {
      requests = requests.filter((r) => r.status === queryParams.status);
    }
    if (queryParams.submittedBy) {
      requests = requests.filter((r) => r.submittedBy === queryParams.submittedBy);
    }

    const pageSize = queryParams.limit || 10;
    return {
      items: requests,
      total: requests.length,
      page: queryParams.page || 1,
      limit: pageSize,
      totalPages: Math.ceil(requests.length / pageSize),
    };
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
