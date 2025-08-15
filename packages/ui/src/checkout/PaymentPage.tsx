import { View, Input, Label, Select, YStack, XStack, Text, styled, Button, Spinner } from 'tamagui'
import { IAddress } from 'app/types/user'
import Selectable from '../Selectable'
import { MapPin, Plus, CreditCard as CreditCardIcon, Smartphone } from '@tamagui/lucide-icons'
import { CheckoutStep } from './CheckoutSteps'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { PaymentForm, CreditCard, GooglePay, ApplePay } from 'react-square-web-payments-sdk'
import { apiCheckout, apiCreateOrder } from 'app/services/OrderService'
import { apiGetCart, apiClearCart } from 'app/services/CartService'
import { useToast } from '../useToast'
import { IResponse } from 'app/types/common'
import { useStore } from 'app/src/store/useStore'
import { Dialog } from 'tamagui'
import { colors } from '../colors'
import PaymentStatusPopup from './PaymentStatusPopup'
// Types based on your cart response structure
interface CartItem {
  _id: string
  food: {
    _id: string
    name: string
    price: number
    description?: string
    url?: string
  }
  quantity: number
  day: string
}

interface CartDay {
  _id: string
  day: string
  date: string
  cart_value: number
  items: CartItem[]
}

interface Cart {
  _id: string
  user: string
  days: CartDay[]
}

interface ICartResponse {
  message: string
  data: Cart
}

const StepCard = styled(View, {
  borderRadius: 8,
  padding: '$4',
  borderWidth: 1,
  borderColor: '#EDEDED',
  marginBottom: '$4',
  shadowColor: 'rgba(0, 0, 0, 0.05)',
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 4,
  backgroundColor: '#FAFAFA',

  variants: {
    mobile: {
      true: {
        padding: '$3',
        marginBottom: '$3',
      },
    },
  },
})

const PaymentCard = styled(View, {
  backgroundColor: 'white',
  borderRadius: 10,
  padding: '$4',
  borderWidth: 1,
  borderColor: '#EDEDED',
  marginTop: '$4',

  variants: {
    mobile: {
      true: {
        padding: '$3',
        marginTop: '$3',
      },
    },
  },
})

const ResponsiveContainer = styled(YStack, {
  space: '$4',
  width: '100%',
  maxWidth: 600,
  borderRadius: 20,

  variants: {
    mobile: {
      true: {
        space: '$3',
        maxWidth: '100%',
        borderRadius: 12,
      },
    },
  },
})

const AddressFormContainer = styled(YStack, {
  width: '100%',
  padding: '$4',
  backgroundColor: 'white',
  borderRadius: 10,

  variants: {
    mobile: {
      true: {
        padding: '$3',
        borderRadius: 8,
      },
    },
  },
})

const FormRow = styled(XStack, {
  space: '$3',
  width: '100%',

  variants: {
    mobile: {
      true: {
        flexDirection: 'column',
        space: '$2',
      },
    },
  },
})

const FormField = styled(YStack, {
  flex: 1,
  space: '$2',

  variants: {
    mobile: {
      true: {
        flex: 1,
        width: '100%',
      },
    },
  },
})

const OrderSummaryRow = styled(XStack, {
  justify: 'space-between',
  alignItems: 'center',
  marginBottom: '$2',

  variants: {
    mobile: {
      true: {
        flexWrap: 'wrap',
        gap: '$1',
      },
    },
  },
})

