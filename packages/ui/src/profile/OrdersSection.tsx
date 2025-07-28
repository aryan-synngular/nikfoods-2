import React, { useState, useEffect } from 'react'
import { YStack, XStack, Text, Button, ScrollView, Circle, Square, Dialog } from 'tamagui'
import OrderDetails from './OrderDetails'
import { OrderCardSkeleton } from '../loaders/OrdersSectionLoader'

const dummyOrders = [
  {
    id: '#1293827237464236',
    date: '26 May, 2025, 02:00 PM',
    items: [
      {
        day: 'Wednesday',
        deliveryDate: 'Delivery on Thursday',
        products: [
          { name: 'Sweet Lassi', quantity: 1 },
          { name: 'Chole Bhature', quantity: 1 },
        ],
        dayTotal: '$64',
      },
      {
        day: 'Thursday',
        deliveryDate: 'Same day delivery',
        products: [
          { name: 'Sweet Lassi', quantity: 1 },
          { name: 'Chole Bhature', quantity: 1 },
        ],
        dayTotal: '$64',
      },
      {
        day: 'Friday',
        deliveryDate: '✓ Delivered on same day',
        products: [
          { name: 'Sweet Lassi', quantity: 1 },
          { name: 'Chole Bhature', quantity: 1 },
        ],
        dayTotal: '$64',
      },
    ],
    totalPaid: '$500.00',
    status: 'active',
  },
  {
    id: '#1293827237464237',
    date: '24 May, 2025, 01:30 PM',
    items: [
      {
        day: 'Monday',
        deliveryDate: '✓ Delivered on same day',
        products: [
          { name: 'Sweet Lassi', quantity: 1 },
          { name: 'Chole Bhature', quantity: 1 },
        ],
        dayTotal: '$64',
      },
      {
        day: 'Tuesday',
        deliveryDate: '✓ Delivered on same day',
        products: [
          { name: 'Sweet Lassi', quantity: 1 },
          { name: 'Chole Bhature', quantity: 1 },
        ],
        dayTotal: '$64',
      },
    ],
    totalPaid: '$128.00',
    status: 'delivered',
  },
  {
    id: '#1293827237464238',
    date: '22 May, 2025, 12:00 PM',
    items: [
      {
        day: 'Saturday',
        deliveryDate: '✓ Delivered on same day',
        products: [
          { name: 'Sweet Lassi', quantity: 2 },
          { name: 'Chole Bhature', quantity: 1 },
        ],
        dayTotal: '$96',
      },
    ],
    totalPaid: '$96.00',
    status: 'delivered',
  },
]

