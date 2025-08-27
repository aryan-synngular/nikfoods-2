'use client'

import { styled, Text, View, XStack, YStack } from 'tamagui'
import { CartItem } from './CartItem'
import { ICartItem } from 'app/types/cart'
import { CartItemSkeleton } from '../loaders/CartItemSkeleton'
import { useEffect, useState } from 'react'
import { useScreen } from 'app/hook/useScreen'
import { Info } from '@tamagui/lucide-icons'

interface CartDaySectionProps {
  day: string
  date: string
  deliveryLabel?: string
  isItemLoading: { itemId: string; change: number } // Add this prop
  items: ICartItem[]
  onIncrement?: (id: string, change: number) => void
  onDecrement?: (id: string, change: number) => void
  onItemClick?: (item: any) => void // Add click handler for items
  minCartValue?: number // Add minimum cart value prop
  allCartDays?: { day: string; date: string; items: ICartItem[] }[] // Add all cart days for comparison
  currentDayIndex?: number // Add current day index
}

export function CartDaySection({
  day,
  date,
  deliveryLabel,
  isItemLoading,
  items,
  onIncrement,
  onDecrement,
  onItemClick,
  minCartValue = 0,
  allCartDays = [],
  currentDayIndex = 0,
}: CartDaySectionProps) {
  console.log(items)
  console.log(isItemLoading)
  const [deliveryDay, setDeliveryDay] = useState<string>('') // client-only
  const [isSameDay, setIsSameDay] = useState<boolean>(false)
  const [shouldShowDeliveryInfo, setShouldShowDeliveryInfo] = useState<boolean>(false)
  const { isMobile, isMobileWeb } = useScreen()
  
  // Day total
  const dayTotal = items.reduce(
    (sum, item) => sum + Number(item?.food?.price) * Number(item.quantity),
    0
  )

  // Check if day total is less than minimum cart value
  const isBelowMinCartValue = minCartValue > 0 && dayTotal < minCartValue
  const shortfall = minCartValue - dayTotal

  // Calculate delivery day based on minimum cart value logic
  const calculateDeliveryDay = () => {
    if (minCartValue === 0) return null

    // Check if current day meets minimum cart value
    if (dayTotal >= minCartValue) {
      return new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
    }

    // Look for future days that meet the minimum cart value
    for (let i = currentDayIndex + 1; i < allCartDays.length; i++) {
      const futureDay = allCartDays[i]
      const futureDayTotal = futureDay.items.reduce(
        (sum, item) => sum + Number(item?.food?.price) * Number(item.quantity),
        0
      )
      
      if (futureDayTotal >= minCartValue) {
        return new Date(futureDay.date).toLocaleDateString('en-US', { weekday: 'long' })
      }
    }

    // If no future days meet the minimum, don't show delivery info
    return null
  }

  // Set delivery day on client after mount
  useEffect(() => {
    if (date) {
      const calculatedDeliveryDay = calculateDeliveryDay()
      setDeliveryDay(calculatedDeliveryDay || '')
      setShouldShowDeliveryInfo(!!calculatedDeliveryDay)
      
      // Check if it's same day delivery
      const currentDayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' })
      setIsSameDay(calculatedDeliveryDay === currentDayName)
    }
  }, [date, day, minCartValue, allCartDays, currentDayIndex, dayTotal])

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

        {shouldShowDeliveryInfo && deliveryDay && (
          <View
            style={{
              backgroundColor: isSameDay ? '#e8f5e8' : '#fff4e4',
              padding: isMobile || isMobileWeb ? 4 : 8,
              borderRadius: isMobile || isMobileWeb ? 4 : 8,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flexShrink: 1,
              marginTop: 8,
            }}
          >
            <Text
              fontSize={isMobile || isMobileWeb ? '$2' : '$3'}
              fontWeight="500"
              color={isSameDay ? '#2d5a2d' : '#f55344'}
            >
              {isSameDay ? 'Same day delivery' : `Delivery on ${deliveryDay}`}
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
            description={"A perfect balance of taste, aroma, and warmth."}
            price={Number(item?.food?.price)}
            quantity={item.quantity}
            imageUrl={item?.food?.url}
            onIncrement={() => onIncrement?.(item._id, 1)}
            onDecrement={() => onDecrement?.(item._id, -1)}
            isLoading={isItemLoading}
            onItemClick={() => onItemClick?.(item)}
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
            color: isBelowMinCartValue ? '#f55344' : '#000000',
          }}
        >
          ${dayTotal?.toFixed(2)}
        </Text>
      </XStack>
      
      {isBelowMinCartValue && (
        <XStack
          style={{
            paddingHorizontal: isMobile || isMobileWeb ? 8 : 24,
            paddingVertical: 12,
            backgroundColor: '#fff4e4',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            alignItems: 'center',
            gap: 8,
            padding:10,
            borderRadius:10,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: '#f55344',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Info size={12} color="white" />
          </View>
          <Text
            style={{
              fontSize: isMobile || isMobileWeb ? 12 : 16,
              fontWeight: '500',
              color: '#f55344',
              flex: 1,
            }}
          >
            You're ${shortfall.toFixed(2)} short for same-day delivery — add more or get your order on the next delivery.
          </Text>
        </XStack>
      )}
    </YStack>
  )
}
