// app/components/SidebarNavigation.tsx
'use client'
import { useState } from 'react'
import { View, Text, YStack, Button, XStack } from 'tamagui'
import { Home, LogOut, ShoppingCart, User } from '@tamagui/lucide-icons'
import { tabs } from 'app/constants/account.constant'

export const ProfileSidebarNavigation = ({ onSelect }: { onSelect: (tab: string) => void }) => {
  const [active, setActive] = useState('Orders')

  return (
    <XStack style={{ borderRadius: '20px' }} p="$4" bg={'#F9F9F9'}>
      <YStack bg={'white'} width={300} style={{ borderRadius: '20px' }}>
        {tabs.map((tab) => (
          <Button
            width={'100%'}
            key={tab.title}
            size="$3"
            py={'$5'}
            bg={active == tab.title ? '#FF9F0D1A' : 'white'}
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
