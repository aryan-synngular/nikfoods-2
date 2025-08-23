'use client'

import { useEffect, useState } from 'react'
import { apiGetOrderById } from 'app/services/OrderService'
import { CheckCircle, MapPin, Calendar, CreditCard, Package } from '@tamagui/lucide-icons'
import { View, Text, YStack, XStack, Button, ScrollView } from 'tamagui'
import { useLink } from "solito/navigation"
import { useStore } from 'app/src/store/useStore'
import { useScreen } from 'app/hook/useScreen'

interface OrderItem {
  food: {
    _id: string
    name: string
    price: number
    description?: string
  }
  quantity: number
  price: number
}

interface OrderDay {
  day: string
  deliveryDate: string
  items: OrderItem[]
  dayTotal: number
}

interface OrderAddress {
  name: string
  email: string
  phone: string
  street_address: string
  city: string
  province: string
  postal_code: string
  location_remark?: string
}

interface Order {
  orderId: string
  _id: string
  address: OrderAddress
  items: OrderDay[]
  totalPaid: number
  currency: string
  status: string
  paymentStatus: string
  paymentMethod: string
  platformFee: number
  deliveryFee: number
  discount: {
    amount: number
    code?: string
  }
  taxes: number
  createdAt: string
}

export function CheckoutSuccessPage() {
  const { isMobile, isMobileWeb } = useScreen()
  const homeLink = useLink({ href: "/" })
  const accountLink = useLink({ href: "/account" })
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { setSuccessOrderId, successOrderId } = useStore()

  useEffect(() => {
    if (!successOrderId) {
      setError('No order ID provided')
      setLoading(false)
      return
    }
    const fetchOrder = async () => {
      try {
        const response: any = await apiGetOrderById(successOrderId)
        if (response?.success && response?.data) {
          setOrder(response.data)
        } else {
          setError('Failed to fetch order details')
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to fetch order details')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [successOrderId])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

  if (loading) {
    return (
      <View flex={1} p="$4">
        <Text fontSize={isMobile || isMobileWeb ? "$5" : "$6"} color="#FF6B00">
          Loading order details...
        </Text>
      </View>
    )
  }

  if (error || !order) {
    return (
      <View flex={1} p="$4">
        <Text fontSize={isMobile || isMobileWeb ? "$5" : "$6"} color="#dc3545">
          {error || 'Order not found'}
        </Text>
        <Button
          mt="$4"
          onPress={() => { homeLink.onPress() }}
          style={{ backgroundColor: '#FF6B00' }}
          color="white"
          size={isMobile || isMobileWeb ? "$3" : "$4"}
        >
          Go to Home
        </Button>
      </View>
    )
  }

  return (
    <ScrollView>
    <View flex={1} pt={16} p={isMobile || isMobileWeb ? "$3" : "$4"} style={{ backgroundColor: '#f5f5f5' }}>
      <View
        style={{
          maxWidth: 800,
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: 12,
          padding: isMobile || isMobileWeb ? 12 : 16,
          marginTop: isMobile || isMobileWeb ? 36 : 0,
        }}
      >
        <YStack alignItems="center" mb="$6">
          <CheckCircle size={isMobile || isMobileWeb ? 36 : 64} color="#28a745" />
          <Text fontSize={isMobile || isMobileWeb ? "$6" : "$8"} fontWeight="bold" color="#28a745" mt="$2">
            Payment Successful!
          </Text>
          <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} color="#6c757d" textAlign="center">
            Thank you for your order. We'll start preparing your meals right away.
          </Text>
        </YStack>

        <View
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: isMobile || isMobileWeb ? 12 : 16,
            marginBottom: 16,
            border: '1px solid #e9ecef',
          }}
        >
          <XStack alignItems="center" mb="$2">
            <Package size={isMobile || isMobileWeb ? 16 : 20} color="#FF6B00" />
            <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} fontWeight="600" ml="$2">
              Order #{order.orderId.replace('#', '')}
            </Text>
          </XStack>
          <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#6c757d">
            Placed on {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: isMobile || isMobileWeb ? 12 : 16,
            marginBottom: 16,
            border: '1px solid #e9ecef',
          }}
        >
          <XStack alignItems="center" mb="$2">
            <MapPin size={isMobile || isMobileWeb ? 16 : 20} color="#FF6B00" />
            <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} fontWeight="600" ml="$2">
              Delivery Address
            </Text>
          </XStack>
          <Text fontSize={isMobile || isMobileWeb ? "$3" : "$4"} fontWeight="500">
            {order.address.name}
          </Text>
          <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#6c757d">
            {order.address.street_address}
          </Text>
          <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#6c757d">
            {order.address.city}, {order.address.province} {order.address.postal_code}
          </Text>
          <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#6c757d">
            {order.address.phone}
          </Text>
          {order.address.location_remark && (
            <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#6c757d" mt="$1">
              Note: {order.address.location_remark}
            </Text>
          )}
        </View>

        <View
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: isMobile || isMobileWeb ? 12 : 16,
            marginBottom: 16,
            border: '1px solid #e9ecef',
          }}
        >
          <XStack alignItems="center" mb="$3">
            <Calendar size={isMobile || isMobileWeb ? 16 : 20} color="#FF6B00" />
            <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} fontWeight="600" ml="$2">
              Your Meals
            </Text>
          </XStack>

          {order.items.map((day, dayIndex) => (
            <View key={dayIndex} mb="$3">
              <Text fontSize={isMobile || isMobileWeb ? "$3" : "$4"} fontWeight="600" color="#FF6B00" mb="$2">
                {day.day} - {formatDate(day.deliveryDate)}
              </Text>
              {day.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 8,
                    padding: isMobile || isMobileWeb ? 10 : 12,
                    marginBottom: 8,
                    border: '1px solid #e9ecef',
                  }}
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <YStack flex={1}>
                      <Text fontSize={isMobile || isMobileWeb ? "$3" : "$4"} fontWeight="500">
                        {item.food.name}
                      </Text>
                      <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#6c757d">
                        Quantity: {item.quantity}
                      </Text>
                    </YStack>
                    <Text fontSize={isMobile || isMobileWeb ? "$3" : "$4"} fontWeight="600">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </XStack>
                </View>
              ))}
              <XStack justifyContent="space-between" mt="$2" pt="$2" style={{ borderTop: '1px solid #e9ecef' }}>
                <Text fontSize={isMobile || isMobileWeb ? "$3" : "$4"} fontWeight="600">
                  Day Total:
                </Text>
                <Text fontSize={isMobile || isMobileWeb ? "$3" : "$4"} fontWeight="600">
                  ${day.dayTotal.toFixed(2)}
                </Text>
              </XStack>
            </View>
          ))}
        </View>

        <View
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: isMobile || isMobileWeb ? 12 : 16,
            marginBottom: 16,
            border: '1px solid #e9ecef',
          }}
        >
          <XStack alignItems="center" mb="$2">
            <CreditCard size={isMobile || isMobileWeb ? 16 : 20} color="#FF6B00" />
            <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} fontWeight="600" ml="$2">
              Payment Details
            </Text>
          </XStack>

          <YStack space="$1">
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>Payment Method:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} fontWeight="500">
                {order.paymentMethod}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>Payment Status:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} fontWeight="500" color="#28a745">
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>Order Status:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} fontWeight="500" color="#FF6B00">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </XStack>
          </YStack>
        </View>

        <View
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: isMobile || isMobileWeb ? 12 : 16,
            marginBottom: 16,
            border: '1px solid #e9ecef',
          }}
        >
          <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} fontWeight="600" mb="$3">
            Order Summary
          </Text>

          <YStack space="$2">
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>Subtotal:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>
                $
                {(
                  order.totalPaid -
                  order.platformFee -
                  order.deliveryFee +
                  order.discount.amount -
                  order.taxes
                ).toFixed(2)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>Platform Fee:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>${order.platformFee.toFixed(2)}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>Delivery Fee:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>${order.deliveryFee.toFixed(2)}</Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#28a745">Discount:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"} color="#28a745">
                -${order.discount.amount.toFixed(2)}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>Taxes:</Text>
              <Text fontSize={isMobile || isMobileWeb ? "$2" : "$3"}>${order.taxes.toFixed(2)}</Text>
            </XStack>
            <XStack justifyContent="space-between" pt="$2" style={{ borderTop: '1px solid #e9ecef' }}>
              <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} fontWeight="bold">
                Total:
              </Text>
              <Text fontSize={isMobile || isMobileWeb ? "$4" : "$5"} fontWeight="bold" color="#FF6B00">
                ${order.totalPaid.toFixed(2)}
              </Text>
            </XStack>
          </YStack>
        </View>

        <YStack space="$3" mt="$6" pb='$6'>
          <Button
            style={{ backgroundColor: '#FF6B00' }}
            color="white"
            onPress={() => { accountLink.onPress() }}
            size={isMobile || isMobileWeb ? "$3" : "$4"}
          >
            View All Orders
          </Button>
          <Button
            style={{ backgroundColor: 'transparent', border: '1px solid #FF6B00' }}
            color="#FF6B00"
            onPress={() => { homeLink.onPress() }}
            size={isMobile || isMobileWeb ? "$3" : "$4"}
          >
            Go to home
          </Button>
        </YStack>
      </View>
    </View>
    </ScrollView>
  )
}
