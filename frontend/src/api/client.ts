/**
 * Learnova Central API Client Layer
 * Standardized HTTP request handling, error boundaries, offline detection, and auth injection.
 */

export class ApiError extends Error {
  status: number;
  data: any;
  isOffline: boolean;

  constructor(message: string, status: number = 500, data: any = null, isOffline: boolean = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isOffline = isOffline;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 12000, headers = {}, ...rest } = options;

  // Build target URL (ensure leading slash if not present)
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL}${path}`;

  // Retrieve auth token if configured
  const token =
    localStorage.getItem('learnova_access_token') ||
    import.meta.env.VITE_ACCESS_TOKEN ||
    'learnova_personal_secret';

  const defaultHeaders: Record<string, string> = {
    'X-Learnova-Token': token,
  };

  // Only set application/json if body is not FormData
  if (!(rest.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const mergedHeaders = {
    ...defaultHeaders,
    ...(headers as Record<string, string>),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: mergedHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      const message =
        typeof errorData === 'object' && errorData?.detail
          ? errorData.detail
          : `API Error ${response.status}: ${response.statusText}`;

      throw new ApiError(message, response.status, errorData, false);
    }

    // Check for empty body / 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const json = await response.json();
    return json as T;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    // Network error or fetch abort
    const isTimeout = error.name === 'AbortError';
    const isOffline = !navigator.onLine || isTimeout || error.message.includes('Failed to fetch');

    const friendlyMessage = isTimeout
      ? 'Connection timed out. Learnova backend server took too long to respond.'
      : isOffline
      ? 'Unable to connect to Learnova backend. Check your network or local server.'
      : error.message || 'An unexpected network error occurred.';

    throw new ApiError(friendlyMessage, 0, null, true);
  }
}

export interface HealthStatus {
  status: string;
  app: string;
  version: string;
  persistence?: 'ephemeral' | 'persistent';
  database_type?: string;
  serverless?: boolean;
}

export async function checkHealth(): Promise<HealthStatus> {
  return apiClient<HealthStatus>('/health');
}
