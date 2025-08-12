'use client'

import { useState } from 'react'
import { Image } from 'react-native'
import { Text, YStack, XStack, Circle, ZStack } from 'tamagui'
import { QuantitySelector } from '../buttons/QuantitySelector'
import {BadgeCheck, ShoppingCart} from '@tamagui/lucide-icons'
import { colors } from '../colors'
interface FoodCardProps {
  imageUrl: string
  name: string
  price: number
  onAdd?: (selectedDates?: string[]) => void
  onIncrement?: () => void
  onDecrement?: () => void
  quantity?: number
  handleAddButtonClick: () => void
  isAdded?: boolean
}

export function FoodCard({
  imageUrl,
  name,
  price,
  onAdd,
  onIncrement,
  onDecrement,
  handleAddButtonClick,
  quantity = 0,
  isAdded = false,
}: FoodCardProps) {
  const formattedPrice = `$${price.toFixed(2)}`

  // Format price with dollar sign and two decimal places

  // Handle the add button click to open the date popup

  // Handle date selection from popup

  return (
    <>
      <YStack minW={200} style={{ alignItems: 'center' }}>
        {/* Main container with relative positioning */}
        <YStack minW={180} style={{ alignItems: 'center',position: 'relative' }}>
          {/* Circle image that overlaps the card */}
          {isAdded&&<XStack style={{ position: 'absolute', top: 40, right:10, zIndex: 1 }}>
            <BadgeCheck color={colors.primary}></BadgeCheck>
          </XStack>}
          <Circle
            size={100}
            overflow="hidden"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 2,
              marginBottom: -70, // Creates overlap effect
            }}
          >
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Circle>

          {/* Card content */}
          <YStack
            minW={180}
            style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'white' }}
            boxShadow="10px 10px 20px rgba(0, 0, 0, 0.1)"
          >
            {/* Empty space for the circle image */}
            <YStack height={70} />

            <YStack style={{ padding: 16, gap: 12 }}>
              <Text fontSize={16} fontWeight="600" color="#2A1A0C">
                {name}
              </Text>
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text fontSize={16} color="#FF9F0D">
                  {formattedPrice}
                </Text>
                <QuantitySelector
                  quantity={quantity}
                  onAdd={handleAddButtonClick}
                  onIncrement={onIncrement}
                  onDecrement={onDecrement}
                />
              </XStack>
            </YStack>
          </YStack>
        </YStack>
      </YStack>

      {/* Delivery Date Selection Popup */}
    </>
  )
}
