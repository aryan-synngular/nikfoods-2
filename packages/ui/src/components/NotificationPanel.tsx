import React, { useState } from 'react'
import {
  Sheet,
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Separator,
  useMedia,
  Avatar,
  View,
} from 'tamagui'
import { Platform } from 'react-native'
import {
  X,
  Bell,
  ShoppingCart,
  Package,
  Gift,
  Settings,
  Check,
  Trash2,
} from '@tamagui/lucide-icons'
import { useNotificationStore, type Notification } from 'app/src/store/useNotificationStore'
import { useLink } from 'solito/navigation'
import { formatDistanceToNow } from 'date-fns'

interface NotificationPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const media = useMedia()
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearAll } =
    useNotificationStore()

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'cart':
        return <ShoppingCart size={16} color="#FF9F0D" />
      case 'order':
        return <Package size={16} color="#10B981" />
      case 'promotion':
        return <Gift size={16} color="#F59E0B" />
      case 'system':
        return <Settings size={16} color="#6B7280" />
      default:
        return <Bell size={16} color="#3B82F6" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'cart':
        return '#FFF8EE'
      case 'order':
        return '#ECFDF5'
      case 'promotion':
        return '#FFFBEB'
      case 'system':
        return '#F9FAFB'
      default:
        return '#EFF6FF'
    }
  }

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }

    if (notification.actionType === 'navigate' && notification.actionUrl) {
      // Handle navigation
      onOpenChange(false)
    }
  }

  const NotificationItem = ({ notification }: { notification: Notification }) => (
    <XStack
      padding={16}
      backgroundColor={notification.read ? 'white' : getNotificationColor(notification.type)}
      borderLeftWidth={notification.read ? 0 : 3}
      borderLeftColor={notification.read ? 'transparent' : '#FF9F0D'}
      onPress={() => handleNotificationPress(notification)}
      pressStyle={{ opacity: 0.8 }}
      space={12}
    >
      <View
        width={40}
        height={40}
        borderRadius={20}
        backgroundColor="white"
        justifyContent="center"
        alignItems="center"
        borderWidth={1}
        borderColor="#E5E7EB"
      >
        {getNotificationIcon(notification.type)}
      </View>

      <YStack flex={1} space={4}>
        <XStack justifyContent="space-between" alignItems="flex-start">
          <Text
            fontSize={14}
            fontWeight={notification.read ? '500' : '600'}
            color="#1F2937"
            flex={1}
            numberOfLines={2}
          >
            {notification.title}
          </Text>
          <XStack space={8} alignItems="center">
            <Text fontSize={12} color="#6B7280">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </Text>
            <Button
              size="$1"
              circular
              backgroundColor="transparent"
              onPress={(e) => {
                e.stopPropagation()
                removeNotification(notification.id)
              }}
              icon={<Trash2 size={12} color="#9CA3AF" />}
            />
          </XStack>
        </XStack>

        {notification.message && (
          <Text fontSize={13} color="#6B7280" numberOfLines={3}>
            {notification.message}
          </Text>
        )}

        {notification.priority === 'high' && (
          <View
            backgroundColor="#FEE2E2"
            borderRadius={4}
            paddingHorizontal={8}
            paddingVertical={2}
            alignSelf="flex-start"
          >
            <Text fontSize={10} color="#DC2626" fontWeight="600">
              HIGH PRIORITY
            </Text>
          </View>
        )}
      </YStack>
    </XStack>
  )

  // Use Sheet for native, Dialog for web
  if (Platform.OS === 'web') {
    const { Dialog } = require('tamagui')

    return (
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            backgroundColor="rgba(0,0,0,0.5)"
            animation="lazy"
            opacity={1}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            backgroundColor="white"
            borderRadius={16}
            maxWidth={500}
            width={media.sm ? '90%' : 500}
            elevate
            maxHeight="80vh"
            padding={0}
            animation="medium"
          >
            <YStack>
              {/* Header */}
              <XStack
                justifyContent="space-between"
                alignItems="center"
                padding={20}
                borderBottomWidth={1}
                borderBottomColor="#F3F4F6"
              >
                <XStack space={8} alignItems="center">
                  <Text fontSize={18} fontWeight="600" color="#1F2937">
                    Notifications
                  </Text>
                  {unreadCount > 0 && (
                    <View
                      backgroundColor="#EF4444"
                      borderRadius={10}
                      paddingHorizontal={8}
                      paddingVertical={2}
                    >
                      <Text fontSize={12} color="white" fontWeight="600">
                        {unreadCount}
                      </Text>
                    </View>
                  )}
                </XStack>

                <XStack space={8}>
                  {unreadCount > 0 && (
                    <Button
                      size="$2"
                      backgroundColor="transparent"
                      color="#6B7280"
                      onPress={markAllAsRead}
                      icon={<Check size={16} />}
                    >
                      Mark all read
                    </Button>
                  )}
                  <Button
                    size="$2"
                    circular
                    icon={<X size={18} />}
                    backgroundColor="transparent"
                    onPress={() => onOpenChange(false)}
                  />
                </XStack>
              </XStack>

              {/* Notifications List */}
              <ScrollView maxHeight="60vh" showsVerticalScrollIndicator={false}>
                {notifications.length === 0 ? (
                  <YStack padding={40} alignItems="center" space={16}>
                    <Bell size={48} color="#D1D5DB" />
                    <Text fontSize={16} color="#6B7280" textAlign="center">
                      No notifications yet
                    </Text>
                    <Text fontSize={14} color="#9CA3AF" textAlign="center">
                      We'll notify you when something important happens
                    </Text>
                  </YStack>
                ) : (
                  <YStack>
                    {notifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <NotificationItem notification={notification} />
                        {index < notifications.length - 1 && <Separator borderColor="#F3F4F6" />}
                      </React.Fragment>
                    ))}
                  </YStack>
                )}
              </ScrollView>

              {/* Footer */}
              {notifications.length > 0 && (
                <XStack
                  justifyContent="center"
                  padding={16}
                  borderTopWidth={1}
                  borderTopColor="#F3F4F6"
                >
                  <Button
                    size="$3"
                    backgroundColor="transparent"
                    color="#6B7280"
                    onPress={clearAll}
                  >
                    Clear All Notifications
                  </Button>
                </XStack>
              )}
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    )
  }

  // Native implementation with Sheet
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
      dismissOnSnapToBottom
      zIndex={100_000}
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
      />
      <Sheet.Handle backgroundColor="#E5E7EB" />
      <Sheet.Frame
        backgroundColor="white"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
        flex={1}
      >
        <YStack flex={1}>
          {/* Header */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            padding={20}
            borderBottomWidth={1}
            borderBottomColor="#F3F4F6"
          >
            <XStack space={12} alignItems="center">
              <Text fontSize={20} fontWeight="600" color="#1F2937">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <View
                  backgroundColor="#EF4444"
                  borderRadius={12}
                  paddingHorizontal={10}
                  paddingVertical={4}
                >
                  <Text fontSize={14} color="white" fontWeight="600">
                    {unreadCount}
                  </Text>
                </View>
              )}
            </XStack>

            <Button
              size="$3"
              circular
              icon={<X size={20} />}
              backgroundColor="transparent"
              onPress={() => onOpenChange(false)}
            />
          </XStack>

          {/* Action Buttons */}
          {unreadCount > 0 && (
            <XStack justifyContent="center" padding={12}>
              <Button
                size="$3"
                backgroundColor="transparent"
                color="#6B7280"
                onPress={markAllAsRead}
                icon={<Check size={18} />}
              >
                Mark all as read
              </Button>
            </XStack>
          )}

          {/* Notifications List */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {notifications.length === 0 ? (
              <YStack padding={60} alignItems="center" space={20}>
                <Bell size={60} color="#D1D5DB" />
                <Text fontSize={18} color="#6B7280" textAlign="center">
                  No notifications yet
                </Text>
                <Text fontSize={16} color="#9CA3AF" textAlign="center">
                  We'll notify you when something important happens
                </Text>
              </YStack>
            ) : (
              <YStack>
                {notifications.map((notification, index) => (
                  <React.Fragment key={notification.id}>
                    <NotificationItem notification={notification} />
                    {index < notifications.length - 1 && <Separator borderColor="#F3F4F6" />}
                  </React.Fragment>
                ))}
              </YStack>
            )}
          </ScrollView>

          {/* Footer */}
          {notifications.length > 0 && (
            <XStack
              justifyContent="center"
              padding={20}
              borderTopWidth={1}
              borderTopColor="#F3F4F6"
            >
              <Button size="$4" backgroundColor="transparent" color="#6B7280" onPress={clearAll}>
                Clear All Notifications
              </Button>
            </XStack>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
