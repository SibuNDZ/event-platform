import { useAuthStore } from '@/stores/auth-store';

const API_BASE_URL = '/api/v1';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export class ApiClientError extends Error {
  statusCode: number;
  error?: string;

  constructor(message: string, statusCode: number, error?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const { tokens, setTokens, clearAuth } = useAuthStore.getState();

  if (!tokens?.refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });

    if (!response.ok) {
      clearAuth();
      return false;
    }

    const json = await response.json();
    const data = json.data || json;
    const apiTokens = data.tokens;
    setTokens({
      accessToken: apiTokens.accessToken,
      refreshToken: apiTokens.refreshToken,
      expiresAt: Date.now() + apiTokens.expiresIn * 1000,
    });
    return true;
  } catch {
    clearAuth();
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  if (isRefreshing) {
    return refreshPromise!;
  }

  isRefreshing = true;
  refreshPromise = refreshAccessToken().finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, skipAuth, ...fetchOptions } = options;
  const { tokens } = useAuthStore.getState();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (!skipAuth && tokens?.accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${tokens.accessToken}`;
  }

  const config: RequestInit = {
    ...fetchOptions,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  };

  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (response.status === 401 && !skipAuth && tokens?.refreshToken) {
    const refreshed = await handleTokenRefresh();

    if (refreshed) {
      const newTokens = useAuthStore.getState().tokens;
      (headers as Record<string, string>)['Authorization'] = `Bearer ${newTokens?.accessToken}`;
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...config,
        headers,
      });
    }
  }

  if (!response.ok) {
    let errorData: ApiError;
    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || 'An error occurred',
        statusCode: response.status,
      };
    }
    throw new ApiClientError(
      errorData.message,
      errorData.statusCode || response.status,
      errorData.error
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();

  // Backend wraps responses in { success, data, meta } - unwrap the data
  if (json && typeof json === 'object' && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};
