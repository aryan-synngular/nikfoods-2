'use client'

import { styled, Text, XStack, YStack } from 'tamagui'
import { CartItem } from './CartItem'
import { ICartItem } from 'app/types/cart'

interface CartDaySectionProps {
  day: string
  date: string
  deliveryLabel?: string
  items: ICartItem[]
  onIncrement?: (id: string) => void
  onDecrement?: (id: string) => void
}

export function CartDaySection({
  day,
  date,
  deliveryLabel,
  items,
  onIncrement,
  onDecrement,
}: CartDaySectionProps) {
  // Calculate day total
  const dayTotal = items.reduce(
    (sum, item) => sum + Number(item?.food?.price) * Number(item.quantity),
    0
  )
  console.log(dayTotal)
  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  // Determine if this is same day delivery
  const isSameDay = deliveryLabel?.toLowerCase().includes('same day')

  const Chip = ({ children, ...props }) => (
    <XStack
      style={{
        borderRadius: 6,
        paddingRight: 12,
        paddingLeft: 12,
        paddingTop: 4,
        paddingBottom: 4,
        backgroundColor: isSameDay ? '#F0FAF5' : '#FFF4E4',
        alignItems: 'center',
        justifyContent: 'center',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </XStack>
  )

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
      {/* Day header */}
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

        {deliveryLabel && (
          <Chip>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: isSameDay ? '#0A9750' : '#F55344',
              }}
            >
              {isSameDay ? 'Same day delivery' : deliveryLabel}
            </Text>
          </Chip>
        )}
      </XStack>

      {/* Items */}
      <YStack>
        {items.map((item) => (
          <CartItem
            key={item?._id}
            name={item?.food?.name}
            description={item?.food?.description}
            price={Number(item?.food?.price)}
            quantity={item.quantity}
            imageUrl={item?.food?.url}
            onIncrement={() => onIncrement?.(item._id)}
            onDecrement={() => onDecrement?.(item._id)}
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
