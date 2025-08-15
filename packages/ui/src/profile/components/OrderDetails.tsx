import React from 'react'
import { format, parseISO } from 'date-fns'
import { YStack, XStack, Text, Button, ScrollView, Circle, Card, Separator, Square } from 'tamagui'
import { X, MapPin } from '@tamagui/lucide-icons'
import { OrderDetailsSkeleton } from '../../loaders/OrdersSectionLoader'
import { IAddress } from 'app/types/user'
interface OrderDetailsProps {
  order: {
    id: string
    date: string
    items: {
      day: string
      deliveryDate: string
      products: {
        name: string
        quantity: number
        price?: number
      }[]
      dayTotal: string
    }[]
    totalPaid: string
    status: string
    restaurant?: {
      name: string
      location: string
    }
    deliveryAddress?: IAddress
    paymentMethod?: string
    platformFee?: string
    deliveryFee?: string
    discount?: {
      amount: string
      code: string
    }
    taxes?: string
  }
  onClose: () => void
  loading?: boolean
}

export default function OrderDetails({ order, onClose, loading = false }: OrderDetailsProps) {
  console.log('Order Details:', order)
  const calculateItemTotal = () => {
    if (!order?.items) return 0
    return order.items.reduce((sum, item) => {
      const total = parseFloat(item?.dayTotal?.replace('$', '') || '0')
      return sum + total
    }, 0)
  }

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`
  }

  const parsePrice = (priceString: string) => {
    return parseFloat(priceString?.replace('$', '') || '0')
  }

  const getDeliveryStatusColor = (deliveryDate: string) => {
    if (deliveryDate.includes('✓')) return '#4CAF50'
    if (deliveryDate.includes('Same day')) return '#FF9F0D'
    if (deliveryDate.includes('Delivery on')) return '#F55344'
    return '#4CAF50'
  }

  const formatDeliveryDate = (dateString: string) => {
    try {
      // First try to parse as ISO format
      const date = parseISO(dateString)
      return `Delivery on ${format(date, 'MMM d, yyyy')}`
    } catch (e) {
      try {
        // Fallback to regular Date parsing if ISO fails
        const date = new Date(dateString)
        return `Delivery on ${format(date, 'MMM d, yyyy')}`
      } catch (e) {
        console.error('Error formatting date:', e)
        return dateString // return original if both parsing attempts fail
      }
    }
  }

  const formatOrderDate = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'MMM d, yyyy, h:mm a') // "Aug 2, 2025, 3:30 PM"
    } catch {
      return dateString
    }
  }

  const formatDayName = (dateString: string) => {
    try {
      const date = parseISO(dateString)
      return format(date, 'EEEE') // "Monday", "Tuesday", etc.
    } catch {
      return null
    }
  }

  // Calculate bill breakdown
  const itemTotal = calculateItemTotal()
  const platformFee = parsePrice(order?.platformFee || '$1.00')
  const deliveryFee = parsePrice(order?.deliveryFee || '$10.00')
  const discountAmount = parsePrice(order?.discount?.amount || '$0.00')
  const taxes = parsePrice(order?.taxes || '$0.00')
  const billTotal = parsePrice(order?.totalPaid || '$0.00')

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
            {loading ? (
              <Text fontSize="$5" fontWeight="600" color="transparent">
                Loading...
              </Text>
            ) : (
              <Text fontSize="$5" fontWeight="600" color="black">
                Order {order?.id || 'N/A'}
              </Text>
            )}
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
            {loading ? (
              <OrderDetailsSkeleton />
            ) : (
              <YStack px="$4" py="$2">
                {/* Store and Address Info */}
                <YStack space="$3" mb="$4">
                  <XStack items="center" space="$2">
                    <MapPin size="$1" color="#999" />
                    <YStack>
                      <Text fontWeight="600" fontSize="$3" color="black">
                        {order?.restaurant?.name || 'Restaurant'}
                      </Text>
                      <Text fontSize="$2" color="#999">
                        {order?.restaurant?.location || 'Location not specified'}
                      </Text>
                    </YStack>
                  </XStack>

                  <XStack items="center" space="$2">
                    <MapPin size="$1" color="#999" />
                    <YStack flex={1}>
                      <Text fontWeight="600" fontSize="$3" color="black">
                        Delivery Address
                      </Text>
                      <Text fontSize="$2" color="#999" numberOfLines={2}>
                        {order?.deliveryAddress
                          ? `${order.deliveryAddress?.street_address}, ${order?.deliveryAddress?.city}`:"Not specified"}
                      </Text>
                    </YStack>
                  </XStack>
                </YStack>

                {/* Order Items */}
                <YStack space="$4" mb="$4">
                  {order?.items?.map((dayItem, dayIndex) => (
                    <YStack key={`${dayItem.day}-${dayIndex}`} space="$2">
                      {/* Day Header */}
                      <XStack justify="space-between" items="center" mb="$2">
                        <Text fontWeight="600" fontSize="$3" color="black">
                          {formatDayName(dayItem?.deliveryDate) || dayItem?.day || 'Unknown'}'s Item
                        </Text>
                        <Text
                          fontSize="$2"
                          color={getDeliveryStatusColor(dayItem?.deliveryDate || '')}
                          fontWeight="500"
                        >
                          {formatDeliveryDate(dayItem?.deliveryDate || '')}
                        </Text>
                      </XStack>

                      {/* Products */}
                      {dayItem?.products?.map((product, productIndex) => (
                        <XStack
                          key={`${product.name}-${productIndex}`}
                          justify="space-between"
                          items="center"
                          py="$1"
                        >
                          <XStack items="center" space="$2" flex={1}>
                            <Square
                              height={20}
                              width={20}
                              borderWidth={2}
                              borderColor="#008000"
                              justify="center"
                              items="center"
                            >
                              <Circle p={2} height={12} width={12} bg="#008000" />
                            </Square>
                            <Text fontSize="$3" color="black" flex={1}>
                              {product?.quantity || 0} X {product?.name || 'Unknown Item'}
                            </Text>
                          </XStack>
                          <Text fontSize="$3" color="black" fontWeight="500">
                            {formatPrice((product?.price || 0) * (product?.quantity || 0))}
                          </Text>
                        </XStack>
                      )) || null}

                      {/* Day Total */}
                      <XStack justify="space-between" items="center" py="$1" mt="$1">
                        <Text fontSize="$3" color="#666" fontWeight="500">
                          Day Total
                        </Text>
                        <Text fontSize="$3" color="#666" fontWeight="500">
                          {dayItem?.dayTotal || '0.00'}
                        </Text>
                      </XStack>
                    </YStack>
                  )) || null}
                </YStack>

                {/* Totals Section */}
                <YStack space="$2" mb="$2">
                  <Separator borderColor="#f0f0f0" />
                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$4" fontWeight="700" color="black">
                      ITEM TOTAL
                    </Text>
                    <Text fontSize="$4" fontWeight="700" color="black">
                      {formatPrice(itemTotal)}
                    </Text>
                  </XStack>

                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$3" color="#666">
                      Platform Fee
                    </Text>
                    <Text fontSize="$3" color="#666">
                      {order?.platformFee || '$1.00'}
                    </Text>
                  </XStack>

                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$3" color="#666">
                      Delivery partner fee
                    </Text>
                    <Text fontSize="$3" color="#666">
                      {order?.deliveryFee || '$10.00'}
                    </Text>
                  </XStack>

                  {discountAmount > 0 && (
                    <XStack justify="space-between" items="center" py="$1">
                      <Text fontSize="$3" color="#4CAF50" fontWeight="500">
                        Discount Applied {order?.discount?.code ? `(${order.discount.code})` : ''}
                      </Text>
                      <Text fontSize="$3" color="#4CAF50" fontWeight="500">
                        -{order?.discount?.amount || '$0.00'}
                      </Text>
                    </XStack>
                  )}

                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$3" color="#666">
                      Taxes
                    </Text>
                    <Text fontSize="$3" color="#666">
                      {order?.taxes || '$0.00'}
                    </Text>
                  </XStack>
                </YStack>

                {/* Bill Total */}
                <YStack mb="$4">
                  <Separator borderColor="#f0f0f0" />
                  <XStack justify="space-between" items="center" py="$3">
                    <Text fontSize="$5" fontWeight="700" color="black">
                       Total
                    </Text>
                    <Text fontSize="$5" fontWeight="700" color="black">
                      {order?.totalPaid || '$0.00'}
                    </Text>
                  </XStack>
                  <Text fontSize="$2" color="#666" style={{ textAlign: 'right' }}>
                    Paid via {order?.paymentMethod || 'Credit Card'}
                  </Text>
                </YStack>
              </YStack>
            )}
          </ScrollView>

          {/* Bottom Button - Fixed */}
          <YStack p="$4" pt="$2" borderTopWidth={1} borderTopColor="#f0f0f0">
            <Button
              bg="#FF9F0D"
              color="white"
              size="$4"
              fontWeight={600}
              hoverStyle={{ bg: '#e8900c' }}
              pressStyle={{ bg: '#e8900c' }}
              onPress={onClose}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Got it'}
            </Button>
          </YStack>
        </YStack>
      </Card>
    </YStack>
  )
}
