// API client utilities

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  statusCode: number;
}

export class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async refreshAccessToken(): Promise<string> {
    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include', // Include refresh token cookie
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const newAccessToken = data.accessToken;

        // Store new access token
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
        }

        return newAccessToken;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get access token from localStorage
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    const makeRequest = async (token: string | null) => {
      return fetch(url, {
        ...options,
        credentials: 'include', // Include cookies for authentication
        headers: {
          ...options.headers,
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    };

    let response = await makeRequest(accessToken);

    // If unauthorized and not already on auth endpoint, try to refresh token
    if (response.status === 401 && !endpoint.includes('/api/auth/')) {
      try {
        // Attempt to refresh the token
        const newAccessToken = await this.refreshAccessToken();
        // Retry the request with new token
        response = await makeRequest(newAccessToken);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          window.location.href = '/';
        }
        throw refreshError;
      }
    }

    if (!response.ok) {
      let error: ApiError;
      try {
        error = await response.json();
      } catch {
        // If response is not JSON, create a generic error
        error = {
          error: {
            code: 'NETWORK_ERROR',
            message: `Request failed with status ${response.status}`,
          },
          statusCode: response.status,
        };
      }
      throw error;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  async uploadFile<T>(endpoint: string, file: File, fieldName: string = 'file'): Promise<T> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    });
  }
}

export const apiClient = new ApiClient();
