'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'ADMIN' | 'CUSTOMER'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Helper function to set cookie
  const setCookie = (name: string, value: string, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString()
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure=${window.location.protocol === 'https:'}`
  }

  // Helper function to delete cookie
  const deleteCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`
  }

  useEffect(() => {
    // Check for stored auth data on mount
    const storedToken = localStorage.getItem('auth-token')
    const storedUser = localStorage.getItem('auth-user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      // Also set in cookies for server-side access (for existing logged-in users)
      setCookie('auth-token', storedToken, 7)
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/public/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      const { user, token } = data.data
      setUser(user)
      setToken(token)
      localStorage.setItem('auth-token', token)
      localStorage.setItem('auth-user', JSON.stringify(user))
      // Also set in cookies for server-side access
      setCookie('auth-token', token, 7)
    } catch (error) {
      throw error
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const response = await fetch('/api/public/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      const { user, token } = data.data
      setUser(user)
      setToken(token)
      localStorage.setItem('auth-token', token)
      localStorage.setItem('auth-user', JSON.stringify(user))
      // Also set in cookies for server-side access
      setCookie('auth-token', token, 7)
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth-token')
    localStorage.removeItem('auth-user')
    // Also delete cookies
    deleteCookie('auth-token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
