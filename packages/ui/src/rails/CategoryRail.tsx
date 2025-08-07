'use client'

import { XStack, ScrollView, YStack, Circle, Button } from 'tamagui'
import { CategoryCard } from '../cards/CategoryCard'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from '@tamagui/lucide-icons'
import { IFoodCategory } from 'app/types/category'
import { IListResponse } from 'app/types/common'

export interface CategoryRailProps {
  categories: IListResponse<IFoodCategory> | null
}

export function CategoryRail({ categories }: CategoryRailProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const scrollViewRef = useRef<any>(null)

  const handleCardPress = (id: string) => {
    setSelectedId(selectedId === id ? null : id)
    console.log('Card pressed:', id)
  }

  const scrollLeft = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollViewRef.current.scrollLeft - 300),
        animated: true,
      })
    }
  }

  const scrollRight = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: scrollViewRef.current.scrollLeft + 300,
        animated: true,
      })
    }
  }

  return (
    <YStack position="relative" height={250}>
      {/* Left scroll button */}
      <Circle
        size={40}
        bg="white"
        style={{
          position: 'absolute',
          left: 5,
          top: '50%',
          zIndex: 1,
          opacity: 0.9,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          transform: [{ translateY: -20 }],
          cursor: 'pointer',
        }}
        pressStyle={{ opacity: 0.7 }}
        onPress={scrollLeft}
      >
        <ChevronLeft size={24} color="#FF9F0D" />
      </Circle>

      {/* Right scroll button */}
      <Circle
        size={40}
        bg="white"
        style={{
          position: 'absolute',
          right: 5,
          top: '50%',
          zIndex: 1,
          opacity: 0.9,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
          transform: [{ translateY: -20 }],
          cursor: 'pointer',
        }}
        pressStyle={{ opacity: 0.7 }}
        onPress={scrollRight}
      >
        <ChevronRight size={24} color="#FF9F0D" />
      </Circle>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={{ height: 250, minHeight: 250, width: '100%' }}
        contentContainerStyle={{ paddingLeft: 20, paddingRight: 20 } as any}
      >
        <XStack justify='center' items="center" gap="$10" style={{ paddingTop: 20, paddingBottom: 20 }}>
          {categories?.items?.map((category) => (
            <CategoryCard
              key={category._id}
              imageUrl={category.url}
              name={category.name}
              selected={selectedId === category._id}
              onPress={() => handleCardPress(category._id)}
            />
          ))}
        </XStack>
      </ScrollView>
    </YStack>
  )
}
