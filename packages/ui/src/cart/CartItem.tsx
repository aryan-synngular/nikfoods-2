'use client'

import { Text, XStack, YStack } from 'tamagui'
import { Minus, Plus } from '@tamagui/lucide-icons'
import { Image } from 'react-native'
import { Platform } from 'react-native'

interface CartItemProps {
  name: string
  description?: string
  price: number
  quantity: number
  imageUrl: string
  onIncrement?: () => void
  onDecrement?: () => void
}

export function CartItem({
  imageUrl,
  name,
  description,
  price,
  quantity,
  onIncrement,
  onDecrement,
}: CartItemProps) {
  return (
    <XStack
      style={{
        paddingBottom: 8,
        paddingTop: 8,
        paddingRight: 8,
        paddingLeft: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        elevation: 2,
      }}
    >
      {/* Product image */}
      <YStack
        style={{
          width: 60,
          height: 60,
          borderRadius: 4,
          marginRight: 16,
          backgroundColor: '#F5F5F5',
          overflow: 'hidden',
        }}
      >
        {Platform.OS === 'web' ? (
          <Image
            source={{ uri: imageUrl }}
            alt={name}
            style={{ width: 60, height: 60, objectFit: 'cover' }}
          />
        ) : (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 60, height: 60, resizeMode: 'cover' }}
          />
        )}
      </YStack>

      {/* Product details */}
      <YStack style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#000000', marginBottom: 4 }}>
          {name}
        </Text>

        {description && (
          <Text style={{ fontSize: 14, color: '#666666' }}>{description.substring(0, 60)}...</Text>
        )}
      </YStack>

      {/* Quantity selector */}
      <XStack
        style={{
          alignItems: 'center',
          marginRight: 24,
        }}
      >
        <XStack
          style={{
            borderWidth: 1,
            borderColor: '#EEEEEE',
            borderRadius: 4,
            alignItems: 'center',
            height: 32,
          }}
        >
          <XStack
            onPress={onDecrement}
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFF8EE',
              cursor: 'pointer',
            }}
          >
            <Minus size={16} color="#FFB648" />
          </XStack>
          <Text
            style={{
              width: 32,
              textAlign: 'center',
              fontSize: 16,
              fontWeight: '500',
              color: '#000000',
            }}
          >
            {quantity}
          </Text>
          <XStack
            onPress={onIncrement}
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#FFF8EE',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} color="#FFB648" />
          </XStack>
        </XStack>
      </XStack>

      {/* Price */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: '700',
          color: '#000000',
          minWidth: 80,
          textAlign: 'right',
        }}
      >
        ${price.toFixed(2)}
      </Text>
    </XStack>
  )
}
