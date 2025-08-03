import React, { useState, useEffect } from 'react'
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Circle,
  Check,
  View,
  Square,
  Dialog,
} from 'tamagui'
import OrderDetails from './components/OrderDetails'
import { OrderCardSkeleton } from '../loaders/OrdersSectionLoader'
import AddReview from './components/AddReview'
import TrackOrder from './components/TrackOrder'
import UpdateItem from './components/UpdateItem'
import { useToast } from '@my/ui/src/useToast'
import { apiGetOrders, apiUpdateOrderItems } from 'app/services/OrderService'

export default function OrdersSection() {
  const { showMessage } = useToast()

  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedOrderIdForReview, setSelectedOrderIdForReview] = useState<string | null>(null)

  const [trackOrderDialogOpen, setTrackOrderDialogOpen] = useState(false)
  const [selectedOrderIdForTracking, setSelectedOrderIdForTracking] = useState<string | null>(null)

  const [updateItemDialogOpen, setUpdateItemDialogOpen] = useState(false)
  const [selectedOrderIdForUpdate, setSelectedOrderIdForUpdate] = useState<string | null>(null)

  const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null)

  // Error state
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiGetOrders<{
          data: {
            items: any[]
            page: number
            pageSize: number
            total: number
            totalPages: number
          }
          message: string
        }>()

        if (response?.data?.items) {
          setOrders(response.data.items)
          setPagination({
            page: response.data.page,
            pageSize: response.data.pageSize,
            total: response.data.total,
            totalPages: response.data.totalPages,
          })
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error('Failed to load orders:', error)
        setError('Failed to load orders. Please try again.')
        showMessage('Failed to load orders', 'error')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [])

  const handleShowDetails = async (order: any) => {
    setSelectedOrder(order)
    setDetailsDialogOpen(true)
    setDetailsLoading(true)

    // Simulate loading order details (you can enhance this to fetch more detailed data)
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

  // Track order
  const handleTrackOrder = (orderId: string) => {
    setSelectedOrderIdForTracking(orderId)
    setTrackOrderDialogOpen(true)
  }

  const handleCloseTrackOrder = () => {
    setTrackOrderDialogOpen(false)
    setSelectedOrderIdForTracking(null)
  }

  // review section
  const handleAddReview = (orderId: string) => {
    // Find the complete order object
    const orderToReview = orders.find((order) => order.id === orderId)
    if (orderToReview) {
      setSelectedOrderForReview(orderToReview)
      setSelectedOrderIdForReview(orderId)
      setReviewDialogOpen(true)
    } else {
      showMessage('Order details not found', 'error')
    }
  }

  const handleReviewSubmit = (reviewData: any) => {
    // Update the specific order's review status
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === reviewData.orderId
          ? {
              ...order,
              hasReview: true,
              reviewData: reviewData,
            }
          : order
      )
    )

    // Close the dialog
    setReviewDialogOpen(false)
    setSelectedOrderIdForReview(null)

    // Show success message
    console.log('Review submitted successfully:', reviewData)
    showMessage('Review submitted successfully', 'success')
  }

  const handleCloseReview = () => {
    setReviewDialogOpen(false)
    setSelectedOrderIdForReview(null)
    setSelectedOrderForReview(null)
  }
  // Update item handlers
  const handleUpdateItem = (orderId: string) => {
    setSelectedOrderIdForUpdate(orderId)
    setUpdateItemDialogOpen(true)
  }

  const handleCloseUpdateItem = () => {
    setUpdateItemDialogOpen(false)
    setSelectedOrderIdForUpdate(null)
  }

  // Updated handleItemUpdate function for OrdersSection.tsx

  const handleItemUpdate = async (orderId: string, updatedItems: any) => {
    try {
      // Show loading state
      // showMessage('Updating order items...', 'info')

      const order = orders.find((o) => o.id === orderId)

      // Try different ID formats
      let actualOrderId = orderId
      if (order?._id) {
        actualOrderId = order._id
      } else if (orderId.startsWith('#')) {
        // If orderId starts with #, try both with and without #
        actualOrderId = orderId
      }

      console.log('Order details:', {
        orderId,
        actualOrderId,
        orderObject: order,
        updatedItems,
      })

      // Call the API to update order items
      const response = await apiUpdateOrderItems<{
        success: boolean
        message: string
        updatedTotal: number
        orderItems?: any[]
        details?: string
      }>(actualOrderId, updatedItems)

      console.log('API Response:', response)

      if (response.success) {
        // Update the local state with the new items and total
        setOrders((prevOrders) =>
          prevOrders.map((order) => {
            if (order.id !== orderId) return order

            // If backend returns updated items, use them; otherwise, merge locally
            let updatedOrderItems

            if (response.orderItems) {
              // Use items from backend response
              updatedOrderItems = response.orderItems.map((dayItem: any) => ({
                day: dayItem.day,
                deliveryDate: dayItem.deliveryDate,
                products: dayItem.items.map((item: any) => ({
                  name: item.name || 'Unknown Item',
                  quantity: item.quantity,
                  price: item.price,
                })),
                dayTotal: `$${dayItem.dayTotal.toFixed(2)}`,
              }))
            } else {
              // Fallback to local merging
              updatedOrderItems = [...order.items]

              // Process each day's new items
              Object.entries(updatedItems).forEach(([day, newProducts]: [string, any]) => {
                const existingDayIndex = updatedOrderItems.findIndex((item) => item.day === day)

                if (existingDayIndex >= 0) {
                  // Merge with existing day
                  const existingDayItem = updatedOrderItems[existingDayIndex]
                  const mergedProducts = [...existingDayItem.products, ...newProducts]

                  const newTotal = mergedProducts.reduce((sum, product) => {
                    return sum + (product.price || 0) * product.quantity
                  }, 0)

                  updatedOrderItems[existingDayIndex] = {
                    ...existingDayItem,
                    products: mergedProducts,
                    dayTotal: `$${newTotal.toFixed(2)}`,
                  }
                } else {
                  // Create new day item
                  const dayTotal = newProducts.reduce((sum: number, product: any) => {
                    return sum + (product.price || 0) * product.quantity
                  }, 0)

                  updatedOrderItems.push({
                    day: day,
                    deliveryDate: new Date().toISOString().split('T')[0],
                    products: newProducts,
                    dayTotal: `$${dayTotal.toFixed(2)}`,
                  })
                }
              })
            }

            return {
              ...order,
              items: updatedOrderItems,
              totalPaid: `$${response.updatedTotal.toFixed(2)}`,
            }
          })
        )

        setUpdateItemDialogOpen(false)
        setSelectedOrderIdForUpdate(null)
        showMessage(response.message || 'Items updated successfully', 'success')
      } else {
        throw new Error(response.details || response.message || 'Failed to update items')
      }
    } catch (error: any) {
      console.error('Failed to update order items:', error)

      // Extract error message from different possible structures
      let errorMessage = 'Failed to update items. Please try again.'

      if (error?.details) {
        errorMessage = error.details
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      showMessage(errorMessage, 'error')
    }
  }

  // Retry loading orders
  const handleRetry = () => {
    window.location.reload()
  }

  // Render error state
  if (error && !loading) {
    return (
      <YStack flex={1} justify="center" items="center" p="$4" gap="$4">
        <Text fontSize="$4" color="red" textAlign="center">
          {error}
        </Text>
        <Button bg="#FF9F0D" color="white" size="$4" onPress={handleRetry}>
          Retry
        </Button>
      </YStack>
    )
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
          ) : orders.length === 0 ? (
            // Show empty state
            <YStack flex={1} justify="center" items="center" p="$8" gap="$4">
              <Text fontSize="$5" fontWeight="600" color="#666" textAlign="center">
                No orders found
              </Text>
              <Text fontSize="$3" color="#999" textAlign="center">
                You haven't placed any orders yet. Start exploring our menu!
              </Text>
            </YStack>
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
                      Order ID : {order?.id}
                    </Text>
                    <Text fontSize={14} fontWeight="600" color="#4D4D4D" mt="$1">
                      {order.date}
                    </Text>
                  </YStack>
                  {order.status === 'delivered' ? (
                    <View
                      bg="#e6f3e6"
                      p="$2"
                      borderRadius="$2"
                      flexDirection="row"
                      alignItems="center"
                      gap="$2"
                    >
                      <Text color="green" fontSize="$3" fontWeight="500">
                        Delivered on {order.date}
                      </Text>
                    </View>
                  ) : order.status === 'cancelled' ? (
                    <View
                      bg="#feeeed"
                      p="$2"
                      borderRadius="$2"
                      flexDirection="row"
                      alignItems="center"
                      gap="$2"
                    >
                      <Text color="red" fontSize="$3" fontWeight="500">
                        Cancelled on {order.date}
                      </Text>
                    </View>
                  ) : (
                    <XStack gap="$2">
                      <Button
                        size="$3"
                        bg="white"
                        color="#FF9F0D"
                        borderColor="#FF9F0D"
                        variant="outlined"
                        fontSize={16}
                        onPress={() => handleUpdateItem(order.id)}
                      >
                        Update Item
                      </Button>
                    </XStack>
                  )}
                </XStack>

                <YStack gap={16}>
                  {order?.items?.map((dayItem: any, dayIndex: number) => {
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
                            onPress={() => handleTrackOrder(order.id)}
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
                      {!order.hasReview && order.status === 'delivered' && (
                        <Button
                          borderWidth={1}
                          borderColor="#FF9F0D"
                          bg="white"
                          color="#FF9F0D"
                          size="$3"
                          fontWeight="500"
                          onPress={() => handleAddReview(order.id)}
                        >
                          Add Review
                        </Button>
                      )}
                    </YStack>
                  </XStack>
                </YStack>
              </YStack>
            ))
          )}

          {/* Pagination */}
          {!loading && orders.length > 0 && pagination.totalPages > 1 && (
            <YStack items="center" pt="$4">
              <XStack gap="$2" items="center">
                <Button
                  size="$3"
                  bg="white"
                  color="#FF9F0D"
                  borderColor="#FF9F0D"
                  variant="outlined"
                  disabled={pagination.page <= 1}
                  onPress={() => {
                    // Handle previous page
                    console.log('Previous page')
                  }}
                >
                  Previous
                </Button>

                <Text fontSize="$3" color="#666" px="$3">
                  Page {pagination.page} of {pagination.totalPages}
                </Text>

                <Button
                  size="$3"
                  bg="white"
                  color="#FF9F0D"
                  borderColor="#FF9F0D"
                  variant="outlined"
                  disabled={pagination.page >= pagination.totalPages}
                  onPress={() => {
                    // Handle next page
                    console.log('Next page')
                  }}
                >
                  Next
                </Button>
              </XStack>

              <Text fontSize="$2" color="#999" pt="$2">
                Showing {orders.length} of {pagination.total} orders
              </Text>
            </YStack>
          )}
        </YStack>
      </ScrollView>

      {/* Order Details Dialog */}
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

      {/* Add Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: 'transparent',
              padding: 0,
              width: 400,
              maxWidth: '100vw',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {selectedOrderIdForReview && selectedOrderForReview && (
              <AddReview
                orderId={selectedOrderIdForReview}
                orderDetails={selectedOrderForReview} // Pass the complete order object
                onClose={handleCloseReview}
                onSubmit={handleReviewSubmit}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* Track Order Dialog */}
      <Dialog open={trackOrderDialogOpen} onOpenChange={setTrackOrderDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: 'transparent',
              padding: 0,
              width: '90vw',
              minWidth: 1000,
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {selectedOrderIdForTracking && (
              <TrackOrder orderId={selectedOrderIdForTracking} onClose={handleCloseTrackOrder} />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* Update Item Dialog */}
      <Dialog open={updateItemDialogOpen} onOpenChange={setUpdateItemDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: 'transparent',
              padding: 0,
              width: 'auto',
              maxWidth: '100vw',
              maxHeight: '90vh',
              overflow: 'hidden',
            }}
          >
            {selectedOrderIdForUpdate && (
              <UpdateItem
                orderId={selectedOrderIdForUpdate}
                onClose={handleCloseUpdateItem}
                onUpdate={handleItemUpdate}
              />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </YStack>
  )
}
