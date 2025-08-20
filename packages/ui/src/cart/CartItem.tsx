'use client'

import { Button, Spinner, Text, XStack, YStack } from 'tamagui'
import { Minus, Plus } from '@tamagui/lucide-icons'
import { Image } from 'react-native'
import { Platform } from 'react-native'
import { colors } from '../colors'
import { useScreen } from 'app/hook/useScreen'

interface CartItemProps {
  key: string
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  imageUrl: string
  onIncrement?: () => void
  onDecrement?: () => void
  isLoading?: { itemId: string; change: number } // Add this prop
}

export function CartItem({
  id,
  imageUrl,
  name,
  description,
  price,
  quantity,
  onIncrement,
  onDecrement,
  isLoading,
}: CartItemProps) {
  const { isMobile, isMobileWeb } = useScreen()
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
        {!(isMobile || isMobileWeb) ? (
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
      <YStack flexDirection={isMobile || isMobileWeb ? 'column' : 'row'} flex={1}>
        <YStack style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: isMobile || isMobileWeb ? 15 : 16,
              fontWeight: '600',
              color: '#000000',
              marginBottom: 4,
            }}
          >
            {name}
          </Text>

          {description && (
            <Text
              style={{
                fontSize: isMobile || isMobileWeb ? 13 : 14,
                color: '#666666',
              }}
            >
              {description.substring(0, isMobile || isMobileWeb ? 40 : 60)}...
            </Text>
          )}
        </YStack>

        {/* Quantity selector */}

        <YStack
          mt={8}
          flexDirection="row"
          justify={'space-between'}
          style={{ alignItems: 'flex-end' }}
        >
          <XStack
            style={{
              alignItems: 'center',
              marginRight: isMobile || isMobileWeb ? 0 : 24,
            }}
          >
            <XStack style={{ alignItems: 'center' }}>
              <Button
                size={isMobile || isMobileWeb ? '$1' : '$2'}
                circular
                style={{
                  width: isMobile || isMobileWeb ? 20 : 24,
                  height: isMobile || isMobileWeb ? 20 : 24,
                  backgroundColor: '#f5f5f5',
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                }}
                onPress={() => onDecrement?.()}
                disabled={isLoading?.itemId === id && isLoading?.change === -1}
              >
                {isLoading?.itemId === id && isLoading?.change === -1 ? (
                  <Spinner color={colors.primary} />
                ) : (
                  <Minus size={12} color="#666" />
                )}
              </Button>
              <Text
                style={{
                  marginHorizontal: isMobile || isMobileWeb ? 8 : 12,
                  fontSize: isMobile || isMobileWeb ? 14 : 16,
                  fontWeight: '500',
                  minWidth: isMobile || isMobileWeb ? 16 : 20,
                  textAlign: 'center',
                }}
              >
                {quantity}
              </Text>
              <Button
                size={isMobile || isMobileWeb ? '$1' : '$2'}
                circular
                style={{
                  width: isMobile || isMobileWeb ? 20 : 24,
                  height: isMobile || isMobileWeb ? 20 : 24,
                  backgroundColor: '#f5f5f5',
                  borderWidth: 1,
                  borderColor: '#e0e0e0',
                }}
                onPress={() => onIncrement?.()}
                disabled={isLoading?.itemId === id && isLoading?.change === 1}
              >
                {isLoading?.itemId === id && isLoading?.change === 1 ? (
                  <Spinner color={colors.primary} />
                ) : (
                  <Plus size={12} color="#666" />
                )}
              </Button>
            </XStack>
          </XStack>

          {/* Price */}
          <Text
            style={{
              fontSize: isMobile || isMobileWeb ? 16 : 18,
              fontWeight: '700',
              color: '#000000',
              minWidth: 80,
              textAlign: 'right',
            }}
          >
            ${price.toFixed(2)}
          </Text>
        </YStack>
      </YStack>
    </XStack>
  )
}
