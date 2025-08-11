'use client'

import { Text, YStack, XStack, ScrollView } from 'tamagui'
import { useState } from 'react'
import { FoodCard } from '../cards/FoodCard'
import { DeliveryDatePopup } from '../popups/DeliveryDatePopup'
import { IListResponse } from 'app/types/common'
import { Dimensions } from 'react-native'
import { useToast } from '@my/ui/src/useToast'
import { useStore } from 'app/src/store/useStore'
import { colors } from '@my/ui'

export interface FoodItem {
  _id: string
  name: string
  price: number
  url: string
  description?: string
  veg?: boolean
  available?: boolean
  public_id?: string
  category?: any[]
  createdAt?: string
  updatedAt?: string
}

export interface FoodListingRailProps {
  displayLabel: string
  foodItems: IListResponse<FoodItem> | null
}

export function FoodListingRail({ displayLabel, foodItems }: FoodListingRailProps) {
  const {addToCart} =useStore()
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
  
  const { showMessage } = useToast()
const [loading, setLoading] = useState(false)
  const handleDateSelection = async (selectedDates: any) => {
    console.log(selectedDates)
    
    try {
      setLoading(true)
      const data = await addToCart({
        foodItemId: selectedFoodItem?._id,
        ...selectedDates,
      })
      showMessage('Cart Updated Successfully', 'success')

    } catch (error) {
      console.log(error)
      showMessage(`Cart Updation Failed: ${error}`, 'error')

    }
    finally{
      setLoading(false)
    }
      setIsDatePopupOpen(false)
  }

  // Calculate responsive layout
  const screenWidth = Dimensions.get('window').width 
  const horizontalPadding = 40 // 20px on each side
  const minCardWidth = 160 // Minimum card width for readability
  const maxCardWidth = 200 // Maximum card width (original design)
  const gap = 40
  
  const availableWidth = screenWidth - horizontalPadding
  
  // Calculate optimal number of items per row
  let itemsPerRow = Math.floor((availableWidth + gap) / (minCardWidth + gap))
  itemsPerRow = Math.max(2, itemsPerRow) // Ensure minimum 2 items per row
  
  // Calculate actual card width based on available space
  const calculatedCardWidth = (availableWidth - (gap * (itemsPerRow - 1))) / itemsPerRow
  const cardWidth = Math.min(calculatedCardWidth, maxCardWidth) // Don't exceed original design size
  
  // Recalculate items per row if card width is constrained
  const finalItemsPerRow = Math.floor((availableWidth + gap) / (cardWidth + gap))
  const actualItemsPerRow = Math.max(2, finalItemsPerRow)

  // Group items into rows
  const groupedItems: FoodItem[][] = []
  const items = foodItems?.items || []
  for (let i = 0; i < items.length; i += actualItemsPerRow) {
    groupedItems.push(items.slice(i, i + actualItemsPerRow))
  }

  return (
    <YStack  style={{ paddingTop: 20, paddingBottom: 20 }}>
      <Text text={"center"} fontSize={24} fontWeight="600" style={{ paddingLeft: 20, marginBottom: 16 }}>
        {displayLabel}
      </Text>
     { foodItems?.items.length === 0?(<XStack mt={20} justify='center'  >
        <Text fontSize={24} fontWeight={600} style={{color:colors.primary}}>No Food Items found</Text>
      </XStack>) : null}  
      <YStack style={{ paddingHorizontal: 30, paddingBottom: 20,paddingLeft:0 }}>
        {groupedItems.map((row, rowIndex) => (
          <XStack 
            key={rowIndex}
            style={{ 
              justifyContent: row.length === actualItemsPerRow ? 'flex-start' : 'flex-start',
              alignItems: 'flex-start',
              marginBottom: 16,
              gap: row.length === actualItemsPerRow ? 40 : gap,
              flexWrap: 'wrap',
            }}
          >
            
            { row?.map((item, itemIndex) => (
              <YStack key={item._id} style={{ width: cardWidth }}>
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
        ))}
      </YStack>
      <DeliveryDatePopup
        item={selectedFoodItem}
        open={isDatePopupOpen}
        loading={loading}
        onOpenChange={setIsDatePopupOpen}
        onSelect={handleDateSelection}
      />
    </YStack>
  )
}