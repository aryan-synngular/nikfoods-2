'use client'
import { Sidebar } from './Sidebar'
import { AdminNavbar } from './AdminNavbar'
import { useMedia, YStack, XStack, Card, Text, Spinner } from 'tamagui'
import { useState } from 'react'
import { useAuth } from 'lib/hook/useAuth'
import { notFound } from 'next/navigation'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useAuth()
  console.log(user)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const media = useMedia()
  const isDesktop = media.sm

  console.log(loading)
  if (loading) {
    return (
      <YStack height="100vh" items="center" justify="center" bg="$background">
        <Card p="$4" bordered style={{ borderRadius: 12 }}>
          <XStack items="center" gap="$3">
            <Spinner size="large" color="#4F8CFF" />
            <Text fontSize={16} fontWeight="700">
              Authenticating...
            </Text>
          </XStack>
        </Card>
      </YStack>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <YStack height="100vh" items="center" justify="center" bg="$background">
        <Card p="$5" bordered style={{ borderRadius: 12 }}>
          <YStack items="center" gap="$2">
            <Text fontSize={20} fontWeight="700" color="#EF4444">
              Not Authorized
            </Text>
            <Text color="#6B7280">You do not have permission to access this page.</Text>
          </YStack>
        </Card>
      </YStack>
    )
  }
  return (
    <XStack bg="$background" height="100vh" style={{ overflow: 'hidden' }}>
      {/* Sidebar: always visible on desktop, toggled on mobile */}
      <Sidebar open={isSidebarOpen} />
      {/* Main content area: navbar at the top, then children */}
      <YStack
        flex={1}
        style={{ position: 'sticky', top: 0, zIndex: 1 }}
        pt={isDesktop ? '$4' : '$2'}
      >
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <YStack
          style={{
            overflow: 'auto',
            height: 'calc(100vh - 80px)', // Subtract navbar height
          }}
          px={isDesktop ? '$5' : '$2'}
          pt={isDesktop ? '$4' : '$2'}
        >
          {children}
        </YStack>
      </YStack>
    </XStack>
  )
}
