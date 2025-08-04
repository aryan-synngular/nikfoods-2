// app/components/SidebarNavigation.tsx
'use client'
import { useState } from 'react'
import { View, Text, YStack, Button, XStack, ScrollView } from 'tamagui'
import { Platform } from 'react-native'
import { Home, LogOut, ShoppingCart, User } from '@tamagui/lucide-icons'
import { tabs } from 'app/constants/account.constant'

interface ProfileSidebarNavigationProps {
  onSelect: (tab: string) => void
  isMobile?: boolean
}

export const ProfileSidebarNavigation = ({
  onSelect,
  isMobile = false,
}: ProfileSidebarNavigationProps) => {
  const [active, setActive] = useState('Orders')

  // Mobile Horizontal Tabs
  if (isMobile) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} marginBlock={5}>
        <XStack paddingHorizontal="$4" paddingVertical="$2" gap="$2">
          {tabs.map((tab) => (
            <Button
              key={tab.title}
              size="$3"
              paddingHorizontal="$4"
              paddingVertical="$2"
              backgroundColor={active === tab.title ? '#FF9F0D' : 'transparent'}
              borderWidth={1}
              borderColor={active === tab.title ? '#FF9F0D' : '$borderColor'}
              borderRadius="$4"
              color={active === tab.title ? 'white' : '$color'}
              fontWeight={active === tab.title ? '600' : '400'}
              fontSize="$3"
              hoverStyle={{
                backgroundColor: active === tab.title ? '#FF9F0D' : '#FF9F0D1A',
                borderColor: '#FF9F0D',
              }}
              pressStyle={{
                backgroundColor: active === tab.title ? '#E88F00' : '#FF9F0D2A',
                borderColor: '#FF9F0D',
              }}
              onPress={() => {
                setActive(tab.title)
                onSelect(tab.title)
              }}
            >
              <XStack alignItems="center" gap="$2">
                <tab.icon size={16} color={active === tab.title ? 'white' : '#666'} />
                <Text
                  color={active === tab.title ? 'white' : '$color'}
                  fontSize="$3"
                  fontWeight={active === tab.title ? '600' : '400'}
                >
                  {tab.title}
                </Text>
              </XStack>
            </Button>
          ))}
        </XStack>
      </ScrollView>
    )
  }

  // Web Sidebar (original design)
  return (
    <XStack style={{ borderRadius: '20px' }} p="$4" bg={'#F9F9F9'}>
      <YStack bg={'white'} width={300} style={{ borderRadius: '20px' }}>
        {tabs.map((tab) => (
          <Button
            width={'100%'}
            key={tab.title}
            size="$3"
            py={'$5'}
            bg={active === tab.title ? '#FF9F0D1A' : 'white'}
            hoverStyle={{
              borderWidth: 0,
              background: '#FF9F0D1A',
            }}
            icon={tab.icon}
            justify={'flex-start'}
            pressStyle={{
              background: '#FF9F0D1A',
            }}
            onPress={() => {
              setActive(tab.title)
              onSelect(tab.title)
            }}
          >
            {tab.title}
          </Button>
        ))}
      </YStack>
    </XStack>
  )
}
