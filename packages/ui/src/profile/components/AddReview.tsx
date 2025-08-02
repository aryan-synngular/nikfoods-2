import React, { useState, useEffect } from 'react'
import { YStack, XStack, Text, Button, ScrollView, Card, TextArea, Spinner } from 'tamagui'
import { X, Star, ChevronDown, Square } from '@tamagui/lucide-icons'
import { apiSubmitReview } from 'app/services/OrderService'
import { useToast } from '@my/ui/src/useToast'

interface AddReviewProps {
  orderId: string
  orderDetails: any // Pass the complete order object from parent
  onClose: () => void
  onSubmit: (reviewData: any) => void
  loading?: boolean
}

interface ReviewItem {
  name: string
  selected: boolean
}

interface ReviewSubmissionResponse {
  success: boolean
  message: string
  error?: string
}

export default function AddReview({
  orderId,
  orderDetails,
  onClose,
  onSubmit,
  loading = false,
}: AddReviewProps) {
  const { showMessage } = useToast()

  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [selectedItems, setSelectedItems] = useState<ReviewItem[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Extract items from the passed order details
  useEffect(() => {
    if (orderDetails?.items) {
      // Extract all unique products from the order
      const allProducts: ReviewItem[] = []
      orderDetails.items.forEach((dayItem: any) => {
        dayItem.products.forEach((product: any) => {
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
  }, [orderDetails])

  const handleStarClick = (starIndex: number) => {
    setRating(starIndex + 1)
  }

  const handleItemToggle = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.map((item) => (item.name === itemName ? { ...item, selected: !item.selected } : item))
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      showMessage('Please select a rating', 'error')
      return
    }

    const selectedItemNames = selectedItems.filter((item) => item.selected).map((item) => item.name)
    if (selectedItemNames.length === 0) {
      showMessage('Please select at least one item to review', 'error')
      return
    }

    if (!reviewText.trim()) {
      showMessage('Please write a review', 'error')
      return
    }

    setSubmitting(true)

    try {
      const reviewData = {
        order: orderDetails?._id || orderId, // Use _id if available, fallback to orderId
        rating,
        reviewText: reviewText.trim(),
        selectedItems: selectedItemNames,
      }

      const response = await apiSubmitReview<ReviewSubmissionResponse>(reviewData)

      if (response.success) {
        // Create the review data to pass back to parent
        const submittedReviewData = {
          orderId: orderId,
          rating,
          reviewText: reviewText.trim(),
          selectedItems: selectedItemNames,
          timestamp: new Date().toISOString(),
        }

        showMessage(response.message || 'Review submitted successfully', 'success')
        onSubmit(submittedReviewData)
      } else {
        throw new Error(response.error || 'Failed to submit review')
      }
    } catch (error: any) {
      console.error('Error submitting review:', error)
      const errorMessage = error?.error || error?.message || 'Failed to submit review'
      showMessage(errorMessage, 'error')
    } finally {
      setSubmitting(false)
    }
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
      .join(', ') || 'Select items to review'

  const isSubmitDisabled =
    rating === 0 || submitting || selectedItems.filter((item) => item.selected).length === 0

  // If no order details provided, show error
  if (!orderDetails || !orderDetails.items) {
    return (
      <YStack flex={1} bg="transparent" justify="center" items="center" p="$4">
        <Card width="100%" maxHeight="90vh" bg="white" borderRadius="$4" overflow="hidden" elevate>
          <YStack flex={1} justify="center" items="center" p="$6" space="$4">
            <Text fontSize="$4" color="red" textAlign="center">
              Order details not available
            </Text>
            <Button
              bg="white"
              color="#666"
              borderColor="#E0E0E0"
              borderWidth={1}
              size="$4"
              onPress={onClose}
            >
              Close
            </Button>
          </YStack>
        </Card>
      </YStack>
    )
  }

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
                  Select Items to Review
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
                >
                  <Text color="#666" numberOfLines={1}>
                    {selectedItemsText}
                  </Text>
                </Button>

                {/* Dropdown Items */}
                {dropdownOpen && selectedItems.length > 0 && (
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
                          py="$1"
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
                  <Text fontSize="$3" color="#333" fontWeight="500">
                    Write your review
                  </Text>
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
                'Submit Review'
              )}
            </Button>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}