export default function PaymentPage({
  selectedAddress,
  handleAddressChange,
  goBack,
  onPaymentSuccess,
  onPaymentError,
  onOrderCreated,
}: {
  selectedAddress: IAddress
  handleAddressChange: (val: string) => void
  goBack: () => void
  onPaymentSuccess?: (orderData: any) => void
  onPaymentError?: (error: any) => void
  onOrderCreated?: (orderId: string) => void
}) {
  const { cartTotalAmount, cart } = useStore()

  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | null>(
    null
  )
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const { showMessage } = useToast()

  // Mobile detection
  const checkMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkMobile()
      const handleResize = () => checkMobile()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [checkMobile])

  // Fetch cart data
  // const fetchCartData = useCallback(async () => {
  //   try {
  //     setIsLoadingCart(true)
  //     const response = await apiGetCart<IResponse<Cart>>()
  //     setCart(response.data)
  //   } catch (error) {
  //     console.error('Error fetching cart:', error)
  //     showMessage('Error loading cart data', 'error')
  //   } finally {
  //     setIsLoadingCart(false)
  //   }
  // }, [showMessage])

  // useEffect(() => {
  //   fetchCartData()
  // }, [])

  // Calculate totals from cart data
  const orderCalculations = useMemo(() => {
    if (!cart?.days) return { subtotal: 0, platformFee: 1.0, deliveryFee: 10.0, taxes: 0, total: 0 }

    const subtotal = cart.days.reduce((dayAcc, day) => {
      return (
        dayAcc +
        day.items.reduce((itemAcc, item) => {
          return itemAcc + item.food.price * item.quantity
        }, 0)
      )
    }, 0)

    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = subtotal > 100 ? 10.0 : 5.0
    const taxes = subtotal * 0.1
    const total = subtotal + platformFee + deliveryFee - discountAmount + taxes

    return {
      subtotal,
      platformFee,
      deliveryFee,
      discountAmount,
      taxes,
      total,
    }
  }, [cart])

  // Transform cart data to order format
  const transformCartToOrder = useCallback(() => {
    if (!cart?.days || !selectedAddress) return null
    console.log('orderData for cart :', cart)
    return {
      items: cart.days
        .filter((day) => day.items.length > 0)
        .map((day) => ({
          day: day.day,
          deliveryDate: day.date,
          items: day.items.map((item) => ({
            food: item.food._id,
            quantity: item.quantity,
            price: item.food.price,
          })),
          dayTotal: day.items.reduce((acc, item) => acc + item.food.price * item.quantity, 0),
        })),
      deliveryAddress: selectedAddress._id,
      paymentMethod: 'Credit Card',
      customerDetails: {
        name: selectedAddress.name,
        email: selectedAddress.email,
        phone: selectedAddress.phone,
      },
    }
  }, [cart, selectedAddress])

  const appId = 'sandbox-sq0idb--7LNP6X3I9DoOMOGUjwokg'
  const locationId = 'LFH3Z9618P0SA'

  // Industry Standard Payment Flow:
  // 1. Create order in "pending" status
  // 2. Process payment with Square
  // 3. If payment succeeds, update order to "confirmed" and clear cart
  // 4. If payment fails, keep order as "pending" for retry
  const handlePaymentToken = useCallback(
    async (token: any, buyer: any) => {
      if (!selectedAddress || !cart) {
        setPaymentError('Missing required information')
        return
      }

      setIsProcessingPayment(true)
      setPaymentError(null)
      setPaymentStatus('processing')

      try {
        // Step 1: Create order in pending status
        const orderData = transformCartToOrder()
        console.log('Order data ', orderData)
        if (!orderData) {
          throw new Error('Unable to process cart data')
        }

        const orderResponse: any = await apiCreateOrder(orderData)
        const orderId = orderResponse?.data._id

        // Step 2: Process payment with Square
        const paymentResponse: any = await apiCheckout({
          sourceId: token?.token || '',
          amount: Math.round(orderCalculations.total * 100), // Square expects cents
          orderId: orderId, // Include order ID in payment
          buyerVerificationToken: buyer?.verificationToken,
        })

        if (paymentResponse.success) {
          // Step 3: Payment successful - clear cart
          try {
            await apiClearCart()
          } catch (clearError) {
            console.warn('Could not clear cart:', clearError)
          }

          setPaymentStatus('success')
          setCompletedOrderId(orderId)

          if (onPaymentSuccess) {
            onPaymentSuccess({
              orderId: orderId,
              total: orderCalculations.total,
              paymentId: paymentResponse.paymentId,
            })
          }

          if (onOrderCreated) {
            onOrderCreated(orderId)
          }
        } else {
          throw new Error(paymentResponse.message || 'Payment processing failed')
        }
      } catch (error) {
        console.error('Checkout process error:', error)
        const errorMessage = error?.message || 'Payment failed. Please try again.'
        setPaymentError(errorMessage)
        setPaymentStatus('failed')
        setCompletedOrderId('1293827237464236') // Mock order ID for demo

        if (onPaymentError) {
          onPaymentError(error)
        }
      } finally {
        setIsProcessingPayment(false)
      }
    },
    [
      cart,
      selectedAddress,
      orderCalculations,
      transformCartToOrder,
      onPaymentSuccess,
      onPaymentError,
      onOrderCreated,
      showMessage,
    ]
  )

  const handlePaymentError = useCallback(
    (errors: any) => {
      console.error('Square payment errors:', errors)
      const errorMessage = 'Payment failed. Please check your payment details and try again.'
      setPaymentError(errorMessage)
      showMessage(errorMessage, 'error')

      if (onPaymentError) {
        onPaymentError(errors)
      }
      setIsProcessingPayment(false)
    },
    [onPaymentError, showMessage]
  )

  return (
    <View>
      {/* <YStack
        justify="flex-start"
        alignItems={"flex-start"}
        marginBottom="$4"
        flexWrap={isMobile ? 'wrap' : 'nowrap'}
        gap={isMobile ? '$2' : '$4'}
      > */}
        {/* <Text
          onPress={goBack}
          hoverStyle={{ color: '#FF1F0D' }}
          pressStyle={{ color: '#FF1F0D' }}
          cursor="pointer"
          color="#FF9F0D"
          textDecorationLine="underline"
          fontSize={isMobile ? '$3' : '$4'}
          marginTop={isMobile ? '$2' : '$0'}
        >
          Edit address
        </Text> */}
        <CheckoutStep
          icon={<CreditCardIcon size={16} color="#FF6B00" />}
          title="Payment Method"
          description="Choose your preferred payment method to complete your order."
        />
      {/* </YStack> */}

      {/* Order Summary with Cart Items */}
      <PaymentCard mobile={isMobile}>
        <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="600" marginBottom="$3">
          Order Summary
        </Text>

        <OrderSummaryRow mobile={isMobile}>
          <Text fontSize={isMobile ? '$3' : '$4'}>Delivery to:</Text>
          <Text
            fontWeight="500"
            fontSize={isMobile ? '$3' : '$4'}
            textAlign={isMobile ? 'right' : 'left'}
          >
            {selectedAddress?.location_remark || 'Selected Address'}
          </Text>
        </OrderSummaryRow>

        <Text fontSize={isMobile ? '$3' : '$4'} marginBottom="$3" color="#6C757D">
          {selectedAddress?.street_address
            ? `${selectedAddress.street_address}, ${selectedAddress.city || ''}`
            : 'Address details'}
        </Text>

        {/* Cart Items Summary */}
        <YStack space="$2" marginBottom="$3">
          {cart?.days?.map(
            (day) =>
              day.items.length > 0 && (
                <YStack key={day._id} space="$1">
                  <Text fontSize="$3" fontWeight="600" color="#FF6B00">
                    {day.day} ({new Date(day.date).toLocaleDateString()})
                  </Text>
                  {day.items.map((item) => (
                    <XStack key={item._id} justify="space-between" paddingLeft="$2">
                      <Text fontSize="$3" color="#666">
                        {item.quantity}x {item.food.name}
                      </Text>
                      <Text fontSize="$3" color="#666">
                        ${(item.food.price * item.quantity).toFixed(2)}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              )
          )}
        </YStack>

        {/* Order Totals */}
        <YStack space="$1" paddingTop="$2" borderTopWidth={1} borderTopColor="#EDEDED">
          <XStack justify="space-between">
            <Text fontSize="$3">Subtotal:</Text>
            <Text fontSize="$3">${orderCalculations?.subtotal?.toFixed(2)}</Text>
          </XStack>
          <XStack justify="space-between">
            <Text fontSize="$3">Platform Fee:</Text>
            <Text fontSize="$3">${orderCalculations?.platformFee?.toFixed(2)}</Text>
          </XStack>
          <XStack justify="space-between">
            <Text fontSize="$3">Delivery Fee:</Text>
            <Text fontSize="$3">${orderCalculations?.deliveryFee?.toFixed(2)}</Text>
          </XStack>
          <XStack justify="space-between">
            <Text fontSize="$3" color="#00AA00">
              Discount:
            </Text>
            <Text fontSize="$3" color="#00AA00">
              -${orderCalculations?.discountAmount?.toFixed(2)}
            </Text>
          </XStack>
          <XStack justify="space-between">
            <Text fontSize="$3">Taxes:</Text>
            <Text fontSize="$3">${orderCalculations.taxes.toFixed(2)}</Text>
          </XStack>
          <XStack
            justify="space-between"
            paddingTop="$2"
            borderTopWidth={1}
            borderTopColor="#EDEDED"
          >
            <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="bold">
              Final Total:
            </Text>
            <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="bold" color="#FF6B00">
              ${cartTotalAmount + 31 - 10 + 1}
            </Text>
          </XStack>
        </YStack>
      </PaymentCard>

      {/* Payment Error Display */}
      {paymentError && (
        <View
          padding="$3"
          backgroundColor="#FEE"
          borderRadius={8}
          marginTop="$3"
          borderWidth={1}
          borderColor="#FCC"
        >
          <Text color="#C53030" fontSize={isMobile ? '$3' : '$4'}>
            {paymentError}
          </Text>
        </View>
      )}

      {/* Square Payment Form */}
      <PaymentCard mobile={isMobile}>
        <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="600" marginBottom="$4">
          Payment Details
        </Text>

        {isProcessingPayment && (
          <View padding="$3" backgroundColor="#E6F3FF" borderRadius={8} marginBottom="$3">
            <Text color="#0066CC" fontSize={isMobile ? '$3' : '$4'}>
              Processing your order and payment...
            </Text>
          </View>
        )}

        <View opacity={isProcessingPayment ? 0.5 : 1}>
          <PaymentForm
            applicationId={appId}
            locationId={locationId}
            cardTokenizeResponseReceived={handlePaymentToken}
            createPaymentRequest={() => ({
              countryCode: 'US',
              currencyCode: 'USD',
              total: {
                amount: (orderCalculations.total * 100).toString(),
                label: 'Total',
              },
            })}
          >
            <View mt="$3">
              <GooglePay />
            </View>
            <View mt="$3">
              <ApplePay />
            </View>

            <View mt="$3">
              <CreditCard />
            </View>
          </PaymentForm>
        </View>
      </PaymentCard>

      {/* Security Notice */}
      <View marginTop="$3" padding="$3" backgroundColor="#F8F9FA" borderRadius={8}>
        <XStack space="$2" alignItems="center" flexWrap="wrap">
          <Text
            fontSize={isMobile ? '$2' : '$3'}
            color="#6C757D"
            textAlign={isMobile ? 'center' : 'left'}
          >
            🔒 Your payment information is secure and encrypted
          </Text>
        </XStack>
      </View>

      {/* Payment Status Modal */}
      <PaymentStatusPopup
        setPaymentStatus={setPaymentStatus}
        completedOrderId={completedOrderId}
        paymentStatus={paymentStatus}
      ></PaymentStatusPopup>
    </View>
  )
}
