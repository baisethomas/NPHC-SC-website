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
  const { user } = useAuth();

  const makeRequest = async <T>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();
    
    const response = await fetch(`/api${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json();
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

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
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