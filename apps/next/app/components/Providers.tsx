'use client'

import { SessionProvider } from 'next-auth/react'
import { AuthProvider } from 'app/provider/auth-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  )
}
