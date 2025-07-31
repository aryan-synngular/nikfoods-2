import React, { useState, useEffect } from 'react'
import { YStack, XStack, Text, Button, ScrollView, Card, TextArea, Spinner } from 'tamagui'
import { X, Star, ChevronDown, Square } from '@tamagui/lucide-icons'

interface AddReviewProps {
  orderId: string
  onClose: () => void
  onSubmit: (reviewData: any) => void
  loading?: boolean
}

interface ReviewItem {
  name: string
  selected: boolean
}

export default function AddReview({ orderId, onClose, onSubmit, loading = false }: AddReviewProps) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [selectedItems, setSelectedItems] = useState<ReviewItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [itemsLoading, setItemsLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState<any>(null)

  // Simulate fetching specific order data
  const fetchOrderData = async (orderIdToFetch: string) => {
    setItemsLoading(true)
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    // Mock order data based on orderId
    const mockOrderData = {
      '#1293827237464236': {
        id: '#1293827237464236',
        items: [
          {
            day: 'Wednesday',
            products: [
              { name: 'Sweet Lassi', quantity: 1 },
              { name: 'Chole Bhature', quantity: 1 },
            ],
          },
          {
            day: 'Thursday',
            products: [
              { name: 'Sweet Lassi', quantity: 1 },
              { name: 'Chole Bhature', quantity: 1 },
            ],
          },
          {
            day: 'Friday',
            products: [
              { name: 'Sweet Lassi', quantity: 1 },
              { name: 'Chole Bhature', quantity: 1 },
            ],
          },
        ],
      },
      '#1293827237464237': {
        id: '#1293827237464237',
        items: [
          {
            day: 'Monday',
            products: [
              { name: 'Sweet Lassi', quantity: 1 },
              { name: 'Chole Bhature', quantity: 1 },
            ],
          },
          {
            day: 'Tuesday',
            products: [
              { name: 'Sweet Lassi', quantity: 1 },
              { name: 'Chole Bhature', quantity: 1 },
            ],
          },
        ],
      },
      '#1293827237464238': {
        id: '#1293827237464238',
        items: [
          {
            day: 'Saturday',
            products: [
              { name: 'Sweet Lassi', quantity: 2 },
              { name: 'Chole Bhature', quantity: 1 },
            ],
          },
        ],
      },
    }

    const fetchedOrder = mockOrderData[orderIdToFetch as keyof typeof mockOrderData]
    setOrder(fetchedOrder)

    if (fetchedOrder) {
      // Extract all unique products from the order
      const allProducts: ReviewItem[] = []
      fetchedOrder.items.forEach((dayItem) => {
        dayItem.products.forEach((product) => {
          const existingProduct = allProducts.find((p) => p.name === product.name)
          if (!existingProduct) {
            allProducts.push({
              name: product.name,
              selected: false,
            })
          }
        })
      })
      setSelectedItems(allProducts)
    }

    setItemsLoading(false)
  }

  // Fetch order data when component mounts
  useEffect(() => {
    fetchOrderData(orderId)
  }, [orderId])

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1)
  }

  const handleItemToggle = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.name === itemName ? { ...item, selected: !item.selected } : item))
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) return

    setSubmitting(true)

    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const reviewData = {
      orderId: orderId,
      rating,
      reviewText,
      selectedItems: selectedItems.filter((item) => item.selected).map((item) => item.name),
      timestamp: new Date().toISOString(),
    }

    onSubmit(reviewData)
    setSubmitting(false)
  }

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return 'Poor'
      case 2:
        return 'Fair'
      case 3:
        return 'Good'
      case 4:
        return 'Very Good'
      case 5:
        return 'Excellent'
      default:
        return ''
    }
  }

  const selectedItemsText =
    selectedItems
      .filter((item) => item.selected)
      .map((item) => item.name)
      .join(', ') || 'Select'

  const isSubmitDisabled = rating === 0 || submitting

  return (
    <YStack flex={1} bg="transparent" justify="center" items="center" p="$4">
      <Card width="100%" maxHeight="90vh" bg="white" borderRadius="$4" overflow="hidden" elevate>
        <YStack flex={1}>
          {/* Header */}
          <XStack
            justify="space-between"
            items="center"
            p="$4"
            pb="$3"
            borderBottomWidth={1}
            borderBottomColor="#f0f0f0"
          >
            <Text fontSize="$5" fontWeight="600" color="black">
              Review & Rating
            </Text>
            <Button
              circular
              size="$2.5"
              bg="transparent"
              color="#999"
              onPress={onClose}
              icon={X}
              hoverStyle={{ bg: '#f5f5f5' }}
            />
          </XStack>

          {/* Scrollable Content */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            <YStack px="$4" py="$3" space="$4">
              {/* Rating Question */}
              <YStack space="$3" items="center">
                <Text fontSize="$4" color="#666" textAlign="center">
                  How was your last order from Nik foods?
                </Text>

                {/* Star Rating */}
                <XStack space="$1">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Button
                      key={index}
                      circular
                      size="$3"
                      bg="transparent"
                      onPress={() => handleStarClick(index)}
                      icon={
                        <Star
                          size="$2"
                          color={index < rating ? '#FF9F0D' : '#E0E0E0'}
                          fill={index < rating ? '#FF9F0D' : 'transparent'}
                        />
                      }
                    />
                  ))}
                </XStack>

                {/* Rating Text */}
                {rating > 0 && (
                  <Text fontSize="$5" fontWeight="600" color="#FF9F0D">
                    {getRatingText(rating)}
                  </Text>
                )}
              </YStack>

              {/* Item Selection */}
              <YStack space="$2">
                <Text fontSize="$3" color="#333" fontWeight="500">
                  Select Item
                </Text>

                <Button
                  size="$4"
                  bg="white"
                  borderWidth={1}
                  borderColor="#E0E0E0"
                  color="#666"
                  justifyContent="space-between"
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                  iconAfter={<ChevronDown size="$1" color="#666" />}
                  disabled={itemsLoading}
                >
                  {itemsLoading ? (
                    <XStack items="center" space="$2">
                      <Spinner size="small" color="#FF9F0D" />
                      <Text color="#666">Loading items...</Text>
                    </XStack>
                  ) : (
                    <Text color="#666" numberOfLines={1}>
                      {selectedItemsText}
                    </Text>
                  )}
                </Button>

                {/* Dropdown Items */}
                {dropdownOpen && !itemsLoading && (
                  <YStack
                    bg="white"
                    borderWidth={1}
                    borderColor="#E0E0E0"
                    borderRadius="$2"
                    maxHeight={200}
                  >
                    <ScrollView>
                      {selectedItems.map((item, index) => (
                        <Button
                          key={item.name}
                          size="$3"
                          bg={item.selected ? '#FFF4E4' : 'white'}
                          color={item.selected ? '#FF9F0D' : '#666'}
                          justifyContent="flex-start"
                          borderRadius={0}
                          borderBottomWidth={index < selectedItems.length - 1 ? 1 : 0}
                          borderBottomColor="#f0f0f0"
                          onPress={() => handleItemToggle(item.name)}
                        >
                          <XStack items="center" justify={'center'} space="$2">
                            <Text
                              fontSize="$1"
                              color={item.selected ? '#FF9F0D' : '#E0E0E0'}
                              fontWeight="bold"
                            >
                              {item.selected ? '✓' : <Square size={15} color={'#666'}></Square>}
                            </Text>
                            <Text color={item.selected ? '#FF9F0D' : '#666'}>{item.name}</Text>
                          </XStack>
                        </Button>
                      ))}
                    </ScrollView>
                  </YStack>
                )}

                {/* Selected Items Display */}
                {selectedItems.some((item) => item.selected) && (
                  <XStack flexWrap="wrap" gap="$2">
                    {selectedItems
                      .filter((item) => item.selected)
                      .map((item) => (
                        <XStack
                          key={item.name}
                          bg="#FFF4E4"
                          px="$3"
                          borderRadius="$6"
                          justify="center"
                          style={{ textAlign: 'center' }}
                          items="center"
                        >
                          <Text fontSize="$2" color="#000">
                            {item.name}
                          </Text>
                          <Button
                            circular
                            size="$2"
                            bg="transparent"
                            color="#000"
                            onPress={() => handleItemToggle(item.name)}
                            icon={<X size="$1" />}
                          />
                        </XStack>
                      ))}
                  </XStack>
                )}
              </YStack>

              {/* Review Text Area */}
              {rating > 0 && selectedItems.some((item) => item.selected) && (
                <YStack space="$2">
                  <TextArea
                    placeholder="Share your experience about the food quality, delivery, etc..."
                    value={reviewText}
                    onChangeText={setReviewText}
                    borderColor="#E0E0E0"
                    borderRadius="$2"
                    minHeight={100}
                    fontSize="$3"
                    color="#333"
                  />
                </YStack>
              )}
            </YStack>
          </ScrollView>

          {/* Bottom Button */}
          <YStack p="$4" pt="$2" borderTopWidth={1} borderTopColor="#f0f0f0">
            <Button
              bg={isSubmitDisabled ? '#E0E0E0' : '#FF9F0D'}
              color="white"
              size="$4"
              fontWeight={600}
              hoverStyle={{ bg: isSubmitDisabled ? '#E0E0E0' : '#e8900c' }}
              pressStyle={{ bg: isSubmitDisabled ? '#E0E0E0' : '#e8900c' }}
              onPress={handleSubmit}
              disabled={isSubmitDisabled}
            >
              {submitting ? (
                <XStack items="center" space="$2">
                  <Spinner size="small" color="white" />
                  <Text color="white">Submitting...</Text>
                </XStack>
              ) : (
                'Submit'
              )}
            </Button>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}
