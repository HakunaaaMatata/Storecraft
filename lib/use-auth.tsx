'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'

export interface AuthUser {
  id: string
  name: string
  email: string
  createdAt?: string
}

export interface UserStore {
  id: string
  slug: string
  name: string
  preset?: string
}

interface AuthContextType {
  user: AuthUser | null
  stores: UserStore[]
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; errors?: Record<string, string>; hasStore?: boolean; storeSlug?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; errors?: Record<string, string> }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [stores, setStores] = useState<UserStore[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        if (data.authenticated && data.user) {
          setUser(data.user)
          setStores(data.stores || [])
          return
        }
      }
      setUser(null)
      setStores([])
    } catch (err) {
      console.warn('[AUTH] Session check error:', err)
      setUser(null)
      setStores([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshSession()
  }, [refreshSession])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.user)
        await refreshSession()
        return {
          success: true,
          hasStore: data.hasStore,
          storeSlug: data.storeSlug,
        }
      }
      return {
        success: false,
        error: data.error || 'Failed to sign in',
        errors: data.errors,
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setUser(data.user)
        await refreshSession()
        return { success: true }
      }
      return {
        success: false,
        error: data.error || (data.errors ? Object.values(data.errors)[0] : 'Registration failed'),
        errors: data.errors,
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setUser(null)
    setStores([])
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        stores,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
