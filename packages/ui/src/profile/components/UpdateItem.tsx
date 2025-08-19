import React, { useState, useEffect, useCallback } from 'react'
import { YStack, XStack, Text, Button, ScrollView, Input, Image } from 'tamagui'
import { X } from '@tamagui/lucide-icons'
import { QuantitySelector } from '@my/ui/src/buttons/QuantitySelector'
import { apiGetFoodItems } from 'app/services/FoodService'
import { IFoodItem } from 'app/types/foodItem'
import { apiCreateUpdatingOrder } from 'app/services/OrderService'
import { useLink } from 'solito/link'
import { useStore } from 'app/src/store/useStore'
import { useScreen } from 'app/hook/useScreen'

interface UpdateItemProps {
  orderId: string
  onClose: () => void
  onUpdate: (orderId: string, updatedItems: any) => void
}

interface FoodItem {
  _id: string
  name: string
  description: string
  price: number
  image?: string
  category: {
    _id: string
    name: string
  }
}

interface ApiResponse {
  items: FoodItem[]
  total: number
  page: number
  pageSize: number
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Shimmer skeleton component for loading state
const DishSkeleton = () => (
  <XStack alignItems="center" gap={12}>
    <YStack
      width={64}
      height={64}
      borderRadius={8}
      bg="#E0E0E0"
      animation="quick"
      style={{
        opacity: 0.6,
      }}
    />
    <YStack flex={1} gap={8}>
      <YStack
        height={16}
        width="60%"
        bg="#E0E0E0"
        borderRadius={4}
        animation="quick"
        style={{ opacity: 0.6 }}
      />
      <YStack
        height={12}
        width="80%"
        bg="#E0E0E0"
        borderRadius={4}
        animation="quick"
        style={{ opacity: 0.6 }}
      />
    </YStack>
    <YStack
      height={16}
      width={50}
      bg="#E0E0E0"
      borderRadius={4}
      mr={12}
      animation="quick"
      style={{ opacity: 0.6 }}
    />
    <YStack
      height={40}
      width={60}
      bg="#E0E0E0"
      borderRadius={8}
      animation="quick"
      style={{ opacity: 0.6 }}
    />
  </XStack>
)

export default function UpdateItem({ orderId, onClose, onUpdate }: UpdateItemProps) {
  const { weeklyMenuUnCategorized, fetchWeeklyMenu } = useStore()
  const {isMobile,isMobileWeb}=useScreen()
  console.log('orderId', orderId)
  const now = new Date()
  // Determine default day
  let defaultDay
  if (now.getHours() < 13) {
    // Before 1 PM → today
    defaultDay = weekDays[now.getDay() - 1]
  } else {
    // After 1 PM → tomorrow
    defaultDay = weekDays[now.getDay() % 7]
  }
  const [selectedDay, setSelectedDay] = useState(defaultDay)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [foodItems, setFoodItems] = useState<IFoodItem[]>([])
  const [searchResults, setSearchResults] = useState<IFoodItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [cartItems, setCartItems] = useState<{ [day: string]: { [key: string]: number } }>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
  })


  // Helpers to compute current week's date for a weekday and disable state
  const dayIndexMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  }

  const getCurrentWeekDateFor = (dayName: string): Date => {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const nowDay = startOfToday.getDay()
    const monday = new Date(startOfToday)
    const diffToMonday = (nowDay + 6) % 7
    monday.setDate(monday.getDate() - diffToMonday)

    const targetIndex = dayIndexMap[dayName] ?? 1
    const offsetFromMonday = (targetIndex + 6) % 7

    const result = new Date(monday)
    result.setDate(monday.getDate() + offsetFromMonday)
    result.setHours(0, 0, 0, 0)
    return result
  }

  const isDayDisabled = (dayName: string): boolean => {
    const now = new Date()
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)
    const target = getCurrentWeekDateFor(dayName)

    if (target.getTime() < startOfToday.getTime()) return true
    if (target.getTime() === startOfToday.getTime() && now.getHours() >= 13) return true
    return false
  }

  // Search through weekly menu locally
  const searchWeeklyMenu = useCallback(
    (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setIsSearching(false)
        setSelectedDay(defaultDay)
        return
      }
      else{
        setSelectedDay("")
      }
    
      setSearchResults([])

      setIsSearching(true)
      const searchLower = searchTerm.toLowerCase()
      const allResults: IFoodItem[] = []
 const now = new Date()
    const todayIndex = now.getDay() === 0 ? 7 : now.getDay() // Sun=7, Mon=1...

    // ✅ Filter only valid upcoming days
    const validDays = weekDays.filter((dayName, idx) => {
      const dayIndex = idx + 1 // Mon=1 ... Sat=6
      if (dayIndex < todayIndex) return false
      if (dayIndex === todayIndex && now.getHours() >= 13) return false
      return true
    })

      // Search through all days in weekly menu
      validDays.forEach((day) => {
        const dayKey = day.toLowerCase()
        const dayItems = weeklyMenuUnCategorized[dayKey] || []
console.log("Search: ", searchLower)
console.log("DayItems: ", day)
console.log(dayItems)
        const filteredItems = dayItems.filter(
          (item: IFoodItem) =>
            item.name?.toLowerCase().includes(searchLower) 
        )
        
        // Add day information to items for display
        const itemsWithDay = filteredItems.map((item: IFoodItem) => ({
          ...item,
          dayAvailable: day,
        }))
        console.log(itemsWithDay)

        allResults.push(...itemsWithDay)
      })
console.log(allResults)
      setSearchResults(()=>allResults)
    },
    [weeklyMenuUnCategorized]
  )

  // Initial load
  useEffect(() => {
    fetchWeeklyMenu()
  }, [])

  console.log(weeklyMenuUnCategorized)

  // Set food items when day changes or weekly menu loads
  useEffect(() => {
    if (weeklyMenuUnCategorized[selectedDay?.toLowerCase()]) {
      setFoodItems(weeklyMenuUnCategorized[selectedDay?.toLowerCase()])
    }
  }, [weeklyMenuUnCategorized, selectedDay])

  console.log(foodItems)

  // Search effect
  // useEffect(() => {
  //   searchWeeklyMenu(searchText)
  // }, [searchText, searchWeeklyMenu])

  console.log(foodItems)
  const handleAddItem = (itemId: string) => {
    setCartItems((prev) => ({
      ...prev,
      [selectedDay]: {
        ...prev[selectedDay],
        [itemId]: (prev[selectedDay][itemId] || 0) + 1,
      },
    }))
  }

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => {
      const newCart = { ...prev }
      const dayCart = { ...newCart[selectedDay] }

      if (dayCart[itemId] > 1) {
        dayCart[itemId]--
      } else {
        delete dayCart[itemId]
      }

      return {
        ...newCart,
        [selectedDay]: dayCart,
      }
    })
  }

  const handleAddItemFromSearch = (day:string,itemId: string) => {
    setCartItems((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [itemId]: (prev[day][itemId] || 0) + 1,
      },
    }))
  }

  const handleRemoveItemFromSearch = (day:string,itemId: string) => {
    setCartItems((prev) => {
      const newCart = { ...prev }
      const dayCart = { ...newCart[day] }

      if (dayCart[itemId] > 1) {
        dayCart[itemId]--
      } else {
        delete dayCart[itemId]
      }

      return {
        ...newCart,
        [day]: dayCart,
      }
    })
  }

  const getTotalItems = (day?: string) => {
    const targetDay = day || selectedDay
    return Object.values(cartItems[targetDay] || {}).reduce((sum, qty) => sum + qty, 0)
  }

  const getTotalAllDays = () => {
    return Object.values(cartItems).reduce((sum, dayCart) => {
      return sum + Object.values(dayCart).reduce((daySum, qty) => daySum + qty, 0)
    }, 0)
  }

  const getTotalPrice = () => {
    const currentItems = isSearching && searchText ? searchResults : foodItems
    return Object.entries(cartItems).reduce((total, [day, dayCart]) => {
      return (
        total +
        Object.entries(dayCart).reduce((dayTotal, [itemId, quantity]) => {
          const item = currentItems.find((d) => d._id === itemId)
          return dayTotal + (item ? item.price * quantity : 0)
        }, 0)
      )
    }, 0)
  }

  const handleUpdateCart = async () => {
    setIsLoading(true)
    try {
      const payload = { orderId, cartItems }
      const response = await apiCreateUpdatingOrder<{
        success: boolean
        data?: { updatingOrderId: string }
      }>(payload)
      console.log('Update order response:', response)
      if (response?.success && response?.data?.updatingOrderId) {
        const updatingOrderId = response.data.updatingOrderId
        if (typeof window !== 'undefined') {
          window.location.href = `/update-order?updatingOrderId=${updatingOrderId}`
        }
      }
      onClose()
    } catch (error) {
      console.error('Error creating updating order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (day: string) => {
    setSearchResults([])
    setIsSearching(false)
    setSelectedDay(day)
    setFoodItems(weeklyMenuUnCategorized[day?.toLowerCase()])
    setSearchText("")
  }

  // Determine which items to display
  console.log(foodItems)

  console.log(searchResults)
useEffect(() => {
  const handler = setTimeout(() => {
    searchWeeklyMenu(searchText)
  }, 300) // wait 300ms after typing stops
  return () => clearTimeout(handler)
}, [searchText, searchWeeklyMenu])
  return (
    <YStack flex={1} bg="transparent" justifyContent="center" alignItems="center" >
      <YStack
        style={{ minWidth:isMobile?420 :616 }}
        height="90vh"
        bg="white"
        borderRadius={24}
        // overflow="hidden"
        // shadowColor="#000"
        // shadowOffset={{ width: 0, height: 4 }}
        // shadowOpacity={0.1}
        // shadowRadius={20}
        // elevation={5}
      >
        <YStack flex={1}>
          <XStack
            justifyContent="space-between"
            alignItems="center"
            px={24}
            py={(isMobile||isMobileWeb)?16:20}
            borderBottomWidth={1}
            borderBottomColor="#F5F5F5"
          >
            <Text fontSize={(isMobile||isMobileWeb)?18:24} fontWeight="600" color="#000">
              Add Items
            </Text>
            <Button
              circular
              size={24}
              bg="transparent"
              color="#999"
              onPress={onClose}
              icon={<X size={20} />}
              pressStyle={{ bg: '#f5f5f5' }}
              disabled={isLoading}
            />
          </XStack>

          <ScrollView   horizontal showsHorizontalScrollIndicator={false}  px={24} py={16}
mb={isMobile?-315:0}
>
            <XStack gap={(isMobile||isMobileWeb)?6:8}>
              {weekDays.map((day) => {
                const isSelected = selectedDay === day
                const itemCount = getTotalItems(day)
                const disabledDay = isDayDisabled(day)

                return (
                  <Button
                    key={day}
                    size={"$3"}
                    bg={isSelected ? '#FF9F0D' : 'white'}
                    color={isSelected ? 'white' : '#999'}
                    borderColor="#E5E5E5"
                    borderWidth={1}
                    borderRadius={8}
                    fontWeight="500"
                    fontSize={14}
                    
                    onPress={() => handleSelect(day)}
                    pressStyle={{
                      bg: isSelected ? '#e8900c' : '#f8f8f8',
                    }}
                    minWidth={itemCount > 0 ? 85 : 75}
                    paddingHorizontal={16}
                    paddingVertical={8}
                    disabled={isLoading || disabledDay}
                    pb={2}
                  >
                    {itemCount > 0 ? `${day} (${itemCount})` : day}
                  </Button>
                )
              })}
            </XStack>
          </ScrollView>
          <YStack px={24} pb={(isMobile||isMobileWeb)?14:16}>
            <Input
              placeholder={getTotalAllDays() > 0 ? 'Search food items...' : 'Search Item'}
              value={searchText}
            onChangeText={setSearchText} 
              bg="#F8F8F8"
              borderColor="#E5E5E5"
              borderWidth={1}
              borderRadius={8}
              height={(isMobile||isMobileWeb)?44:48}
              fontSize={16}
              color="#666"
              placeholderTextColor="#999"
              paddingHorizontal={16}
              disabled={isLoading}
            />
          </YStack>

          <YStack px={24} pb={16}>
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={(isMobile||isMobileWeb)?17:18} fontWeight="600" color="#000">
                {isSearching && searchText ? 'Search Results' : 'Food Items'}
              </Text>
              {getTotalAllDays() > 0 && (
                <Text fontSize={14} fontWeight="600" color="#FF9F0D">
                  Total: ${getTotalPrice().toFixed(2)}
                </Text>
              )}
            </XStack>
          </YStack>

          <ScrollView
            flex={1}
            px={24}
            height={500}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            <YStack gap={(isMobile||isMobileWeb)?12:16}>
              {!isSearching?( dataLoading && foodItems.length === 0
                ? // Show shimmer skeleton while loading initial data
                  Array.from({ length: 5 }).map((_, index) => <DishSkeleton key={index} />)
                : foodItems?.map((item) => {
                    const quantity = cartItems[selectedDay]?.[item?._id] || 0

                    return (
                      <XStack key={item._id} alignItems="center" gap={12}>
                        <YStack
                          width={(isMobile||isMobileWeb)?60:64}
                          height={(isMobile||isMobileWeb)?60:64}
                          borderRadius={8}
                          overflow="hidden"
                          bg="#F0F0F0"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {item?.url ? (
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
                              <Image
                                src={item?.url}
                                alt={item.name}
                                width={70}
                                height={70}
                                resizeMode="cover"
                              />
                            </YStack>
                          ) : (
                            <Text fontSize={10} color="#999">
                              IMG
                            </Text>
                          )}
                        </YStack>

                        <YStack flex={1} gap={4}>
                          <Text fontSize={(isMobile||isMobileWeb)?14:16} fontWeight="600" color="#000">
                            {item.name}
                            
                          </Text>
                          <Text fontSize={12} color="#999" numberOfLines={1}>
                            {item.description.length > 40
                              ? item.description.slice(0, 37) + '...'
                              : item.description ||
                                (item.category as any)?.name ||
                                'No description available'}
                          </Text>
                        </YStack>

                        <Text fontSize={(isMobile||isMobileWeb)?14:16} fontWeight="600" color="#000" mr={12}>
                          ${item.price.toFixed(2)}
                        </Text>

                        <QuantitySelector
                          quantity={quantity}
                          onAdd={() => handleAddItem(item._id)}
                          onIncrement={() => handleAddItem(item._id)}
                          onDecrement={() => handleRemoveItem(item._id)}
                        />
                      </XStack>
                    )
                  })):
                      isSearching&&searchResults?.map((item) => {
                    const quantity = cartItems[item?.dayAvailable]?.[item?._id] || 0

                    return (
                    <XStack key={`${item._id}-${(item as any).dayAvailable}`} alignItems="center" gap={12}>

                        <YStack
                         width={(isMobile||isMobileWeb)?60:64}
                          height={(isMobile||isMobileWeb)?60:64}
                          borderRadius={8}
                          overflow="hidden"
                          bg="#F0F0F0"
                          justifyContent="center"
                          alignItems="center"
                        >
                          {item?.url ? (
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
                              <Image
                                src={item?.url}
                                alt={item.name}
                                width={70}
                                height={70}
                                resizeMode="cover"
                              />
                            </YStack>
                          ) : (
                            <Text fontSize={10} color="#999">
                              IMG
                            </Text>
                          )}
                        </YStack>

                        <YStack flex={1} gap={4}>
                          <Text fontSize={(isMobile||isMobileWeb)?14:16} fontWeight="600" color="#000">
                            {item.name} {" "}
                            {isSearching && searchText && (item as any).dayAvailable && (
                              <Text fontSize={12} color="#FF9F0D" ml={8}>
                                ({(item as any).dayAvailable})
                              </Text>
                            )}
                          </Text>
                          <Text fontSize={12} color="#999" numberOfLines={1}>
                            {item.description.length > 40
                              ? item.description.slice(0, 37) + '...'
                              : item.description ||
                                (item.category as any)?.name ||
                                'No description available'}
                          </Text>
                        </YStack>

                        <Text fontSize={(isMobile||isMobileWeb)?14:16} fontWeight="600" color="#000" mr={12}>
                          ${item.price.toFixed(2)}
                        </Text>

                        <QuantitySelector
                          quantity={quantity}
                          onAdd={() => handleAddItemFromSearch((item as any).dayAvailable, item._id)}
                          onIncrement={() => handleAddItemFromSearch((item as any).dayAvailable,item._id)}
                          onDecrement={() => handleRemoveItemFromSearch((item as any).dayAvailable,item._id)}
                        />
                      </XStack>
                    )
                  })
                  }

              {/* No items found */}
              {!dataLoading && searchResults.length === 0 && (
                <YStack py={32} alignItems="center">
                  <Text fontSize={16} color="#999" textAlign="center">
                    {isSearching && searchText
                      ? 'No items found for your search'
                      : 'No more items to load'}
                  </Text>
                  {searchText && (
                    <Text fontSize={14} color="#999" textAlign="center" mt={8}>
                      Try adjusting your search terms
                    </Text>
                  )}
                </YStack>
              )}
            </YStack>
          </ScrollView>

          <YStack px={24} py={(isMobile||isMobileWeb)?16:20} mb={isMobile?24:0} borderTopWidth={1} borderTopColor="#F5F5F5" bg="white">
            <Button
              bg={getTotalAllDays() > 0 ? '#FF9F0D' : '#FFF4E4'}
              color={getTotalAllDays() > 0 ? 'white' : '#999'}
              size={(isMobile||isMobileWeb)?"$3":"$4"}
              borderRadius={8}
              fontWeight="600"
              fontSize={(isMobile||isMobileWeb)?15:16}
              hoverStyle={{
                bg: '#63533bff',
              }}
              height={(isMobile||isMobileWeb)?52:56}
              disabled={getTotalAllDays() === 0 || isLoading}
              onPress={handleUpdateCart}
              pressStyle={{
                bg: getTotalAllDays() > 0 ? '#e8900c' : '#FFF4E4',
              }}
            >
              {isLoading
                ? 'Updating...'
                : `Update Cart${getTotalAllDays() > 0 ? ` (${getTotalAllDays()} items)` : ''}`}
            </Button>
          </YStack>
        </YStack>
      </YStack>
    </YStack>
  )
}
