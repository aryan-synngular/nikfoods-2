'use client'
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { YStack, Button, Spinner } from 'tamagui'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { apiAddAddress, apiLoginUser, apiRegisterUser } from 'app/services/AuthService'

// Import next-auth hooks only on web
let useSessionWeb: any = null
let nextSignIn: any = null
let nextSignOut: any = null
let updateSession: any = null

if (Platform.OS == 'web') {
  try {
    const nextAuth = require('next-auth/react')
    useSessionWeb = nextAuth.useSession
    nextSignIn = nextAuth.signIn
    nextSignOut = nextAuth.signOut
    updateSession = nextAuth.useSession().update
  } catch (err) {
    console.warn('NextAuth not found on web.')
  }
}

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
  signIn: (credentials?: any) => Promise<{ isCompleted: boolean }>
  signOut: () => Promise<void>
  registerStep2: (address?: any) => Promise<void>
  register: (address?: any) => Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ---- WEB (NextAuth) ----
  let session: any = null
  let status: string = 'loading'
  if (useSessionWeb) {
    const sessionResult = useSessionWeb()
    console.log('sessionResult')
    console.log(sessionResult)
    session = sessionResult.data
    status = sessionResult.status
    updateSession = sessionResult.update
  }
  useEffect(() => {
    if (Platform.OS == 'web' && session) {
      setUser({
        id: (session.user as any)?.id ?? '',
        email: session.user?.email ?? '',
        name: session.user?.name ?? '',
        token: (session as any)?.accessToken,
        role: session.user?.role ?? 'USER',
      })
      setLoading(status === 'loading')
    }
  }, [session, status])

  // ---- NATIVE (JWT SecureStore) ----
  useEffect(() => {
    if (!(Platform.OS == 'web')) {
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
    }
  }, [])

  // ---- SignIn ----
  const signIn = async (credentials?: any) => {
    try {
      if (Platform.OS == 'web' && nextSignIn) {
        console.log('credentials---------------------')
        console.log(credentials)
        const signInRes = await nextSignIn('credentials', { ...credentials, redirect: false })
        if (signInRes?.error) {
          throw new Error(signInRes.error)
        }
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        console.log(session)
        return { isCompleted: session?.user?.isCompleted }
      } else {
        // const res = await fetch('http://192.168.1.12:3000/api/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(credentials),
        // })
        // if (!res.ok) throw new Error('Login failed')
        // const data = await res.json()
        const data = await apiLoginUser(credentials)
        console.log('ABCDEFG', data)
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
        return { isCompleted: data?.data?.isCompleted }
      }
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  }

  // ---- SignOut ----
  const signOut = async () => {
    if (Platform.OS == 'web' && nextSignOut) {
      await nextSignOut({ callbackUrl: '/login' })
    } else {
      console.log('SIGNOUT----------')
      console.log(user)
      await SecureStore.deleteItemAsync('token')
      await SecureStore.deleteItemAsync('refreshToken')
      await SecureStore.deleteItemAsync('expiresAt')
      await SecureStore.deleteItemAsync('user')
      setUser(null)
    }
  }



  const register = async (credentials: any) => {
    try {
      const data = await apiRegisterUser(credentials)

      console.log(data)
      if (Platform.OS == 'web') {
        await signIn(credentials)
      } else {
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
      }
      // await savePendingUserId(data.data)
      return data
    } catch (err) {
      console.error(err)
      throw new Error(err)
    }
  }

  const registerStep2 = async (addressData: any) => {
    try {
      // console.log(user)
      // let token: String | null = null
      // if (!(Platform.OS == 'web')) {
      //   token = await SecureStore.getItemAsync('token')
      //   if (!token) {
      //     throw new Error('Not Authorized')
      //   }
      // } else {
      //   if (!user || !user.id) {
      //     throw new Error('Not Authorized')
      //   }
      // }
      // console.log('token------------------')
      // console.log(token)
      // const res = await fetch(`api/auth/register-step2`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     ...(token ? { Authorization: `Bearer ${token}` } : {}),
      //   },
      //   body: JSON.stringify({ ...addressData, userId: user?.id }),
      // })
      const data = await apiAddAddress(addressData)

      // const data = await res.json()
      console.log(data)
      // if (!res.ok) throw new Error(data.error || 'Registration failed')

      console.log(updateSession)
      if (Platform.OS === 'web' && updateSession) {
        await updateSession({ isCompleted: true })
      } else {
        const expiresAt = Date.now() + data.data.expiresIn * 1000

        await SecureStore.setItemAsync('token', String(data.data.token))
        await SecureStore.setItemAsync('refreshToken', String(data.data.refreshToken))
        await SecureStore.setItemAsync('expiresAt', String(expiresAt))
        await SecureStore.setItemAsync('user', JSON.stringify(data.data.user))

        setUser((prev) => (prev ? { ...prev, isCompleted: true } : prev))
      }
      return null
    } catch (err) {
      console.error(err)
      throw new Error(err)
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// export const useAuth = () => useContext(AuthContext);
const useAuth = () => {
  const context = useContext(AuthContext)
  return context
}

export { AuthProvider, useAuth }
