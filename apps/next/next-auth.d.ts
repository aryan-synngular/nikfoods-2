// apps/next/types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string
    role: string
    isCompleted: boolean
    email: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    isCompleted: boolean
    email: string
  }
}
