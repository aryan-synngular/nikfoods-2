"use client"

import { useState } from 'react'
import { YStack, Text, XStack, Button } from 'tamagui'
import { FoodCard } from '@my/ui'

export function FoodExampleScreen() {
  const [selectedDates, setSelectedDates] = useState<Record<string, string[]>>({})
  
  // Sample food items
  const foodItems = [
    {
      id: '1',
      name: 'Kaju Katli',
      price: 7.29,
      imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2014/11/Kaju-Katli-500x500.jpg',
      quantity: 0
    },
    {
      id: '2',
      name: 'Gulab Jamun',
      price: 5.99,
      imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2019/04/Gulab-Jamun-500x500.jpg',
      quantity: 0
    }
  ]
  
  // Handle add button click and date selection
  const handleAddWithDates = (foodId: string) => (dates: string[] | undefined) => {
    if (dates && dates.length > 0) {
      setSelectedDates(prev => ({
        ...prev,
        [foodId]: dates
      }))
      
      // You would typically update the quantity here as well
      console.log(`Added ${foodId} for delivery on dates:`, dates)
    }
  }
  
  return (
    <YStack padding={20} space={20}>
      <Text fontSize={24} fontWeight="bold">Food Items</Text>
      
      <XStack flexWrap="wrap" gap={20}>
        {foodItems.map(food => (
          <FoodCard
            key={food.id}
            name={food.name}
            price={food.price}
            imageUrl={food.imageUrl}
            quantity={food.quantity}
            onAdd={handleAddWithDates(food.id)}
          />
        ))}
      </XStack>
      
      {/* Display selected dates */}
      <YStack space={10} marginTop={20}>
        <Text fontSize={18} fontWeight="600">Selected Delivery Dates:</Text>
        {Object.entries(selectedDates).map(([foodId, dates]) => {
          const food = foodItems.find(f => f.id === foodId)
          if (!food) return null
          
          return (
            <YStack key={foodId} padding={10} borderRadius={8} backgroundColor="#FFF8EE">
              <Text fontWeight="500">{food.name}</Text>
              <Text>Delivery on: {dates.join(', ')}</Text>
            </YStack>
          )
        })}
      </YStack>
    </YStack>
  )
}
