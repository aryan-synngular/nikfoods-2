'use client'
import { Adapt, Button, Popover, PopoverProps, Sheet, Text, YStack, XStack } from 'tamagui'
import { User, ChevronDown } from '@tamagui/lucide-icons'
import { tabs } from 'app/constants/account.constant'
import { Link } from 'solito/link'
import { useLink } from 'solito/navigation'
import { Platform } from 'react-native'
import { useState } from 'react'

const getTabPath = (title: string) => {
  // All paths redirect to /account as requested
  return '/account'
}

export function ProfilePopUp({
  Icon,
  Name,
  shouldAdapt,
  handleSignOut,
  accountLink,
  ...props
}: PopoverProps & {
  Icon?: any
  Name?: string
  shouldAdapt?: boolean
  handleSignOut: () => void
  accountLink?: string
}) {
  // State to control popover open/close
  const [isOpen, setIsOpen] = useState(false)

  // Create navigation link for account - same pattern as login page
  const accountNavLink = useLink({
    href: '/account',
  })

  // Handle navigation and close popover
  const handleNavigation = () => {
    setIsOpen(false)
    accountNavLink.onPress()
  }

  // Handle logout and close popover
  const handleLogout = () => {
    setIsOpen(false)
    handleSignOut()
  }

  return (
    <Popover
      size="$5"
      allowFlip
      stayInFrame
      offset={12}
      placement="bottom-end"
      open={isOpen}
      onOpenChange={setIsOpen}
      {...props}
    >
      <Popover.Trigger asChild>
        <Button
          size={Platform.OS === 'web' ? '$3' : '$2'}
          backgroundColor="transparent"
          borderWidth={1}
          borderColor="#e0e0e0"
          borderRadius={8}
          paddingHorizontal={Platform.OS === 'web' ? 14 : 10}
          paddingVertical={Platform.OS === 'web' ? 10 : 8}
          minHeight={Platform.OS === 'web' ? 40 : 36}
          hoverStyle={{
            backgroundColor: '#f8f8f8',
            borderColor: '#d0d0d0',
          }}
          pressStyle={{
            backgroundColor: '#f0f0f0',
          }}
        >
          <XStack
            alignItems="center"
            gap={Platform.OS === 'web' ? 8 : 6}
            minWidth={Platform.OS === 'web' ? 100 : 80}
          >
            <User size={Platform.OS === 'web' ? 16 : 14} color="#666" />
            <Text
              fontSize={Platform.OS === 'web' ? 14 : 12}
              fontWeight="500"
              color="#333"
              numberOfLines={1}
              ellipsizeMode="tail"
              flex={1}
            >
              {Name}
            </Text>
            {Platform.OS === 'web' && <ChevronDown size={12} color="#999" />}
          </XStack>
        </Button>
      </Popover.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet animation="medium" modal dismissOnSnapToBottom>
          <Sheet.Frame
            padding={20}
            borderTopLeftRadius={20}
            borderTopRightRadius={20}
            backgroundColor="white"
          >
            <Sheet.Handle backgroundColor="#ddd" width={40} height={4} borderRadius={2} />
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            backgroundColor="rgba(0,0,0,0.4)"
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Popover.Content
        borderWidth={1}
        borderColor="#e8e8e8"
        backgroundColor="white"
        borderRadius={12}
        padding={8}
        elevate
        enterStyle={{ y: -10, opacity: 0, scale: 0.95 }}
        exitStyle={{ y: -10, opacity: 0, scale: 0.95 }}
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        shadowColor="rgba(0,0,0,0.1)"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.15}
        shadowRadius={12}
      >
        <Popover.Arrow borderWidth={1} borderColor="#e8e8e8" backgroundColor="white" />

        <YStack minWidth={200} maxWidth={240}>
          {/* User Info Header */}
          {Name && (
            <YStack padding={16} borderBottomWidth={1} borderBottomColor="#f0f0f0" marginBottom={8}>
              <XStack alignItems="center" gap={12}>
                <YStack
                  backgroundColor="#f8f8f8"
                  borderRadius={20}
                  padding={10}
                  alignItems="center"
                  justifyContent="center"
                >
                  <User size={18} color="#666" />
                </YStack>
                <YStack flex={1}>
                  <Text
                    fontSize={16}
                    fontWeight="600"
                    color="#333"
                    numberOfLines={1}
                    lineHeight={20}
                  >
                    {Name}
                  </Text>
                  <Text fontSize={13} color="#888" lineHeight={16}>
                    Manage account
                  </Text>
                </YStack>
              </XStack>
            </YStack>
          )}

          {/* Menu Items */}
          <YStack gap={4} paddingBottom={8}>
            {tabs.map((tab) => {
              const isLogout = tab.title.toLowerCase() === 'logout'

              if (isLogout) {
                return (
                  <Button
                    key={tab.title}
                    size="$4"
                    backgroundColor="transparent"
                    borderWidth={0}
                    borderRadius={8}
                    paddingVertical={14}
                    paddingHorizontal={16}
                    minHeight={48}
                    justifyContent="flex-start"
                    hoverStyle={{
                      backgroundColor: '#fef2f2',
                    }}
                    pressStyle={{
                      backgroundColor: '#fee2e2',
                    }}
                    onPress={handleLogout}
                  >
                    <XStack alignItems="center" gap={12} flex={1}>
                      <tab.icon size={18} color="#dc2626" />
                      <Text fontSize={15} fontWeight="500" color="#dc2626" lineHeight={20}>
                        {tab.title}
                      </Text>
                    </XStack>
                  </Button>
                )
              }

              return (
                <Button
                  key={tab.title}
                  size="$4"
                  backgroundColor="transparent"
                  borderWidth={0}
                  borderRadius={8}
                  paddingVertical={14}
                  paddingHorizontal={16}
                  minHeight={48}
                  justifyContent="flex-start"
                  hoverStyle={{
                    backgroundColor: '#f8f8f8',
                  }}
                  pressStyle={{
                    backgroundColor: '#f0f0f0',
                  }}
                  onPress={handleNavigation}
                >
                  <XStack alignItems="center" gap={12} flex={1}>
                    <tab.icon size={18} color="#666" />
                    <Text fontSize={15} fontWeight="500" color="#333" lineHeight={20}>
                      {tab.title}
                    </Text>
                  </XStack>
                </Button>
              )
            })}
          </YStack>
        </YStack>
      </Popover.Content>
    </Popover>
  )
}
