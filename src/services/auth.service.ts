import { api } from './api'
import type {
  LoginCredentials,
  RegisterPayload,
  AuthResponse,
} from '@/types/auth.types'

/**
 * Authentication service.
 * Handles login, register, logout, and token management.
 *
 * TODO: Implement actual API calls.
 */
export const authService = {
  /** Authenticate user with credentials */
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials),

  /** Register a new user */
  register: (payload: RegisterPayload) =>
    api.post<AuthResponse>('/auth/register', payload),

  /** Refresh the access token */
  refresh: (refreshToken: string) =>
    api.post<AuthResponse>('/auth/refresh', { refreshToken }),

  /** Logout and invalidate token */
  logout: () =>
    api.post<void>('/auth/logout', {}),
}
