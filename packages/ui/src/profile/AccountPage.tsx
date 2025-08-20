'use client'
import { useState } from 'react'
import { View, XStack, Text, YStack, ScrollView } from 'tamagui'
import { Platform, Dimensions } from 'react-native'
import { ProfileSidebarNavigation } from './ProfileSidebarNavigation'
import { Header } from './AccountHeader'
import { AppHeader } from '../Header'
import AddressTab from './AddressTab'
import OrdersSection from './OrdersSection'
import {useScreen} from "app/hook/useScreen"
import ProfileDetails from './ProfileDetails'
export default function AccountPage() {
  const [tab, setTab] = useState('Orders')
  const {isMobile,isMobileWeb}=useScreen()

  const renderTabContent = () => {
    switch (tab) {
      case 'Profile':
        return <ProfileDetails/>
      case 'Orders':
        return <OrdersSection />
      case 'Address':
        return <AddressTab />
      case 'Logout':
        return <Text p="$4">Logging out...</Text>
      default:
        return null
    }
  }

  // Mobile Layout
  if (isMobile||isMobileWeb) {
    return (
      <YStack flex={1} backgroundColor="$background">
        {/* Fixed Header */}
        <AppHeader />

        {/* Content with proper top margin for fixed header */}
        <YStack
          flex={1}
          mt={isMobileWeb?0:90} // Account for header height + status bar
        >
          {/* Horizontal Tabs */}
          <View borderBottomWidth={1} borderBottomColor="$borderColor">
            <ProfileSidebarNavigation onSelect={setTab} isMobile={true} />
          </View>

          {/* Section Header */}
          {/* <View px="$2" py="$4">
            <Header title={tab} />
          </View> */}

          {/* Tab Content */}
          <ScrollView flex={1} background="$background">
            <View p={isMobile?"$0":"$4"}>
              {renderTabContent()}
            </View>
          </ScrollView>
        </YStack>
      </YStack>
    )
  }

  // Web Layout (unchanged)
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
            <ProfileSidebarNavigation onSelect={setTab} isMobile={false} />
            <View flex={1}>{renderTabContent()}</View>
          </XStack>
        </YStack>
      </XStack>
    </YStack>
  )
}
