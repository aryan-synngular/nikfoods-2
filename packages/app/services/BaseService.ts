import axios from 'axios'
import { Platform } from 'react-native'
import {
  CURRENT_USER_PLATFORM,
  LOGIN_REDIRECT_URL,
  MOBILE_DEV_SERVER_URL,
  REQUEST_HEADER_AUTH_KEY,
  TOKEN_TYPE,
  WEB_DEV_SERVER_URL,
} from 'app/constants/api.constant'
import { PLATFORM } from 'app/constants/app.constant'
import {
  SECURE_STORE_REFRESH_TOKEN_VARIABLE,
  SECURE_STORE_TOKEN_VARIABLE,
} from 'app/constants/store.constant'

const REFRESH_ENDPOINT = 'auth/refresh-token'
const isExpo = !(Platform.OS === 'web')

const BASE_URL = isExpo
  ? MOBILE_DEV_SERVER_URL // web
  : WEB_DEV_SERVER_URL
const BaseService = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
})

// ---------- Token Helpers (Dynamic Imports) ---------- //
const getAccessToken = async (): Promise<string | null> => {
  const SecureStore = await import('expo-secure-store')
  return SecureStore.getItemAsync(SECURE_STORE_TOKEN_VARIABLE)
}

const getRefreshToken = async (): Promise<string | null> => {
  if (isExpo) {
    const SecureStore = await import('expo-secure-store')
    return SecureStore.getItemAsync(SECURE_STORE_REFRESH_TOKEN_VARIABLE)
  }
  return null
}

const saveAccessToken = async (token: string, refreshToken: string): Promise<void> => {
  if (isExpo) {
    const SecureStore = await import('expo-secure-store')
    await SecureStore.setItemAsync(SECURE_STORE_TOKEN_VARIABLE, token)
    await SecureStore.setItemAsync(SECURE_STORE_REFRESH_TOKEN_VARIABLE, refreshToken)
  }
}

const clearTokens = async (): Promise<void> => {
  if (isExpo) {
    const SecureStore = await import('expo-secure-store')
    await SecureStore.deleteItemAsync(SECURE_STORE_TOKEN_VARIABLE)
    await SecureStore.deleteItemAsync(SECURE_STORE_REFRESH_TOKEN_VARIABLE)
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
    config.headers[CURRENT_USER_PLATFORM] = isExpo ? PLATFORM.MOBILE : PLATFORM.WEB
    if (isExpo) {
      const token = await getAccessToken()
      console.log('Token---------------')
      console.log(token)
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
        console.log(error)
        const { signOut } = await import('next-auth/react')
        await signOut({ callbackUrl: LOGIN_REDIRECT_URL })
      }
    }
    console.log(error)
    return Promise.reject(error)
  }
)

export default BaseService
