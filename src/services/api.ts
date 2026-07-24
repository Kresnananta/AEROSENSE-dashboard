import { API_CONFIG } from '@/lib/constants'
import type { ApiResponse, ApiError } from '@/types/api.types'

/**
 * Base API client.
 * Centralized fetch wrapper with auth headers and error handling.
 *
 * TODO: Add interceptors for token refresh, error logging.
 */

/** Build full URL from endpoint path */
function buildUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`
}

/** Get auth headers if token exists */
function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('aerosense-token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** Generic request handler */
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const url = buildUrl(endpoint)

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error: ApiError = await response.json()
    throw error
  }

  return response.json()
}

/** HTTP method helpers */
export const api = {
  get: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    request<T>(endpoint, { method: 'DELETE' }),
}
