// Custom hook for API calls with authentication

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ApiResponse, PaginatedResponse } from '@/types/members';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

export function useApi() {
  const { user, getIdToken, signOut } = useAuth();

  const makeRequest = async <T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    let token = await getIdToken();
    if (!token) {
      throw new Error('Failed to get authentication token');
    }
    
    const response = await fetch(`/api${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    // Handle token expiration with retry
    if (response.status === 401) {
      try {
        // Try to refresh the token once
        token = await getIdToken(true);
        if (!token) {
          await signOut();
          throw new Error('Authentication expired');
        }

        // Retry the request with fresh token
        const retryResponse = await fetch(`/api${endpoint}`, {
          method: options.method || 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!retryResponse.ok) {
          if (retryResponse.status === 401) {
            await signOut();
            throw new Error('Authentication expired');
          }
          const error = await retryResponse.json().catch(() => ({ error: 'API request failed' }));
          throw new Error(error.error || 'API request failed');
        }

        return retryResponse.json();
      } catch (refreshError) {
        await signOut();
        throw new Error('Authentication expired');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'API request failed' }));
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  };

  return { makeRequest };
}

export function useApiQuery<T>(
  endpoint: string,
  options: ApiOptions = {},
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { makeRequest } = useApi();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await makeRequest<ApiResponse<T>>(endpoint, options);
        setData(result.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
}

export function useApiMutation<T, R = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { makeRequest } = useApi();

  const mutate = async (
    endpoint: string,
    data?: T,
    options: Omit<ApiOptions, 'body'> = {}
  ): Promise<R> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await makeRequest<ApiResponse<R>>(endpoint, {
        ...options,
        body: data,
        method: options.method || 'POST',
      });
      return result.data as R;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}