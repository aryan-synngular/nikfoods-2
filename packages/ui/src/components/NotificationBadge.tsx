import React from 'react'
import { Text, View, XStack } from 'tamagui'
import { Platform } from 'react-native'

interface NotificationBadgeProps {
  count: number
  children: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  color?: string
  backgroundColor?: string
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  showZero?: boolean
  maxCount?: number
}

export function NotificationBadge({
  count,
  children,
  size = 'medium',
  color = 'white',
  backgroundColor = '#FF4444',
  position = 'top-right',
  showZero = false,
  maxCount = 99,
}: NotificationBadgeProps) {
  const shouldShow = count > 0 || (showZero && count === 0)

  if (!shouldShow) {
    return <>{children}</>
  }

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString()

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return {
          badgeSize: 16,
          fontSize: 10,
          minWidth: 16,
          borderRadius: 8,
        }
      case 'large':
        return {
          badgeSize: 24,
          fontSize: 12,
          minWidth: 24,
          borderRadius: 12,
        }
      case 'medium':
      default:
        return {
          badgeSize: 20,
          fontSize: 11,
          minWidth: 20,
          borderRadius: 10,
        }
    }
  }

  const getPositionStyle = () => {
    const offset = getSizeConfig().badgeSize / 2

    switch (position) {
      case 'top-left':
        return { top: -offset, left: -offset }
      case 'bottom-right':
        return { bottom: -offset, right: -offset }
      case 'bottom-left':
        return { bottom: -offset, left: -offset }
      case 'top-right':
      default:
        return { top: -offset, right: -offset }
    }
  }

  const sizeConfig = getSizeConfig()
  const positionStyle = getPositionStyle()

  return (
    <View position="relative">
      {children}
      <View
        bg={backgroundColor}
        br={sizeConfig.borderRadius}
        minWidth={sizeConfig.minWidth}
        h={sizeConfig.badgeSize}
        jc="center"
        ai="center"
        px={count > 9 ? 6 : 2}
        borderWidth={Platform.OS === 'web' ? 2 : 1}
        borderColor="white"
        elevation={Platform.OS === 'android' ? 4 : 0}
        shadowColor={Platform.OS === 'ios' ? 'rgba(0,0,0,0.3)' : undefined}
        shadowOffset={Platform.OS === 'ios' ? { width: 0, height: 1 } : undefined}
        shadowOpacity={Platform.OS === 'ios' ? 0.3 : undefined}
        shadowRadius={Platform.OS === 'ios' ? 2 : undefined}
        style={{
          ...positionStyle,
          zIndex: 10,
          borderRadius:20,
          justifyContent: 'center', 
          alignItems: 'center',
          position: 'absolute',
          height: sizeConfig.badgeSize,
          width: sizeConfig.badgeSize,
          top: -1,
          right:-4,

        }}
        
      >
        <Text
          col={color as any}
          fontSize={sizeConfig.fontSize}
          fontWeight="600"
          ta="center"
          lineHeight={sizeConfig.badgeSize}
        >
          {displayCount}
        </Text>
      </View>
    </View>
  )
}

// Specialized cart badge component
export function CartBadge({
  count,
  children,
  ...props
}: Omit<NotificationBadgeProps, 'backgroundColor'> & {
  backgroundColor?: string
}) {
  return (
    <NotificationBadge count={count} backgroundColor="#FF9F0D" {...props}>
      {children}
    </NotificationBadge>
  )
}

// Specialized notification bell badge
export function NotificationBellBadge({
  count,
  children,
  ...props
}: Omit<NotificationBadgeProps, 'backgroundColor' | 'size'> & {
  backgroundColor?: string
  size?: 'small' | 'medium' | 'large'
}) {
  return (
    <NotificationBadge count={count} backgroundColor="#EF4444" size="small" {...props}>
      {children}
    </NotificationBadge>
  )
}