export default function OrdersSection() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Simulate loading orders
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setOrders(dummyOrders)
      setLoading(false)
    }

    loadOrders()
  }, [])

  const handleShowDetails = async (order: any) => {
    setSelectedOrder(order)
    setDetailsDialogOpen(true)
    setDetailsLoading(true)

    // Simulate loading order details
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setDetailsLoading(false)
  }

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false)
    setSelectedOrder(null)
    setDetailsLoading(false)
  }

  const getDeliveryStatusColor = (deliveryDate: string, orderStatus: string) => {
    if (deliveryDate.includes('✓')) {
      return { color: '#0A9750', bg: '#F0FAF5' }
    }
    if (deliveryDate.includes('Same day')) {
      return { color: '#0A9750', bg: '#F0FAF5' }
    }
    if (deliveryDate.includes('Delivery on')) {
      return { color: '#F55344', bg: '#FFF4E4' }
    }
    return {
      color: orderStatus === 'delivered' ? '#0A9750' : '#F55344',
      bg: orderStatus === 'delivered' ? '#F0FAF5' : '#FFF4E4',
    }
  }

  return (
    <YStack>
      <ScrollView>
        <YStack p="$4" gap="$4" bg="#F9F9F9">
          {loading ? (
            // Show skeleton loaders while loading
            <>
              {[1, 2, 3].map((index) => (
                <OrderCardSkeleton key={index} />
              ))}
            </>
          ) : (
            // Show actual orders
            orders.map((order, orderIndex) => (
              <YStack
                key={`${order.id}-${orderIndex}`}
                style={{ borderRadius: 12 }}
                bg="white"
                p="$4"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.1}
                shadowRadius={8}
                elevation={3}
              >
                <XStack mb="$3" justify="space-between">
                  <YStack>
                    <Text fontSize={18} fontWeight="700" color="#1A1A1A">
                      Order ID {order.id}
                    </Text>
                    <Text fontSize={14} fontWeight="600" color="#4D4D4D" mt="$1">
                      {order.date}
                    </Text>
                  </YStack>
                  {order.status === 'active' && (
                    <XStack gap="$2">
                      <Button
                        size="$3"
                        bg="white"
                        color="#FF9F0D"
                        borderColor="#FF9F0D"
                        variant="outlined"
                        fontSize={16}
                      >
                        Update Item
                      </Button>
                    </XStack>
                  )}
                </XStack>

                <YStack gap={16}>
                  {order.items.map((dayItem: any, dayIndex: number) => {
                    const statusColors = getDeliveryStatusColor(dayItem.deliveryDate, order.status)
                    return (
                      <YStack
                        key={`${dayItem.day}-${dayIndex}`}
                        pt="$3"
                        gap="$1"
                        borderTopWidth={1}
                        borderTopColor="#E0E0E0"
                      >
                        <XStack gap="$2" justify="space-between">
                          <Text fontSize={14} fontWeight="500" color="#2A2A2A" mb="$2">
                            {dayItem.day}'s Item
                          </Text>
                          <Text
                            fontSize={14}
                            lineHeight={21}
                            pl={5}
                            pr={5}
                            style={{
                              color: statusColors.color,
                              backgroundColor: statusColors.bg,
                            }}
                          >
                            {dayItem.deliveryDate}
                          </Text>
                        </XStack>

                        <XStack>
                          <XStack gap="$2" flex={1}>
                            {dayItem.products.map((product: any, productIndex: number) => (
                              <XStack key={`${product.name}-${productIndex}`} gap={5}>
                                <XStack gap="$2" px="$2" justify="center" items="center">
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
                                  <Text fontSize="$2" color="gray">
                                    {product.quantity} X {product.name}
                                  </Text>
                                </XStack>
                              </XStack>
                            ))}
                          </XStack>

                          <YStack gap="$2" pt={4}>
                            <Text fontSize={14} color="#777679">
                              Day total:{' '}
                              <Text fontSize={14} fontWeight="600" color="#2A2A2A">
                                {dayItem.dayTotal}
                              </Text>
                            </Text>
                          </YStack>
                        </XStack>
                      </YStack>
                    )
                  })}
                </YStack>

                <YStack mt="$4" pt="$3" borderTopWidth={1} borderTopColor="#E0E0E0">
                  <XStack justify="flex-end">
                    <Text fontSize={14} color="#777679">
                      Total Paid:{' '}
                      <Text fontSize={14} fontWeight="600" color="#2A2A2A">
                        {order.totalPaid}
                      </Text>
                    </Text>
                  </XStack>
                  <XStack gap="$3" pt="$3" justify="space-between">
                    <XStack gap={10}>
                      {order.status === 'active' ? (
                        <>
                          <Button
                            bg="#FF9F0D"
                            color="white"
                            size="$3"
                            fontWeight="500"
                            hoverStyle={{ background: '#FF9F0D' }}
                          >
                            Track Order
                          </Button>
                          <Button
                            borderWidth={1}
                            borderColor="#FF9F0D"
                            bg="white"
                            color="#FF9F0D"
                            size="$3"
                            fontWeight="500"
                            onPress={() => handleShowDetails(order)}
                          >
                            Details
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            bg="#FF9F0D"
                            color="white"
                            size="$3"
                            fontWeight="500"
                            hoverStyle={{ background: '#FF9F0D' }}
                          >
                            Reorder
                          </Button>
                          <Button
                            borderWidth={1}
                            borderColor="#FF9F0D"
                            bg="white"
                            color="#FF9F0D"
                            size="$3"
                            fontWeight="500"
                            onPress={() => handleShowDetails(order)}
                          >
                            Details
                          </Button>
                        </>
                      )}
                    </XStack>
                    <YStack>
                      <Button
                        borderWidth={1}
                        borderColor="#FF9F0D"
                        bg="white"
                        color="#FF9F0D"
                        size="$3"
                        fontWeight="500"
                      >
                        Add Review
                      </Button>
                    </YStack>
                  </XStack>
                </YStack>
              </YStack>
            ))
          )}
        </YStack>
      </ScrollView>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: '#fff',
              padding: 0,
              width: 400,
              maxWidth: '100vw',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {selectedOrder && (
              <OrderDetails
                order={selectedOrder}
                onClose={handleCloseDetails}
                loading={detailsLoading}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  )
}
