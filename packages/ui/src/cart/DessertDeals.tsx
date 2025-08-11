'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button, Text, XStack, YStack, Image } from 'tamagui'
import { apiAddFoodItemToCart, apiGetCartReccomendations } from 'app/services/CartService'
import { IListResponse, IResponse } from 'app/types/common'
import { IFoodCategory } from 'app/types/category'
import { IFoodItem } from 'app/types/foodItem'
import { DeliveryDatePopup } from '../popups/DeliveryDatePopup'
import { useToast } from '../useToast'
import { useStore } from 'app/src/store/useStore'
interface DessertItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
}

interface DessertDealsProps {
  items: DessertItem[]
  onAddItem?: () => void
  onViewAll?: () => void
}

export function DessertDeals({ items, onAddItem, onViewAll }: DessertDealsProps) {
const {addToCart}=useStore()
const [loading, setLoading] = useState(false)
  const [selectedFoodItem, setSelectedFoodItem] = useState<IFoodItem | null>(null)
   
  const [isDatePopupOpen, setIsDatePopupOpen] = useState(false)

  const handleAddButtonClick = (item: any) => {
    setSelectedFoodItem(item)
    setIsDatePopupOpen(true)
  }
    const { showMessage } = useToast()
  
    const handleDateSelection = async (selectedDates: any) => {
      console.log(selectedDates)
      
      try {
        setLoading(true)
        const data = await addToCart({
          foodItemId: selectedFoodItem?._id,
          ...selectedDates,
        })
        showMessage('Item Added to Cart', 'success')
  
        console.log(data)
      } catch (error) {
        console.log(error)
      }
      finally{
        setLoading(false)
      }
        setIsDatePopupOpen(false)
    }
  const [desserts, setDesserts] = useState<IListResponse<IFoodItem>>({
    items: [],
    page: 1,
    pageSize: 5,
    total: 0,
  })
  const getCartRecommendations = useCallback(async () => {
    const data = await apiGetCartReccomendations<IResponse<IListResponse<IFoodItem>>>({})
    console.log(data)
    setDesserts(data?.data)
  }, [])
  useEffect(() => {
    getCartRecommendations()
  }, [getCartRecommendations])
  return (
    <YStack style={{ padding: 20 }}>
      <XStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#2A1A0C' }}>
          Dessert deals- to Grab now!
        </Text>

        {/* <Text 
          onPress={onViewAll}
          style={{ 
            fontSize: 14, 
            color: '#FF9F0D', 
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          View all wednesday dessert items
        </Text> */}
      </XStack>

      <YStack style={{ gap: 12 }}>
        {desserts.items.slice(0, 3).map((item) => (
          <XStack
            key={item._id}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#F0F0F0',
              borderRadius: 8,
              backgroundColor: 'white',
            }}
          >
            <YStack
              style={{
                width: 70,
                height: 70,
                borderRadius: 8,
                marginRight: 12,
                backgroundColor: '#F5F5F5',
                overflow: 'hidden',
              }}
            >
              <Image src={item.url} alt={item.name} width={70} height={70} resizeMode="cover" />
            </YStack>

            <YStack style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#2A1A0C', marginBottom: 4 }}>
                {item.name}
              </Text>

              <Text style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                {item.description.substring(0, 60)}....
              </Text>

              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#2A1A0C' }}>
                  ${item.price.toFixed(2)}
                </Text>

                <Button
                  onPress={() => {
                    handleAddButtonClick(item)
                  }}
                  style={{
                    backgroundColor: '#FF9F0D',

                    borderRadius: 4,
                    height: 32,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    color: 'white',
                  }}
                >
                  Add
                </Button>
              </XStack>
            </YStack>
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
