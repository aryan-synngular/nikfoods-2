'use client'

import { styled, Text, View, XStack, YStack } from 'tamagui'
import { CartItem } from './CartItem'
import { ICartItem } from 'app/types/cart'
import { CartItemSkeleton } from '../loaders/CartItemSkeleton'
import { useEffect, useState } from 'react'
import { useScreen } from 'app/hook/useScreen'
interface CartDaySectionProps {
  day: string
  date: string
  deliveryLabel?: string
  isItemLoading: { itemId: string; change: number } // Add this prop
  items: ICartItem[]
  onIncrement?: (id: string, change: number) => void
  onDecrement?: (id: string, change: number) => void
}
export function CartDaySection({
  day,
  date,
  deliveryLabel,
  isItemLoading,
  items,
  onIncrement,
  onDecrement,
}: CartDaySectionProps) {
  console.log(isItemLoading)
  const [deliveryDay, setDeliveryDay] = useState<string>('') // client-only
  const [isSameDay, setIsSameDay] = useState<boolean>(false)
  const { isMobile, isMobileWeb } = useScreen()
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
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        marginHorizontal: isMobile || isMobileWeb ? 8 : 0,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        paddingRight: isMobile || isMobileWeb ? 16 : 24,
        paddingLeft: isMobile || isMobileWeb ? 16 : 24,
        paddingTop: isMobile || isMobileWeb ? 4 : 8,
        paddingBottom: isMobile || isMobileWeb ? 4 : 8,
        marginBottom: isMobile || isMobileWeb ? 8 : 16,
      }}
    >
      <XStack
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <YStack>
          <Text
            style={{
              fontSize: isMobile || isMobileWeb ? 17 : 18,
              fontWeight: '600',
              color: '#000000',
            }}
          >
            What's in your {day}'s cart
          </Text>
        </YStack>

        {shouldRenderDeliveryInfo && (
          <View
            bg={'#fff4e4'}
            p={isMobile || isMobileWeb ? '$1' : '$2'}
            borderRadius={isMobile || isMobileWeb ? '$1' : '$2'}
            flexDirection="row"
            alignItems="center"
            gap="$2"
            flexShrink={1}
            mt="$2"
            backgroundColor={'#fff4e4'}
          >
            <Text
              fontSize={isMobile || isMobileWeb ? '$2' : '$3'}
              fontWeight="500"
              color={'#f55344'}
            >
              {`Delivery on ${deliveryDay}`}
            </Text>
          </View>
        )}
      </XStack>

      {/* Items */}
      <YStack width={'100%'}>
        {items.map((item) => (
          <CartItem
            key={item?._id}
            id={item?._id}
            name={item?.food?.name}
            description={item?.food?.description}
            price={Number(item?.food?.price)}
            quantity={item.quantity}
            imageUrl={item?.food?.url}
            onIncrement={() => onIncrement?.(item._id, 1)}
            onDecrement={() => onDecrement?.(item._id, -1)}
            isLoading={isItemLoading}
          />
        ))}
      </YStack>

      {/* Day total */}
      <XStack
        style={{
          paddingTop: isMobile || isMobileWeb ? 8 : 16,
          paddingBottom: isMobile || isMobileWeb ? 8 : 16,
          paddingRight: isMobile || isMobileWeb ? 8 : 24,
          paddingLeft: isMobile || isMobileWeb ? 8 : 24,
          justifyContent: 'flex-end',
          gap: isMobile || isMobileWeb ? 16 : 20,
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
        }}
      >
        <Text
          style={{
            fontSize: isMobile || isMobileWeb ? 14 : 16,
            fontWeight: '600',
            color: '#777679',
          }}
        >
          Day Total
        </Text>
        <Text
          style={{
            fontSize: isMobile || isMobileWeb ? 18 : 20,
            fontWeight: '700',
            color: '#000000',
          }}
        >
          ${dayTotal?.toFixed(2)}
        </Text>
      </XStack>
    </YStack>
  )
}
