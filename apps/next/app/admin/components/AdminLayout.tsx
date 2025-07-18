"use client"
import { Sidebar } from './Sidebar';
import { AdminNavbar } from './AdminNavbar';
import { useMedia, YStack, XStack } from 'tamagui';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const media = useMedia();
  const isDesktop = media.sm;

  return (
    <XStack  bg="$background">
      {/* Sidebar: always visible on desktop, toggled on mobile */}
      <Sidebar open={isSidebarOpen}/>
      {/* Main content area: navbar at the top, then children */}
      <YStack flex={1} 
      style={
      {  position:"sticky",
        top:0,
        zIndex:1
}      } 
  pt={isDesktop ? '$4' : '$2'}>
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <YStack style={{
          overflow:"auto"
        }}   px={isDesktop ? '$5' : '$2'} pt={isDesktop ? '$4' : '$2'}>

        {children}
        </YStack>
      </YStack>
    </XStack>
  );
}