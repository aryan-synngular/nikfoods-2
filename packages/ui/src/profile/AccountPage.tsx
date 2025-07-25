'use client'
import { useState } from 'react'
import { View, XStack, Text, YStack } from 'tamagui'
import { ProfileSidebarNavigation } from './ProfileSidebarNavigation'
import { Header } from './AccountHeader'
import { AppHeader } from '../Header'
import AddressTab from './AddressTab'

export default function AccountPage() {
  const [tab, setTab] = useState('Orders')

  const renderTabContent = () => {
    switch (tab) {
      case 'Profile':
        return <Text p="$4">Profile Details</Text>
      case 'Orders':
        return <Text p="$4">List of Orders</Text>
      case 'Address':
        return <AddressTab></AddressTab>
      case 'Logout':
        return <Text p="$4">Logging out...</Text>
      default:
        return null
    }
  }

  return (
    <YStack
      style={{
        minHeight: '100vh',
        justifyContent: 'center',
      }}
    >
      {/* Add the header */}
      <AppHeader />

      <XStack
        style={{
          flex: 1,
          minWidth: '90%',
          justifyContent: 'center',
          margin: 'auto',
        }}
      >
        <YStack gap={'$2'} width={'100%'}>
          <Header title={tab} />
          <XStack gap={'$6'} mt={'$3'}>
            <ProfileSidebarNavigation onSelect={setTab} />
            <View flex={1}>{renderTabContent()}</View>
          </XStack>
        </YStack>
        {/* Savings banner */}
        {/* <SavingsBanner amount={15} /> */}
      </XStack>
    </YStack>
  )
}
