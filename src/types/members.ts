
// Database types for the members portal

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'member' | 'admin' | 'officer';
  organizationId?: string;
  organizationName?: string;
  joinedDate: string;
  lastLogin?: string;
  isActive: boolean;
  profilePicture?: string;
}

export interface Document {
  id: string;
  title: string;
  category: string;
  description: string;
  version: string;
  lastUpdated: string;
  uploadedBy: string;
  uploadedByName: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  restricted: boolean;
  restrictedRoles?: string[];
  downloadCount: number;
  isActive: boolean;
  tags?: string[];
}

export interface MeetingNote {
  id: string;
  title: string;
  date: string;
  type: 'regular' | 'special' | 'executive';
  status: 'draft' | 'approved' | 'archived';
  description: string;
  content?: string;
  createdBy: string;
  createdByName: string;
  lastModified: string;
  lastModifiedBy: string;
  attachments: MeetingAttachment[];
  attendees?: string[];
  agendaItems?: AgendaItem[];
  isActive: boolean;
}

export interface MeetingAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface AgendaItem {
  id: string;
  title: string;
  description?: string;
  presenter?: string;
  duration?: number;
  order: number;
  status: 'pending' | 'completed' | 'postponed';
}

export interface Message {
  id: string;
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  timestamp: string;
  category: 'announcement' | 'reminder' | 'urgent' | 'general';
  priority: 'low' | 'medium' | 'high';
  pinned: boolean;
  targetAudience: 'all' | 'admins' | 'officers' | 'members';
  targetRoles?: string[];
  targetOrganizations?: string[];
  readBy: MessageRead[];
  attachments?: MessageAttachment[];
  expiresAt?: string;
  isActive: boolean;
}

export interface MessageRead {
  userId: string;
  readAt: string;
}

export interface MessageAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface Request {
  id: string;
  title: string;
  type: string; 
  description: string;
  submittedBy: string;
  submittedByName: string;
  submittedByEmail: string;
  submittedDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'denied' | 'cancelled';
  priority: string;
  requestedDate?: string;
  budget?: number;
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedDate?: string;
  reviewNotes?: string;
  attachments?: RequestAttachment[];
  additionalInfo?: Record<string, unknown>;
  isActive: boolean;
}

export interface RequestAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  action: 'document_uploaded' | 'meeting_created' | 'message_sent' | 'request_submitted' | 'request_approved' | 'request_denied';
  resourceId: string;
  resourceType: 'document' | 'meeting' | 'message' | 'request';
  resourceTitle: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  type: 'fraternity' | 'sorority';
  foundingDate?: string;
  colors?: string[];
  description?: string;
  isActive: boolean;
  memberCount?: number;
  contactEmail?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Query types
export interface DocumentQuery {
  category?: string;
  restricted?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MeetingQuery {
  type?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface MessageQuery {
  category?: string;
  priority?: string;
  unreadOnly?: boolean;
  pinnedOnly?: boolean;
  page?: number;
  limit?: number;
}

export interface RequestQuery {
  type?: string;
  status?: string;
  submittedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
