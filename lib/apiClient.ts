/**
 * Typed API client with automatic token injection and refresh logic
 */

import type { ErrorResponse } from "./types/api";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

// Token storage (will be managed by AuthProvider)
let accessToken: string | null = null;
let refreshToken: string | null = null;
let onTokenRefresh: ((newAccessToken: string) => void) | null = null;
let onAuthError: (() => void) | null = null;

export function setTokens(access: string | null, refresh: string | null) {
  accessToken = access;
  refreshToken = refresh;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function setOnTokenRefresh(callback: (newAccessToken: string) => void) {
  onTokenRefresh = callback;
}

export function setOnAuthError(callback: () => void) {
  onAuthError = callback;
}

// Tenant ID (will be set by useTenant hook)
// Default to "demo-salon" for local development
let tenantId: string | null = typeof window !== "undefined" ? "demo-salon" : null;

export function setTenantId(id: string | null) {
  tenantId = id;
}

export function getTenantId() {
  return tenantId;
}

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super();
    this.name = "ApiError";
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<string | null> {
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    // Update stored token
    accessToken = newAccessToken;

    // Notify callback
    if (onTokenRefresh) {
      onTokenRefresh(newAccessToken);
    }

    return newAccessToken;
  } catch {
    return null;
  }
}

/**
 * Make API request with automatic token injection and refresh
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add access token if available
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // Add tenant ID - always include default for local development
  const finalTenantId = tenantId || "demo-salon";
  headers["X-Tenant-ID"] = finalTenantId;

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    console.log(`[API Request] ${options.method || "GET"} ${endpoint}`, {
      "X-Tenant-ID": finalTenantId,
      hasAccessToken: !!accessToken,
    });
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 with token refresh
    if (response.status === 401 && accessToken && refreshToken) {
      // Don't retry if this is the refresh endpoint itself
      if (!endpoint.includes("/auth/refresh") && !endpoint.includes("/auth/login")) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          // Retry with new token
          headers["Authorization"] = `Bearer ${newAccessToken}`;

          response = await fetch(url, {
            ...options,
            headers,
          });
        } else {
          // Refresh failed, trigger auth error callback
          if (onAuthError) {
            onAuthError();
          }
          throw new ApiError(401, "TOKEN_REFRESH_FAILED");
        }
      }
    }

    // Handle non-OK responses
    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as ErrorResponse;
      throw new ApiError(
        response.status,
        errorData.code || "UNKNOWN_ERROR",
        errorData.details
      );
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    // Check if response has content
    const contentType = response.headers.get("content-type");
    const text = await response.text();
    
    if (!text || text.trim() === "") {
      return undefined as T;
    }

    // Try to parse as JSON
    try {
      return JSON.parse(text) as T;
    } catch (parseError) {
      // If parsing fails and we expected JSON, throw an error
      if (contentType && contentType.includes("application/json")) {
        throw new ApiError(
          response.status,
          "INVALID_JSON_RESPONSE",
          { message: "Response was not valid JSON" }
        );
      }
      // Otherwise return undefined
      return undefined as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(0, "NETWORK_ERROR");
  }
}

/**
 * HTTP method helpers
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

