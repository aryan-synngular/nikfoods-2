import React, { useState, useEffect, useCallback } from 'react'
import { YStack, XStack, Text, Button, ScrollView, Input, Image } from 'tamagui'
import { X } from '@tamagui/lucide-icons'
import { QuantitySelector } from '@my/ui/src/buttons/QuantitySelector'
import { apiGetFoodItems } from 'app/services/FoodService'
import { IFoodItem } from 'app/types/foodItem'
import { apiCreateUpdatingOrder } from 'app/services/OrderService'
import { useLink } from 'solito/link'
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
  <XStack items="center" gap={12}>
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
  console.log('orderId', orderId)
  const now = new Date()
   // Determine default day
  let defaultDay
  if (now.getHours() < 13) {
    // Before 1 PM → today
    defaultDay = weekDays[now.getDay()-1]
  } else {
    // After 1 PM → tomorrow
    defaultDay = weekDays[(now.getDay()) % 7]
  }
  const [selectedDay, setSelectedDay] = useState(defaultDay)
  const [searchText, setSearchText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [foodItems, setFoodItems] = useState<IFoodItem[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [cartItems, setCartItems] = useState<{ [day: string]: { [key: string]: number } }>({
    Monday: {},
    Tuesday: {},
    Wednesday: {},
    Thursday: {},
    Friday: {},
    Saturday: {},
  })

  const pageSize = 7

  // Debounced search function
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value)

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }, [value, delay])

    return debouncedValue
  }

  const debouncedSearchText = useDebounce(searchText, 500)

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

  // Fetch food items from API
  const fetchFoodItems = useCallback(
    async (search = '', page = 1, loadMore = false) => {
      try {
        if (!loadMore) {
          setDataLoading(true)
        } else {
          setIsLoadingMore(true)
        }

        const response = await apiGetFoodItems<{ data: ApiResponse }>({
          search,
          category: 'all',
          page,
          limit: pageSize,
        })

        console.log('Fetched food items:', response.data.items)
        const { items, total, page: currentPageFromApi, pageSize: pageSizeFromApi } = response.data

        if (loadMore) {
          setFoodItems((prev) => [...prev, ...items] as IFoodItem[])
        } else {
          setFoodItems(items as unknown as IFoodItem[])
        }

        const totalPagesCalculated = Math.ceil(total / pageSizeFromApi)
        setTotalPages(totalPagesCalculated)
        setCurrentPage(currentPageFromApi)
        setHasMore(currentPageFromApi < totalPagesCalculated)
      } catch (error) {
        console.error('Error fetching food items:', error)
        // Fallback to empty array on error
        if (!loadMore) {
          setFoodItems([])
        }
      } finally {
        setDataLoading(false)
        setIsLoadingMore(false)
      }
    },
    [pageSize]
  )

  // Initial load
  useEffect(() => {
    fetchFoodItems('', 1, false)
  }, [fetchFoodItems])

  // Search effect
  useEffect(() => {
    if (debouncedSearchText !== searchText) return
    setCurrentPage(1)
    fetchFoodItems(debouncedSearchText, 1, false)
  }, [debouncedSearchText, fetchFoodItems])

  // Load more items
  const loadMoreItems = useCallback(() => {
    if (hasMore && !isLoadingMore && !dataLoading) {
      const nextPage = currentPage + 1
      fetchFoodItems(debouncedSearchText, nextPage, true)
    }
  }, [hasMore, isLoadingMore, dataLoading, currentPage, debouncedSearchText, fetchFoodItems])

  // Handle scroll to load more
  const handleScroll = useCallback(
    (event: any) => {
      const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
      const paddingToBottom = 20

      if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
        loadMoreItems()
      }
    },
    [loadMoreItems]
  )

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
    return Object.entries(cartItems).reduce((total, [day, dayCart]) => {
      return (
        total +
        Object.entries(dayCart).reduce((dayTotal, [itemId, quantity]) => {
          const item = foodItems.find((d) => d._id === itemId)
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

  return (
    <YStack flex={1} bg="transparent" justify="center" items="center" p="$4">
      <YStack
        width="100%"
        maxWidth={616}
        maxHeight="90vh"
        bg="white"
        borderRadius={24}
        overflow="hidden"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 4 }}
        shadowOpacity={0.1}
        shadowRadius={20}
        elevation={5}
      >
        <YStack flex={1}>
          <XStack
            justify="space-between"
            items="center"
            px={24}
            py={20}
            borderBottomWidth={1}
            borderBottomColor="#F5F5F5"
          >
            <Text fontSize={24} fontWeight="600" color="#000">
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} px={24} py={16}>
            <XStack gap={8}>
              {weekDays.map((day) => {
                const isSelected = selectedDay === day
                const itemCount = getTotalItems(day)
                const disabledDay = isDayDisabled(day)

                return (
                  <Button
                    key={day}
                    size="$3"
                    bg={isSelected ? '#FF9F0D' : 'white'}
                    color={isSelected ? 'white' : '#999'}
                    borderColor="#E5E5E5"
                    borderWidth={1}
                    borderRadius={8}
                    fontWeight="500"
                    fontSize={14}
                    onPress={() => setSelectedDay(day)}
                    pressStyle={{
                      bg: isSelected ? '#e8900c' : '#f8f8f8',
                    }}
                    minWidth={itemCount > 0 ? 85 : 75}
                    paddingHorizontal={16}
                    paddingVertical={8}
                    disabled={isLoading || disabledDay}
                  >
                    {itemCount > 0 ? `${day} (${itemCount})` : day}
                  </Button>
                )
              })}
            </XStack>
          </ScrollView>

          <YStack px={24} pb={16}>
            <Input
              placeholder={getTotalAllDays() > 0 ? 'Search food items...' : 'Search Item'}
              value={searchText}
              onChangeText={setSearchText}
              bg="#F8F8F8"
              borderColor="#E5E5E5"
              borderWidth={1}
              borderRadius={8}
              height={48}
              fontSize={16}
              color="#666"
              placeholderTextColor="#999"
              paddingHorizontal={16}
              disabled={isLoading}
            />
          </YStack>

          <YStack px={24} pb={16}>
            <XStack justify="space-between" items="center">
              <Text fontSize={18} fontWeight="600" color="#000">
                Food Items
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
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <YStack gap={16}>
              {dataLoading && foodItems.length === 0
                ? // Show shimmer skeleton while loading initial data
                  Array.from({ length: 5 }).map((_, index) => <DishSkeleton key={index} />)
                : foodItems.map((item) => {
                    const quantity = cartItems[selectedDay]?.[item?._id] || 0

                    return (
                      <XStack key={item._id} items="center" gap={12}>
                        <YStack
                          width={64}
                          height={64}
                          borderRadius={8}
                          overflow="hidden"
                          bg="#F0F0F0"
                          justify="center"
                          items="center"
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
                          <Text fontSize={16} fontWeight="600" color="#000">
                            {item.name}
                          </Text>
                          <Text fontSize={12} color="#999" numberOfLines={1}>
                            {item.description.length > 40
                              ? item.description.slice(0, 37) + '...'
                              : item.description ||
                                // @ts-expect-error category type widening for display
                                (item.category as any)?.name ||
                                'No description available'}
                          </Text>
                        </YStack>

                        <Text fontSize={16} fontWeight="600" color="#000" mr={12}>
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
                  })}

              {/* Loading more indicator */}
              {isLoadingMore && (
                <YStack py={16} items="center">
                  <Text fontSize={14} color="#999">
                    Loading more items...
                  </Text>
                </YStack>
              )}

              {/* No more items indicator */}
              {!hasMore && foodItems.length > 0 && (
                <YStack py={16} items="center">
                  <Text fontSize={14} color="#999">
                    No more items to load
                  </Text>
                </YStack>
              )}

              {/* No items found */}
              {!dataLoading && foodItems.length === 0 && (
                <YStack py={32} items="center">
                  <Text fontSize={16} color="#999" textAlign="center">
                    No food items found
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

          <YStack px={24} py={20} borderTopWidth={1} borderTopColor="#F5F5F5" bg="white">
            <Button
              bg={getTotalAllDays() > 0 ? '#FF9F0D' : '#FFF4E4'}
              color={getTotalAllDays() > 0 ? 'white' : '#999'}
              size="$4"
              borderRadius={8}
              fontWeight="600"
              fontSize={16}
              hoverStyle={{
                bg: '#63533bff',
                color: getTotalAllDays() > 0 ? 'white' : '#000',
              }}
              height={56}
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
