import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'

let useSession: any = null
let signIn: any = null
let signOut: any = null

if (Platform.OS === 'web') {
  // Dynamically import next-auth for web
  const nextAuth = require('next-auth/react')
  useSession = nextAuth.useSession
  signIn = nextAuth.signIn
  signOut = nextAuth.signOut
}

// SecureStorage for native
import * as SecureStore from 'expo-secure-store'

interface AuthState {
  user: any
  isAuthenticated: boolean
  loading: boolean
  token?: string
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  })

  // ------------------
  // Load user state
  // ------------------
  if (Platform.OS === 'web' && useSession) {
    const { data: session, status } = useSession()
    useEffect(() => {
      if (status === 'loading') {
        setState((prev) => ({ ...prev, loading: true }))
      } else if (session?.user) {
        setState({
          user: session.user,
          isAuthenticated: true,
          loading: false,
        })
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          loading: false,
        })
      }
    }, [session, status])
  } else {
    // Native
    useEffect(() => {
      ;(async () => {
        const token = await SecureStore.getItemAsync('auth_token')
        if (token) {
          const user = parseJwt(token)
          setState({
            user,
            isAuthenticated: true,
            loading: false,
            token,
          })
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            loading: false,
          })
        }
      })()
    }, [])
  }

  // ------------------
  // Login
  // ------------------
  const login = useCallback(async (credentials?: { email: string; password: string }) => {
    if (Platform.OS === 'web' && signIn) {
      // For web, use next-auth
      return signIn('credentials', {
        email: credentials?.email,
        password: credentials?.password,
        redirect: false,
      })
    } else {
      // Native: call custom API and store JWT
      const response = await fetch('https://your-api.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })
      const { token } = await response.json()
      await SecureStore.setItemAsync('auth_token', token)
      setState({
        user: parseJwt(token),
        isAuthenticated: true,
        loading: false,
        token,
      })
    }
  }, [])

  // ------------------
  // Logout
  // ------------------
  const logout = useCallback(async () => {
    if (Platform.OS === 'web' && signOut) {
      await signOut({ redirect: false })
    } else {
      await SecureStore.deleteItemAsync('auth_token')
      setState({
        user: null,
        isAuthenticated: false,
        loading: false,
      })
    }
  }, [])

  return { ...state, login, logout }
}

// Helper to decode JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (e) {
    return null
  }
}
