'use client'

import { styled, Text, View, XStack, YStack } from 'tamagui'
import { CartItem } from './CartItem'
import { ICartItem } from 'app/types/cart'
import { CartItemSkeleton } from '../loaders/CartItemSkeleton'
import { useEffect, useState } from 'react'
import { useScreen } from 'app/hook/useScreen'
import { Info } from '@tamagui/lucide-icons'
import { calculateCartClubbing, DeliveryMessage } from '../utils/cartLogic'

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
  const [deliveryMessage, setDeliveryMessage] = useState<DeliveryMessage | null>(null)
  const { isMobile, isMobileWeb } = useScreen()
  
  // Day total
  const dayTotal = items.reduce(
    (sum, item) => sum + Number(item?.food?.price) * Number(item.quantity),
    0
  )

  // Calculate delivery message using the new cart clubbing logic
  useEffect(() => {
    if (minCartValue > 0 && allCartDays.length > 0) {
      const cartDaysData = allCartDays.map((cartDay, index) => ({
        day: cartDay.day,
        date: cartDay.date,
        items: cartDay.items,
        dayTotal: cartDay.items.reduce((sum, item) => sum + Number(item?.food?.price) * Number(item.quantity), 0)
      }))
      
      const clubbingResult = calculateCartClubbing(cartDaysData, minCartValue)
      const dayMessage = clubbingResult.deliveryMessages.find(msg => msg.day === day)
      
      if (dayMessage) {
        setDeliveryMessage(dayMessage)
      }
    }
  }, [day, minCartValue, allCartDays, dayTotal])

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

        {deliveryMessage && deliveryMessage.color === 'green' && (
          <View
            style={{
              backgroundColor: '#e8f5e8',
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
              color="#2d5a2d"
            >
              Same day delivery
            </Text>
          </View>
        )}
        {deliveryMessage && deliveryMessage.isClubbed && deliveryMessage.color === 'orange' && (
          <View
            style={{
              backgroundColor: '#fff4e4',
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
              color="#ff9500"
            >
              Delivery on {deliveryMessage.deliveryDay}
            </Text>
          </View>
        )}
        {deliveryMessage && deliveryMessage.isClubbed && deliveryMessage.color === 'red' && (
          <View
            style={{
              backgroundColor: '#fff4e4',
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
              color="#f55344"
            >
              Delivery on {deliveryMessage.deliveryDay}
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
            color: deliveryMessage?.color === 'red' ? '#f55344' : 
                   deliveryMessage?.color === 'orange' ? '#ff9500' : '#000000',
          }}
        >
          ${dayTotal?.toFixed(2)}
        </Text>
      </XStack>
      
      {deliveryMessage && (deliveryMessage.color === 'red' || deliveryMessage.color === 'orange') && (
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
              backgroundColor: deliveryMessage.color === 'orange' ? '#ff9500' : '#f55344',
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
              color: deliveryMessage.color === 'orange' ? '#ff9500' : '#f55344',
              flex: 1,
            }}
          >
            {deliveryMessage.message}
          </Text>
        </XStack>
      )}
    </YStack>
  )
}
