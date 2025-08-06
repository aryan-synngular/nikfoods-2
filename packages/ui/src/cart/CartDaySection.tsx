'use client'

import { styled, Text, View, XStack, YStack } from 'tamagui'
import { CartItem } from './CartItem'
import { ICartItem } from 'app/types/cart'
import { CartItemSkeleton } from '../loaders/CartItemSkeleton'
import { useEffect, useState } from 'react'
interface CartDaySectionProps {
  day: string
  date: string
  deliveryLabel?: string
  items: ICartItem[]
  onIncrement?: (id: string, change: number) => void
  onDecrement?: (id: string, change: number) => void
  isItemLoading?: boolean // Add this prop
}
export function CartDaySection({
  day,
  date,
  deliveryLabel,
  items,
  onIncrement,
  onDecrement,
  isItemLoading,
}: CartDaySectionProps) {
  const [deliveryDay, setDeliveryDay] = useState<string>('') // client-only
  const [isSameDay, setIsSameDay] = useState<boolean>(false)

  // Day total
  const dayTotal = items.reduce(
    (sum, item) => sum + Number(item?.food?.price) * Number(item.quantity),
    0
  )

  // Set delivery day on client after mount
  useEffect(() => {
    if (date) {
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
      setDeliveryDay(dayName)
      setIsSameDay(day === dayName)
    }
  }, [date, day])

  // Avoid rendering delivery UI until deliveryDay is set to avoid SSR mismatch
  const shouldRenderDeliveryInfo = deliveryDay !== ''

  return (
    <YStack
      style={{
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        paddingRight: 24,
        paddingLeft: 24,
        paddingTop: 4,
        paddingBottom: 4,
      }}
    >
      <XStack
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <YStack>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#000000' }}>
            What's in your {day}'s cart
          </Text>
        </YStack>

        {shouldRenderDeliveryInfo && (
          <View
            bg={isSameDay ? '#e6f3e6' : '#fff4e4'}
            p="$2"
            borderRadius="$2"
            flexDirection="row"
            alignItems="center"
            gap="$2"
            flexShrink={1}
            mt="$2"
          >
            <Text fontSize="$3" fontWeight="500" color={isSameDay ? 'green' : '#f55344'}>
              {isSameDay ? 'Same day delivery' : `Delivery on ${deliveryDay}`}
            </Text>
          </View>
        )}
      </XStack>

      {/* Items */}
      <YStack>
        {isItemLoading
          ? // Show skeleton for individual items when updating quantities
            Array.from({ length: items.length || 2 }).map((_, index) => (
              <CartItemSkeleton key={index} />
            ))
          : items.map((item) => (
              <CartItem
                key={item?._id}
                name={item?.food?.name}
                description={item?.food?.description}
                price={Number(item?.food?.price)}
                quantity={item.quantity}
                imageUrl={item?.food?.url}
                onIncrement={() => onIncrement?.(item._id, 1)}
                onDecrement={() => onDecrement?.(item._id, -1)}
              />
            ))}
      </YStack>

      {/* Day total */}
      <XStack
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          // paddingRight: 24,
          // paddingLeft: 24,
          justifyContent: 'flex-end',
          gap: 20,
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#777679' }}>Day Total</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#000000' }}>
          ${dayTotal?.toFixed(2)}
        </Text>
      </XStack>
    </YStack>
  )
}
