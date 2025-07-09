"use client"

import { Text, XStack, YStack } from 'tamagui'
import { CartItem } from './CartItem'

interface CartItemData {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  imageUrl: string
}

interface CartDaySectionProps {
  day: string
  date: string
  deliveryLabel?: string
  items: CartItemData[]
  onIncrement?: (id: string) => void
  onDecrement?: (id: string) => void
}

export function CartDaySection({ 
  day, 
  date, 
  deliveryLabel, 
  items,
  onIncrement,
  onDecrement
}: CartDaySectionProps) {
  // Calculate day total
  const dayTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  
  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
  
  // Determine if this is same day delivery
  const isSameDay = deliveryLabel?.toLowerCase().includes('same day')
  
  return (
    <YStack style={{ 
      marginBottom: 16, 
      backgroundColor: 'white', 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#F0F0F0',
      overflow: 'hidden'
    }}>
      {/* Day header */}
      <XStack style={{ 
        paddingHorizontal: 24,
        paddingVertical: 16,
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <YStack>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#000000' }}>
            What's in your {day}'s cart
          </Text>
        </YStack>
        
        {deliveryLabel && (
          <Text style={{ 
            fontSize: 14, 
            fontWeight: '500',
            color: '#4CAF50'
          }}>
            {isSameDay ? 'Same day delivery' : deliveryLabel}
          </Text>
        )}
      </XStack>
      
      {/* Items */}
      <YStack>
        {items.map(item => (
          <CartItem
            key={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            quantity={item.quantity}
            imageUrl={item.imageUrl}
            onIncrement={() => onIncrement?.(item.id)}
            onDecrement={() => onDecrement?.(item.id)}
          />
        ))}
      </YStack>
      
      {/* Day total */}
      <XStack style={{ 
        paddingHorizontal: 24,
        paddingVertical: 16, 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0'
      }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000' }}>
          Day Total
        </Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#000000' }}>
          ${dayTotal.toFixed(2)}
        </Text>
      </XStack>
    </YStack>
  )
}
