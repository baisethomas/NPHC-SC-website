// Firestore database operations for the members portal

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  Document, 
  MeetingNote, 
  Message, 
  Request, 
  User, 
  Activity,
  Organization,
  ApiResponse,
  PaginatedResponse,
  DocumentQuery,
  MeetingQuery,
  MessageQuery,
  RequestQuery
} from '@/types/members';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  MEETINGS: 'meetings',
  MESSAGES: 'messages',
  REQUESTS: 'requests',
  ACTIVITIES: 'activities',
  ORGANIZATIONS: 'organizations'
} as const;

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: any): string => {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
};

// Helper function to convert date string to Firestore timestamp
const stringToTimestamp = (dateString: string): Timestamp => {
  return Timestamp.fromDate(new Date(dateString));
};

// Document operations
export const documentService = {
  async getAll(queryParams: DocumentQuery = {}): Promise<PaginatedResponse<Document>> {
    try {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        orderBy('lastUpdated', 'desc')
      ];

      if (queryParams.category) {
        constraints.push(where('category', '==', queryParams.category));
      }
      
      if (queryParams.restricted !== undefined) {
        constraints.push(where('restricted', '==', queryParams.restricted));
      }

      if (queryParams.limit) {
        constraints.push(limit(queryParams.limit));
      }

      const q = query(collection(db, COLLECTIONS.DOCUMENTS), ...constraints);
      const snapshot = await getDocs(q);
      
      const documents: Document[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastUpdated: timestampToString(doc.data().lastUpdated)
      })) as Document[];

      return {
        items: documents,
        total: documents.length,
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        totalPages: Math.ceil(documents.length / (queryParams.limit || 10))
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Document | null> {
    try {
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          lastUpdated: timestampToString(docSnap.data().lastUpdated)
        } as Document;
      }
      return null;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  async create(document: Omit<Document, 'id'>): Promise<string> {
    try {
      const { lastUpdated, ...restOfDoc } = document; // Exclude lastUpdated from input
      const docData = {
        ...restOfDoc,
        lastUpdated: Timestamp.now(), // Set the timestamp on the server
        downloadCount: 0,
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.DOCUMENTS), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Document>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, id);
      const updateData = {
        ...updates,
        lastUpdated: Timestamp.now()
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, id);
      await updateDoc(docRef, { isActive: false });
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  async incrementDownloadCount(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.DOCUMENTS, id);
      await updateDoc(docRef, { downloadCount: increment(1) });
    } catch (error) {
      console.error('Error incrementing download count:', error);
      throw error;
    }
  }
};

// Meeting operations
export const meetingService = {
  async getAll(queryParams: MeetingQuery = {}): Promise<PaginatedResponse<MeetingNote>> {
    try {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        orderBy('date', 'desc')
      ];

      if (queryParams.type) {
        constraints.push(where('type', '==', queryParams.type));
      }
      
      if (queryParams.status) {
        constraints.push(where('status', '==', queryParams.status));
      }

      if (queryParams.limit) {
        constraints.push(limit(queryParams.limit));
      }

      const q = query(collection(db, COLLECTIONS.MEETINGS), ...constraints);
      const snapshot = await getDocs(q);
      
      const meetings: MeetingNote[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: timestampToString(doc.data().date),
        lastModified: timestampToString(doc.data().lastModified)
      })) as MeetingNote[];

      return {
        items: meetings,
        total: meetings.length,
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        totalPages: Math.ceil(meetings.length / (queryParams.limit || 10))
      };
    } catch (error) {
      console.error('Error fetching meetings:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<MeetingNote | null> {
    try {
      const docRef = doc(db, COLLECTIONS.MEETINGS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          date: timestampToString(docSnap.data().date),
          lastModified: timestampToString(docSnap.data().lastModified)
        } as MeetingNote;
      }
      return null;
    } catch (error) {
      console.error('Error fetching meeting:', error);
      throw error;
    }
  },

  async create(meeting: Omit<MeetingNote, 'id'>): Promise<string> {
    try {
      const meetingData = {
        ...meeting,
        date: stringToTimestamp(meeting.date),
        lastModified: Timestamp.now(),
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.MEETINGS), meetingData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<MeetingNote>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MEETINGS, id);
      const updateData = {
        ...updates,
        lastModified: Timestamp.now()
      };
      
      if (updates.date) {
        updateData.date = stringToTimestamp(updates.date);
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating meeting:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MEETINGS, id);
      await updateDoc(docRef, { isActive: false });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      throw error;
    }
  }
};

