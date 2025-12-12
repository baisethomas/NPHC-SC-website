// Custom hooks for member portal data fetching

import { useCallback } from 'react';
import { useApiQuery, useApiMutation } from './useApi';
import { 
  Document, 
  MeetingNote, 
  Message, 
  Request, 
  Activity,
  DocumentQuery,
  MeetingQuery,
  MessageQuery,
  RequestQuery,
  PaginatedResponse
} from '@/types/members';

// Documents hooks
export function useDocuments(query: DocumentQuery = {}) {
  const queryString = new URLSearchParams(
    Object.entries(query).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const endpoint = `/members/documents${queryString ? `?${queryString}` : ''}`;
  
  return useApiQuery<PaginatedResponse<Document>>(endpoint, {}, [queryString]);
}

export function useDocument(id: string) {
  return useApiQuery<Document>(`/members/documents/${id}`, {}, [id]);
}

export function useDocumentMutations() {
  const { mutate: createDocument, loading: creating, error: createError } = 
    useApiMutation<Partial<Document>, { id: string }>();
  
  const { mutate: updateDocument, loading: updating, error: updateError } = 
    useApiMutation<Partial<Document>, void>();
  
  const { mutate: deleteDocument, loading: deleting, error: deleteError } = 
    useApiMutation<void, void>();

  const { mutate: downloadDocument, loading: downloading, error: downloadError } = 
    useApiMutation<void, { downloadUrl: string; fileName: string }>();

  return {
    createDocument: (data: Partial<Document>) => createDocument('/members/documents', data),
    updateDocument: (id: string, data: Partial<Document>) => 
      updateDocument(`/members/documents/${id}`, data, { method: 'PUT' }),
    deleteDocument: (id: string) => 
      deleteDocument(`/members/documents/${id}`, undefined, { method: 'DELETE' }),
    downloadDocument: (id: string) => 
      downloadDocument(`/members/documents/${id}/download`, undefined, { method: 'POST' }),
    loading: creating || updating || deleting || downloading,
    error: createError || updateError || deleteError || downloadError
  };
}

// Meetings hooks
export function useMeetings(query: MeetingQuery = {}) {
  const queryString = new URLSearchParams(
    Object.entries(query).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const endpoint = `/members/meetings${queryString ? `?${queryString}` : ''}`;
  
  return useApiQuery<PaginatedResponse<MeetingNote>>(endpoint, {}, [queryString]);
}

export function useMeeting(id: string) {
  return useApiQuery<MeetingNote>(`/members/meetings/${id}`, {}, [id]);
}

export function useMeetingMutations() {
  const { mutate: createMeeting, loading: creating, error: createError } = 
    useApiMutation<Partial<MeetingNote>, { id: string }>();
  
  const { mutate: updateMeeting, loading: updating, error: updateError } = 
    useApiMutation<Partial<MeetingNote>, void>();
  
  const { mutate: deleteMeeting, loading: deleting, error: deleteError } = 
    useApiMutation<void, void>();

  return {
    createMeeting: (data: Partial<MeetingNote>) => createMeeting('/members/meetings', data),
    updateMeeting: (id: string, data: Partial<MeetingNote>) => 
      updateMeeting(`/members/meetings/${id}`, data, { method: 'PUT' }),
    deleteMeeting: (id: string) => 
      deleteMeeting(`/members/meetings/${id}`, undefined, { method: 'DELETE' }),
    loading: creating || updating || deleting,
    error: createError || updateError || deleteError
  };
}

// Messages hooks
export function useMessages(query: MessageQuery = {}) {
  const queryString = new URLSearchParams(
    Object.entries(query).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const endpoint = `/members/messages${queryString ? `?${queryString}` : ''}`;
  
  return useApiQuery<PaginatedResponse<Message>>(endpoint, {}, [queryString]);
}

export function useMessage(id: string) {
  return useApiQuery<Message>(`/members/messages/${id}`, {}, [id]);
}

export function useMessageMutations() {
  const { mutate: createMessage, loading: creating, error: createError } = 
    useApiMutation<Partial<Message>, { id: string }>();
  
  const { mutate: updateMessage, loading: updating, error: updateError } = 
    useApiMutation<Partial<Message>, void>();
  
  const { mutate: deleteMessage, loading: deleting, error: deleteError } = 
    useApiMutation<void, void>();

  const { mutate: markAsRead, loading: markingRead, error: markReadError } = 
    useApiMutation<void, void>();

  return {
    createMessage: (data: Partial<Message>) => createMessage('/members/messages', data),
    updateMessage: (id: string, data: Partial<Message>) => 
      updateMessage(`/members/messages/${id}`, data, { method: 'PUT' }),
    deleteMessage: (id: string) => 
      deleteMessage(`/members/messages/${id}`, undefined, { method: 'DELETE' }),
    markAsRead: (id: string) => 
      markAsRead(`/members/messages/${id}/read`, undefined, { method: 'POST' }),
    loading: creating || updating || deleting || markingRead,
    error: createError || updateError || deleteError || markReadError
  };
}

// Requests hooks
export function useRequests(query: RequestQuery = {}) {
  const queryString = new URLSearchParams(
    Object.entries(query).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = String(value);
      }
      return acc;
    }, {} as Record<string, string>)
  ).toString();

  const endpoint = `/members/requests${queryString ? `?${queryString}` : ''}`;
  
  return useApiQuery<PaginatedResponse<Request>>(endpoint, {}, [queryString]);
}

