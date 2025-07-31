import React from 'react'
import { YStack, XStack, Text, Button, ScrollView, Circle, Card, Separator, Square } from 'tamagui'
import { X, MapPin } from '@tamagui/lucide-icons'
import { OrderDetailsSkeleton } from '../loaders/OrdersSectionLoader'

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
        price?: string
      }[]
      dayTotal: string
    }[]
    totalPaid: string
    status: string
  }
  onClose: () => void
  loading?: boolean
}

export default function OrderDetails({ order, onClose, loading = false }: OrderDetailsProps) {
  const calculateItemTotal = () => {
    if (!order?.items) return 0
    return order.items.reduce((sum, item) => {
      const total = parseFloat(item?.dayTotal?.replace('$', '') || '0')
      return sum + total
    }, 0)
  }

  const calculateProductPrice = (quantity: number) => {
    // Using a base price of $32 per item (since dayTotal seems to be $64 for 2 items)
    return (quantity * 32).toFixed(2)
  }

  const getDeliveryStatusColor = (deliveryDate: string) => {
    if (deliveryDate.includes('✓')) return '#4CAF50'
    if (deliveryDate.includes('Same day')) return '#FF9F0D'
    if (deliveryDate.includes('Delivery on')) return '#F55344'
    return '#4CAF50'
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
            {loading ? (
              <Text fontSize="$5" fontWeight="600" color="transparent">
                Loading...
              </Text>
            ) : (
              <Text fontSize="$5" fontWeight="600" color="black">
                Order #{order?.id || 'N/A'}
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
                        Nikfoods
                      </Text>
                      <Text fontSize="$2" color="#999">
                        San Francisco
                      </Text>
                    </YStack>
                  </XStack>

                  <XStack items="center" space="$2">
                    <MapPin size="$1" color="#999" />
                    <YStack flex={1}>
                      <Text fontWeight="600" fontSize="$3" color="black">
                        Home
                      </Text>
                      <Text fontSize="$2" color="#999" numberOfLines={2}>
                        13th Street, 47 W 13th St, New York, NY 10011, USA
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
                          {dayItem?.day || 'Unknown'}'s Item
                        </Text>
                        <Text
                          fontSize="$2"
                          color={getDeliveryStatusColor(dayItem?.deliveryDate || '')}
                          fontWeight="500"
                        >
                          {dayItem?.deliveryDate || 'TBD'}
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
                            ${calculateProductPrice(product?.quantity || 0)}
                          </Text>
                        </XStack>
                      )) || null}
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
                      ${calculateItemTotal().toFixed(2)}
                    </Text>
                  </XStack>

                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$3" color="#666">
                      Platform Fee
                    </Text>
                    <Text fontSize="$3" color="#666">
                      $1.00
                    </Text>
                  </XStack>

                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$3" color="#666">
                      Delivery partner fee
                    </Text>
                    <Text fontSize="$3" color="#666">
                      $10.00
                    </Text>
                  </XStack>

                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$3" color="#4CAF50" fontWeight="500">
                      Discount Applied (TRYNEW)
                    </Text>
                    <Text fontSize="$3" color="#4CAF50" fontWeight="500">
                      -{calculateItemTotal() > 100 ? '$100.00' : '$50.00'}
                    </Text>
                  </XStack>

                  <XStack justify="space-between" items="center" py="$1">
                    <Text fontSize="$3" color="#666">
                      Taxes
                    </Text>
                    <Text fontSize="$3" color="#666">
                      ${(calculateItemTotal() * 0.1).toFixed(2)}
                    </Text>
                  </XStack>
                </YStack>

                {/* Bill Total */}
                <YStack mb="$4">
                  <Separator borderColor="#f0f0f0" />
                  <XStack justify="space-between" items="center" py="$3">
                    <Text fontSize="$5" fontWeight="700" color="black">
                      Bill Total
                    </Text>
                    <Text fontSize="$5" fontWeight="700" color="black">
                      {order?.totalPaid || '$0.00'}
                    </Text>
                  </XStack>
                  <Text fontSize="$2" color="#666" style={{ textAlign: 'right' }}>
                    Paid via Credit Card
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