// Message operations
export const messageService = {
  async getAll(queryParams: MessageQuery = {}): Promise<PaginatedResponse<Message>> {
    try {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        orderBy('timestamp', 'desc')
      ];

      if (queryParams.category) {
        constraints.push(where('category', '==', queryParams.category));
      }
      
      if (queryParams.priority) {
        constraints.push(where('priority', '==', queryParams.priority));
      }

      if (queryParams.pinnedOnly) {
        constraints.push(where('pinned', '==', true));
      }

      if (queryParams.limit) {
        constraints.push(limit(queryParams.limit));
      }

      const q = query(collection(db, COLLECTIONS.MESSAGES), ...constraints);
      const snapshot = await getDocs(q);
      
      const messages: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: timestampToString(doc.data().timestamp)
      })) as Message[];

      return {
        items: messages,
        total: messages.length,
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        totalPages: Math.ceil(messages.length / (queryParams.limit || 10))
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Message | null> {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGES, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          timestamp: timestampToString(docSnap.data().timestamp)
        } as Message;
      }
      return null;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  },

  async create(message: Omit<Message, 'id'>): Promise<string> {
    try {
      const messageData = {
        ...message,
        timestamp: Timestamp.now(),
        readBy: [],
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), messageData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating message:', error);
      throw error;
    }
  },

  async markAsRead(messageId: string, userId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGES, messageId);
      const messageDoc = await getDoc(docRef);
      
      if (messageDoc.exists()) {
        const messageData = messageDoc.data() as Message;
        const readBy = messageData.readBy || [];
        
        const existingRead = readBy.find(r => r.userId === userId);
        if (!existingRead) {
          readBy.push({
            userId,
            readAt: new Date().toISOString()
          });
          
          await updateDoc(docRef, { readBy });
        }
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Message>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGES, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.MESSAGES, id);
      await updateDoc(docRef, { isActive: false });
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }
};

// Request operations
export const requestService = {
  async getAll(queryParams: RequestQuery = {}): Promise<PaginatedResponse<Request>> {
    try {
      const constraints: QueryConstraint[] = [
        where('isActive', '==', true),
        orderBy('submittedDate', 'desc')
      ];

      if (queryParams.type) {
        constraints.push(where('type', '==', queryParams.type));
      }
      
      if (queryParams.status) {
        constraints.push(where('status', '==', queryParams.status));
      }

      if (queryParams.submittedBy) {
        constraints.push(where('submittedBy', '==', queryParams.submittedBy));
      }

      if (queryParams.limit) {
        constraints.push(limit(queryParams.limit));
      }

      const q = query(collection(db, COLLECTIONS.REQUESTS), ...constraints);
      const snapshot = await getDocs(q);
      
      const requests: Request[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        submittedDate: timestampToString(doc.data().submittedDate),
        reviewedDate: doc.data().reviewedDate ? timestampToString(doc.data().reviewedDate) : undefined
      })) as Request[];

      return {
        items: requests,
        total: requests.length,
        page: queryParams.page || 1,
        limit: queryParams.limit || 10,
        totalPages: Math.ceil(requests.length / (queryParams.limit || 10))
      };
    } catch (error) {
      console.error('Error fetching requests:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Request | null> {
    try {
      const docRef = doc(db, COLLECTIONS.REQUESTS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          submittedDate: timestampToString(docSnap.data().submittedDate),
          reviewedDate: docSnap.data().reviewedDate ? timestampToString(doc.data().reviewedDate) : undefined
        } as Request;
      }
      return null;
    } catch (error) {
      console.error('Error fetching request:', error);
      throw error;
    }
  },

  async create(request: Omit<Request, 'id'>): Promise<string> {
    try {
      const requestData = {
        ...request,
        submittedDate: Timestamp.now(),
        status: 'pending',
        isActive: true
      };
      
      const docRef = await addDoc(collection(db, COLLECTIONS.REQUESTS), requestData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating request:', error);
      throw error;
    }
  },

  async updateStatus(id: string, status: Request['status'], reviewedBy: string, reviewedByName: string, reviewNotes?: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.REQUESTS, id);
      const updateData = {
        status,
        reviewedBy,
        reviewedByName,
        reviewedDate: Timestamp.now(),
        reviewNotes: reviewNotes || ''
      };
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Request>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.REQUESTS, id);
      await updateDoc(docRef, updates);
    } catch (error) {
      console.error('Error updating request:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.REQUESTS, id);
      await updateDoc(docRef, { isActive: false });
    } catch (error) {
      console.error('Error deleting request:', error);
      throw error;
    }
  }
};

// Activity logging
export const activityService = {
  async log(activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> {
    try {
      const activityData = {
        ...activity,
        timestamp: Timestamp.now()
      };
      
      await addDoc(collection(db, COLLECTIONS.ACTIVITIES), activityData);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw here - activity logging shouldn't break the main flow
    }
  },

  async getRecent(limit: number = 10): Promise<Activity[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.ACTIVITIES),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: timestampToString(doc.data().timestamp)
      })) as Activity[];
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }
};

// User operations
export const userService = {
  async getById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          joinedDate: timestampToString(docSnap.data().joinedDate),
          lastLogin: docSnap.data().lastLogin ? timestampToString(docSnap.data().lastLogin) : undefined
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  async createOrUpdate(user: Omit<User, 'id'>): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.id);
      const userData = {
        ...user,
        joinedDate: user.joinedDate ? stringToTimestamp(user.joinedDate) : Timestamp.now(),
        lastLogin: Timestamp.now()
      };
      
      await updateDoc(userRef, userData);
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  },

  async updateLastLogin(id: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, id);
      await updateDoc(userRef, { lastLogin: Timestamp.now() });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
};
