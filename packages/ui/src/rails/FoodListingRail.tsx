'use client'

import { Text, YStack, XStack, ScrollView } from 'tamagui'
import { useState } from 'react'
import { FoodCard } from '../cards/FoodCard'
import { DeliveryDatePopup } from '../popups/DeliveryDatePopup'
import { IListResponse } from 'app/types/common'

export interface FoodItem {
  _id: string
  name: string
  price: number
  url: string
}

export interface FoodListingRailProps {
  displayLabel: string
  foodItems: IListResponse<FoodItem> | null
}

export function FoodListingRail({ displayLabel, foodItems }: FoodListingRailProps) {
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null)
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false)

  const handleAdd = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: 1,
    }))
  }

  const handleIncrement = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }))
  }

  const handleDecrement = (id: string) => {
    setQuantities((prev) => {
      const newQuantities = { ...prev }
      if (newQuantities[id] <= 1) {
        delete newQuantities[id]
      } else {
        newQuantities[id] -= 1
      }
      return newQuantities
    })
  }

  const handleAddButtonClick = (item: FoodItem) => {
    setSelectedFoodItem(item)
    setIsDatePopupOpen(true)
  }
  const handleDateSelection = (selectedDates: any) => {
    console.log(selectedDates)
    if (selectedFoodItem) handleAdd(selectedFoodItem._id)
    // Add API call for cart here if needed
  }

  return (
    <YStack style={{ paddingTop: 20, paddingBottom: 20 }}>
      <Text fontSize={28} fontWeight="600" style={{ paddingLeft: 20, marginBottom: 16 }}>
        {displayLabel}
      </Text>
      <YStack style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <XStack flexWrap="wrap" gap="$4" style={{ justifyContent: 'flex-start' }}>
          {foodItems?.items?.map((item) => (
            <YStack key={item._id} style={{ marginBottom: 16 }}>
              <FoodCard
                imageUrl={item.url}
                name={item.name}
                price={item.price}
                quantity={quantities[item._id] || 0}
                onAdd={() => handleAdd(item._id)}
                onIncrement={() => handleIncrement(item._id)}
                onDecrement={() => handleDecrement(item._id)}
                handleAddButtonClick={() => handleAddButtonClick(item)}
              />
            </YStack>
          ))}
        </XStack>
      </YStack>
      <DeliveryDatePopup
        item={selectedFoodItem}
        open={isDatePopupOpen}
        onOpenChange={setIsDatePopupOpen}
        onSelect={handleDateSelection}
      />
    </YStack>
  )
}