export function useRequest(id: string) {
  return useApiQuery<Request>(`/members/requests/${id}`, {}, [id]);
}

export function useRequestMutations() {
  const { mutate: createRequest, loading: creating, error: createError } = 
    useApiMutation<Partial<Request>, { id: string }>();
  
  const { mutate: updateRequest, loading: updating, error: updateError } = 
    useApiMutation<Partial<Request>, void>();
  
  const { mutate: deleteRequest, loading: deleting, error: deleteError } = 
    useApiMutation<void, void>();

  const { mutate: updateStatus, loading: updatingStatus, error: statusError } = 
    useApiMutation<{ status: string; reviewNotes?: string }, void>();

  return {
    createRequest: (data: Partial<Request>) => createRequest('/members/requests', data),
    updateRequest: (id: string, data: Partial<Request>) => 
      updateRequest(`/members/requests/${id}`, data, { method: 'PUT' }),
    deleteRequest: (id: string) => 
      deleteRequest(`/members/requests/${id}`, undefined, { method: 'DELETE' }),
    updateStatus: (id: string, status: string, reviewNotes?: string) => 
      updateStatus(`/members/requests/${id}/status`, { status, reviewNotes }, { method: 'PUT' }),
    loading: creating || updating || deleting || updatingStatus,
    error: createError || updateError || deleteError || statusError
  };
}

// Activities hook
export function useActivities(limit: number = 10) {
  return useApiQuery<Activity[]>(`/members/activities?limit=${limit}`, {}, [limit]);
}

// Custom hook for unread message count
export function useUnreadMessageCount() {
  const { data, loading, error } = useMessages({ unreadOnly: true, limit: 100 });
  
  const count = data?.items?.length || 0;
  
  return { count, loading, error };
}

// Custom hook for user's requests
export function useUserRequests() {
  const { data, loading, error, refetch } = useRequests({ limit: 100 });
  
  return { 
    requests: data?.items || [], 
    loading, 
    error, 
    refetch,
    total: data?.total || 0
  };
}

// Custom hook for recent activities with formatted data
export function useRecentActivities(limit: number = 5) {
  const { data, loading, error } = useActivities(limit);
  
  const formatActivity = useCallback((activity: Activity) => {
    const actionMap = {
      'document_uploaded': 'New document uploaded',
      'meeting_created': 'Meeting notes posted',
      'message_sent': 'New message sent',
      'request_submitted': 'Request submitted',
      'request_approved': 'Request approved',
      'request_denied': 'Request denied'
    };
    
    return {
      id: activity.id,
      title: actionMap[activity.action] || activity.action,
      description: activity.resourceTitle,
      timestamp: activity.timestamp,
      user: activity.userName,
      type: activity.resourceType
    };
  }, []);
  
  const formattedActivities = data?.map(formatActivity) || [];
  
  return { activities: formattedActivities, loading, error };
}
