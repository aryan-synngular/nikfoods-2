import axios from 'axios'
import { Platform } from 'react-native'
import { DEV_SERVER_URL, REQUEST_HEADER_AUTH_KEY, TOKEN_TYPE } from 'app/constants/api.constant'

const REFRESH_ENDPOINT = 'auth/refresh-token'
const isExpo = !(Platform.OS === 'web')

const BASE_URL = isExpo
  ? DEV_SERVER_URL // web
  : 'api/'
const BaseService = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// ---------- Token Helpers (Dynamic Imports) ---------- //
const getAccessToken = async (): Promise<string | null> => {
  if (isExpo) {
    const SecureStore = await import('expo-secure-store')
    return SecureStore.getItemAsync('token')
  } else {
    const { getSession } = await import('next-auth/react')
    const session = await getSession()
    console.log(session)
    return session?.user ? (session.user as any).id : null
  }
}

const getRefreshToken = async (): Promise<string | null> => {
  if (isExpo) {
    const SecureStore = await import('expo-secure-store')
    return SecureStore.getItemAsync('refreshToken')
  }
  return null
}

const saveAccessToken = async (token: string, refreshToken: string): Promise<void> => {
  if (isExpo) {
    const SecureStore = await import('expo-secure-store')
    await SecureStore.setItemAsync('token', token)
    await SecureStore.setItemAsync('refreshToken', refreshToken)
  }
}

const clearTokens = async (): Promise<void> => {
  if (isExpo) {
    const SecureStore = await import('expo-secure-store')
    await SecureStore.deleteItemAsync('accessToken')
    await SecureStore.deleteItemAsync('refreshToken')
  }
}

const navigateToLogin = async () => {
  if (isExpo) {
    try {
      // const { router } = await import('expo-router')
      // router.replace('/login') // Replace to login page
    } catch (err) {
      console.warn('Navigation to Login failed:', err)
    }
  }
}
// ---------- Request Interceptor ---------- //
BaseService.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken()
    console.log('Token---------------')
    console.log(token)
    if (token) {
      config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---------- Response Interceptor ---------- //
BaseService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    console.log(error)
    if (error.response?.status === 401) {
      if (isExpo) {
        // Expo: Try refreshing token
        if (!originalRequest._retry) {
          originalRequest._retry = true
          const refreshTokenPrev = await getRefreshToken()
          if (refreshTokenPrev) {
            try {
              const res = await axios.post(`${BASE_URL}${REFRESH_ENDPOINT}`, {
                refreshTokenPrev,
              })
              const { token, refreshToken } = res.data
              await saveAccessToken(token, refreshToken)

              // Retry original request
              originalRequest.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${token}`
              return BaseService(originalRequest)
            } catch (refreshError) {
              await clearTokens()

              // Dynamically import navigation service
              await navigateToLogin()
              return Promise.reject(refreshError)
            }
          }
        }
      } else {
        // Web: Sign out and redirect
        const { signOut } = await import('next-auth/react')
        await signOut({ callbackUrl: '/login' })
      }
    }
    console.log(error)
    return Promise.reject(error)
  }
)

export default BaseService
