import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'

let useSession: any = null
if (Platform.OS === 'web') {
  // Dynamically import next-auth to avoid RN issues
  useSession = require('next-auth/react').useSession
}

// SecureStorage or AsyncStorage for native
import * as SecureStore from 'expo-secure-store' // Or use AsyncStorage

export interface AuthState {
  user: null | { id: string; email?: string; [key: string]: any }
  isAuthenticated: boolean
  loading: boolean
  token?: string
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    token: undefined,
  })

  // WEB (NextAuth)
  if (Platform.OS === 'web' && useSession) {
    const { data: session, status } = useSession()
    useEffect(() => {
      if (status === 'loading') {
        setAuthState((prev) => ({ ...prev, loading: true }))
      } else if (session?.user) {
        setAuthState({
          user: session.user,
          isAuthenticated: true,
          loading: false,
        })
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        })
      }
    }, [session, status])
  }

  // NATIVE (Custom JWT)
  if (Platform.OS !== 'web') {
    useEffect(() => {
      ;(async () => {
        const token = await SecureStore.getItemAsync('auth_token')
        if (token) {
          // Fetch user profile using token or decode JWT
          const user = parseJwt(token)
          setAuthState({
            user,
            isAuthenticated: true,
            loading: false,
            token,
          })
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
          })
        }
      })()
    }, [])
  }

  return authState
}

// Helper to decode JWT (basic version)
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
