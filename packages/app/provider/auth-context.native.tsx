'use client'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import * as Google from 'expo-auth-session/providers/google'
import * as Facebook from 'expo-auth-session/providers/facebook'
import * as AppleAuthentication from 'expo-apple-authentication'
import { apiAddAddress, apiLoginUser, apiRegisterUser } from 'app/services/AuthService'

// OAuth provider placeholders (replace with real keys)
const GOOGLE_EXPO_CLIENT_ID =
  '802634298345-tpj33qlojg0pngf05q806hoiuvhel0js.apps.googleusercontent.com'
const GOOGLE_IOS_CLIENT_ID =
  '802634298345-tpj33qlojg0pngf05q806hoiuvhel0js.apps.googleusercontent.com'
const GOOGLE_ANDROID_CLIENT_ID =
  '802634298345-tpj33qlojg0pngf05q806hoiuvhel0js.apps.googleusercontent.com'
const FACEBOOK_APP_ID = '4112075375672567'

interface User {
  id: string
  email: string
  name?: string
  token?: string
  refreshToken?: string
  isCompleted?: boolean
  expiresAt?: number
  role: 'ADMIN' | 'USER'
}

interface AuthContextData {
  user: User | null
  loading: boolean
  signingIn: boolean
  registering: boolean
  addingAddress: boolean
  loginSuccess: boolean
  signIn: (credentials?: any) => Promise<{ isCompleted: boolean }>
  signOut: () => Promise<void>
  registerStep2: (address?: any) => Promise<any>
  register: (address?: any) => Promise<any>
  clearLoginSuccess: () => void
  socialSignIn: (provider: 'google' | 'facebook' | 'apple') => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [signingIn, setSigningIn] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [addingAddress, setAddingAddress] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  // Native session bootstrap
  useEffect(() => {
    ;(async () => {
      const token = await SecureStore.getItemAsync('token')
      const refreshToken = await SecureStore.getItemAsync('refreshToken')
      const expiresAt = await SecureStore.getItemAsync('expiresAt')
      const userJson = await SecureStore.getItemAsync('user')
      if (token && userJson) {
        setUser({
          ...JSON.parse(userJson),
          token,
          refreshToken,
          expiresAt: expiresAt ? parseInt(expiresAt, 10) : undefined,
        })
      }
      setLoading(false)
    })()
  }, [])

  // Expo AuthSession providers
  const [googleRequest, googleResponse, promptGoogle] = Google.useAuthRequest({
    expoClientId: GOOGLE_EXPO_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: ['profile', 'email'],
  })

  const [facebookRequest, facebookResponse, promptFacebook] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
    responseType: 'token',
    scopes: ['public_profile', 'email'],
  })

  const signIn = async (credentials?: any) => {
    setSigningIn(true)
    try {
      const data = await apiLoginUser(credentials)
      const expiresAt = Date.now() + data?.data?.expiresIn * 1000

      await SecureStore.setItemAsync('token', String(data?.data?.token))
      await SecureStore.setItemAsync('refreshToken', String(data?.data?.refreshToken))
      await SecureStore.setItemAsync('expiresAt', String(expiresAt))
      await SecureStore.setItemAsync('user', JSON.stringify(data?.data?.user))

      setUser({
        ...data?.data?.user,
        token: data?.data?.token,
        refreshToken: data?.data?.refreshToken,
        expiresAt,
      })

      setLoginSuccess(true)
      return { isCompleted: data?.data?.isCompleted }
    } catch (error) {
      throw error
    } finally {
      setSigningIn(false)
    }
  }

  const clearLoginSuccess = () => {
    setLoginSuccess(false)
  }

  const signOut = async () => {
    await SecureStore.deleteItemAsync('token')
    await SecureStore.deleteItemAsync('refreshToken')
    await SecureStore.deleteItemAsync('expiresAt')
    await SecureStore.deleteItemAsync('user')
    setUser(null)
  }

  const register = async (credentials: any) => {
    setRegistering(true)
    try {
      const data = await apiRegisterUser(credentials)
      const expiresAt = Date.now() + data?.data?.expiresIn * 1000

      await SecureStore.setItemAsync('token', String(data.data.token))
      await SecureStore.setItemAsync('refreshToken', String(data?.data.refreshToken))
      await SecureStore.setItemAsync('expiresAt', String(expiresAt))
      await SecureStore.setItemAsync('user', JSON.stringify(data?.data.user))

      setUser({
        ...data?.data.user,
        token: data?.data.token,
        refreshToken: data?.data.refreshToken,
        expiresAt,
      })
      return data
    } catch (err) {
      throw err
    } finally {
      setRegistering(false)
    }
  }

  const registerStep2 = async (addressData: any) => {
    setAddingAddress(true)
    try {
      const data = await apiAddAddress(addressData)
      const expiresAt = Date.now() + data.data.expiresIn * 1000

      await SecureStore.setItemAsync('token', String(data.data.token))
      await SecureStore.setItemAsync('refreshToken', String(data.data.refreshToken))
      await SecureStore.setItemAsync('expiresAt', String(expiresAt))
      await SecureStore.setItemAsync('user', JSON.stringify(data.data.user))

      setUser((prev) => (prev ? { ...prev, isCompleted: true } : prev))
      return data
    } catch (err) {
      throw err
    } finally {
      setAddingAddress(false)
    }
  }

  const socialSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'apple') {
      try {
        const credential = await AppleAuthentication.signInAsync({
          requestedScopes: [
            AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
            AppleAuthentication.AppleAuthenticationScope.EMAIL,
          ],
        })
        // TODO: Send credential.identityToken to backend
        return
      } catch (e: any) {
        throw new Error('Apple sign-in failed or cancelled')
      }
    }

    if (provider === 'google') {
      const result = await promptGoogle({ useProxy: true })
      if (result?.type === 'success') {
        // TODO: Send result.authentication?.accessToken to backend
        return
      }
      throw new Error('Google sign-in cancelled')
    }

    if (provider === 'facebook') {
      const result = await promptFacebook({ useProxy: true })
      if (result?.type === 'success') {
        // TODO: Send result.authentication?.accessToken to backend
        return
      }
      throw new Error('Facebook sign-in cancelled')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        registerStep2,
        register,
        signingIn,
        registering,
        addingAddress,
        loginSuccess,
        clearLoginSuccess,
        socialSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  return context
}

export { AuthProvider, useAuth }
