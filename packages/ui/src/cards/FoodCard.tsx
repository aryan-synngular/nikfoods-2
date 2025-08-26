'use client'

import { useState } from 'react'
import { Image } from 'react-native'
import { Text, YStack, XStack, Circle, ZStack } from 'tamagui'
import { QuantitySelector } from '../buttons/QuantitySelector'
import {BadgeCheck, Check, CheckCircle2, ShoppingCart} from '@tamagui/lucide-icons'
import { colors } from '../colors'
import { useScreen } from 'app/hook/useScreen'
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
  onItemClick?: () => void // Add click handler for image and name
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
  onItemClick,
}: FoodCardProps) {
  const formattedPrice = `$${price?.toFixed(2)}`
const {isMobile}=useScreen()
  // Format price with dollar sign and two decimal places

  // Handle the add button click to open the date popup

  // Handle date selection from popup

  return (
    <>
      <YStack minW={200} style={{ alignItems: 'center' }}>
        {/* Main container with relative positioning */}
        <YStack minW={180} style={{ alignItems: 'center',position: 'relative' }}>
          {/* Circle image that overlaps the card */}
          
          <Circle
            size={isMobile?80:100}
            overflow="hidden"
            style={{
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 5,
              boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
              zIndex: 2,
              marginBottom: isMobile?-50:-70, // Creates overlap effect
              cursor: 'pointer',
            }}
            onPress={onItemClick}
          >
            <Image
              source={{ uri: imageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Circle>

          {/* Card content */}
          <YStack
            minW={isMobile?160:180}
            style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'white' }}
            boxShadow="10px 10px 20px rgba(0, 0, 0, 0.1)"
          >
            {/* Empty space for the circle image */}
            <YStack height={isMobile?45:70} />

            <YStack style={{ padding:isMobile?14: 16, gap: isMobile?8:12 }}>
              <XStack justify={"space-between"} items={"center"} >

              <Text 
                fontSize={isMobile?14:16} 
                fontWeight="600" 
                color="#2A1A0C"
                style={{ cursor: 'pointer' }}
                onPress={onItemClick}
              >
                {name}
              </Text>
              {isAdded&&<XStack style={{borderRadius:20,backgroundColor:colors.info, padding:6, width:25, height:25, justifyContent: 'center', alignItems: 'center'}} >
           <ShoppingCart size={12}  color={"white"}></ShoppingCart>
          </XStack>}
              </XStack>
              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text fontSize={isMobile?14:16} color="#FF9F0D">
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
