'use client'

import { Image, Text, YStack, XStack, Circle, Button } from 'tamagui'
import { ArrowRight, EllipsisVertical } from '@tamagui/lucide-icons'
import { useState } from 'react'
import Link from 'next/link'
import { ActionsPopover } from './ActionsPopover'

interface CategoryCardProps {
  id: string
  imageUrl: string
  name: string
  selected?: boolean
  onPress?: () => void
  handleEdit: () => void
  handleDelete: () => void
}

export function CategoryCard({
  id,
  imageUrl,
  name,
  selected = false,
  onPress,
  handleEdit,
  handleDelete,
}: CategoryCardProps) {
  console.log(imageUrl)
  const [isHovered, setIsHovered] = useState(false)

  // Determine background color based on hover and selected states
  const bgColor = selected || isHovered ? '#FF9F0D' : '#FFF4E4'
  // Determine text color based on background (for better contrast)
  const textColor = selected || isHovered ? 'white' : '#2A1A0C'

  return (
    <YStack
      bg={bgColor}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={{
        transform: [{ translateY: isHovered ? -5 : 0 }],
        transition: 'all 0.3s ease',
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        maxHeight: 350,
        width: 250,
        // Box shadow for React Native (mobile)
        shadowColor: '#FF9F0D',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 0, // For Android
        // Box shadow for web - changes based on hover state
        boxShadow: isHovered ? '3px 8px 15px 0px #AEAEC099' : '3px 3px 10px 0px #AEAEC066',
        // Add cursor pointer for web
        cursor: 'pointer',
      }}
    >
      <YStack>
        <Circle size={200} overflow="hidden">
          <Image
            source={{
              uri: imageUrl
                ? imageUrl
                : 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8fDA%3D',
            }}
            width="100%"
            height="100%"
            resizeMode="cover"
          />
        </Circle>
      </YStack>

      <Text fontSize={20} mt={6} fontWeight="bold" color={textColor}>
        {name}
      </Text>
      <Link href={`/admin/food-items?categoryId=${id}&category=${name}`}>
        <Button
          chromeless
          circular
          bg={'$blue5'}
          hoverStyle={{ background: '$blue6' }}
          icon={<ArrowRight />}
        ></Button>
      </Link>

      <XStack position="absolute" b={16} r={10}>
        <ActionsPopover
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          shouldAdapt={true}
          placement="right"
          Icon={EllipsisVertical}
          Name="right-popover"
        />
      </XStack>
    </YStack>
  )
}
