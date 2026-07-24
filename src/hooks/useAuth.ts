import { useState } from 'react'
import type { User, AuthState } from '@/types/auth.types'

/**
 * Custom hook for authentication state and actions.
 *
 * TODO: Connect to actual auth service and store.
 * This is a skeleton implementation.
 */
export function useAuth(): AuthState & {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<void>
} {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (_email: string, _password: string) => {
    setIsLoading(true)
    try {
      // TODO: Call auth.service.ts login
      console.log('Login not implemented yet')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    // TODO: Clear tokens, redirect to login
  }

  const register = async (_name: string, _email: string, _password: string) => {
    setIsLoading(true)
    try {
      // TODO: Call auth.service.ts register
      console.log('Register not implemented yet')
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
  }
}
