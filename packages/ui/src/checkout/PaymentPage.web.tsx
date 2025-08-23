"use client"
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useStore } from 'app/src/store/useStore'
import { apiCreateSecureOrder, apiCheckPaymentStatus } from 'app/services/OrderService'
import { apiClearCart } from 'app/services/CartService'
import { useToast } from '../useToast'
import { MapPin, Plus, CreditCard as CreditCardIcon, Smartphone } from '@tamagui/lucide-icons'
import {
  CardElement,
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { View, Text, Button, YStack, XStack, styled } from 'tamagui'
import { useScreen } from 'app/hook/useScreen'
import { CheckoutStep } from './CheckoutSteps'
import { colors } from '../colors'
import PaymentStatusPopup from './PaymentStatusPopup'
import { useRouter } from 'next/navigation'

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
  p: '$4',
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
        p: '$3',
        marginBottom: '$3',
      },
    },
  },
})

const PaymentCard = styled(View, {
  backgroundColor: 'white',
  borderRadius: 10,
  p: '$4',
  borderWidth: 1,
  borderColor: '#EDEDED',
  marginTop: '$4',

  variants: {
    mobile: {
      true: {
        p: '$3',
        marginTop: '$3',
      },
    },
  },
})

const ResponsiveContainer = styled(YStack, {
  space: '$4',
  width: '100%',
  borderRadius: 20,

  variants: {
    mobile: {
      true: {
        space: '$3',
        width: '100%',
        borderRadius: 12,
      },
    },
  },
})

const AddressFormContainer = styled(YStack, {
  width: '100%',
  p: '$4',
  backgroundColor: 'white',
  borderRadius: 10,

  variants: {
    mobile: {
      true: {
        p: '$3',
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
  justifyContent: 'space-between',
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

function PaymentFormInner({
  selectedAddress,
  goBack,
  onPaymentSuccess,
  onPaymentError,
  onOrderCreated,
  orderCalculations,
  clientSecret,
  setPaymentStatus,
  setCompletedOrderId,
  orderId,
  totalAmount,
}: any) {
  console.log(clientSecret)
    const { cart, cartTotalAmount,fetchCart ,setSuccessOrderId} = useStore()

  const { showMessage } = useToast()
  const stripe = useStripe()
  const elements = useElements()
const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle Express Checkout (Apple Pay / Google Pay / Link)
  const handleExpressCheckoutConfirm = useCallback(
    async (event: any) => {
      if (!stripe||!orderId) return
      setProcessing(true)
      setError(null)
      try {
        // Step 1: Create secure order
        // const orderResponse: any = await apiCreateSecureOrder({
        //   deliveryAddress: selectedAddress._id,
        //   currency: 'usd',
        // })

        // if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
        //   throw new Error(orderResponse?.error || 'Failed to create order')
        // }

        // const { orderId, clientSecret: newClientSecret } = orderResponse.data
        // setCompletedOrderId(orderId)

        // Step 2: Confirm payment using provided clientSecret
        const { error: confirmError } = await event.confirm(clientSecret)
        if (confirmError) {
          setPaymentStatus('failed')
          throw new Error(confirmError.message)
        }

        setPaymentStatus('processing')
        // Step 3: Wait for webhook confirmation (poll for payment status)
        let paymentConfirmed = false
        let attempts = 0
        const maxAttempts = 30 // 30 seconds max wait time

        while (!paymentConfirmed && attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
          attempts++

          try {
            const statusResponse: any = await apiCheckPaymentStatus(orderId)
            if (statusResponse?.success && statusResponse?.data?.paymentStatus === 'paid') {
              paymentConfirmed = true
              break
            }
          } catch (statusError) {
            console.warn('Error checking payment status:', statusError)
          }
        }

        if (!paymentConfirmed) {
          setPaymentStatus('failed')
          throw new Error('Payment confirmation timeout. Please check your order status.')
        }

        // Step 4: Payment confirmed by webhook - clear cart and notify
        try {
          await apiClearCart()
           fetchCart()
setSuccessOrderId(orderId)
        } catch (clearError) {
          console.warn('Failed to clear cart:', clearError)
        }

        setPaymentStatus('success')
        showMessage('Payment successful', 'success')
        if (onPaymentSuccess) onPaymentSuccess({ orderId, total: orderCalculations.total })
        if (onOrderCreated) onOrderCreated(orderId)
          
          // Redirect to success page
         router.push("/checkout/success")
       
      } catch (e: any) {
        setPaymentStatus('failed')
        setError(e?.message || 'Payment failed')
        if (onPaymentError) onPaymentError(e)
      } finally {
        setProcessing(false)
      }
    },
    [
      stripe,
      selectedAddress,
      orderCalculations,
      onPaymentError,
      onPaymentSuccess,
      onOrderCreated,
      showMessage,
      setPaymentStatus,
      setCompletedOrderId,
    ]
  )

  // Fallback card form
  const onPay = useCallback(async () => {
    if (!stripe || !elements) return
    if (!selectedAddress || !cart) return
    setProcessing(true)
    setPaymentStatus('processing')
    setError(null)
    try {
      // Step 1: Create secure order
      // const orderResponse: any = await apiCreateSecureOrder({
      //   deliveryAddress: selectedAddress._id,
      //   currency: 'usd',
      // })

      // if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
      //   throw new Error(orderResponse?.error || 'Failed to create order')
      // }

      // const { orderId, clientSecret: newClientSecret, totalAmount } = orderResponse.data
      // setCompletedOrderId(orderId)

      // Step 2: Get card element and confirm payment
      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card element not found')

      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
          billing_details: {
            name: selectedAddress?.name,
            email: selectedAddress?.email,
            phone: selectedAddress?.phone,
          },
        },
      })

      if (confirmResult.error) {
        setPaymentStatus('failed')
        throw new Error(confirmResult.error.message || 'Payment failed')
      }

      // Step 3: Wait for webhook confirmation (poll for payment status)
      let paymentConfirmed = false
      let attempts = 0
      const maxAttempts = 30 // 30 seconds max wait time

      while (!paymentConfirmed && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
        attempts++

        try {
          console.log('----------------orderId')
          console.log(orderId)
          console.log(attempts)
          const statusResponse: any = await apiCheckPaymentStatus(orderId)
          if (statusResponse?.success && statusResponse?.data?.paymentStatus === 'paid') {
            paymentConfirmed = true
            break
          }
        } catch (statusError) {
          console.warn('Error checking payment status:', statusError)
        }
      }

      if (!paymentConfirmed) {
        setPaymentStatus('failed')
        throw new Error('Payment confirmation timeout. Please check your order status.')
      }

      // Step 4: Payment confirmed by webhook - clear cart and notify
      try {
        await apiClearCart()
         fetchCart()
setSuccessOrderId(orderId)
      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError)
      }

      setPaymentStatus('success')
      showMessage('Payment successful', 'success')
      if (onPaymentSuccess) onPaymentSuccess({ orderId, total: totalAmount })
      if (onOrderCreated) onOrderCreated(orderId)
              router.push("/checkout/success")

    } catch (e: any) {
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
      if (onPaymentError) onPaymentError(e)
    } finally {
      setProcessing(false)
    }
  }, [
    stripe,
    elements,
    cart,
    selectedAddress,
    orderCalculations,
    onPaymentError,
    onPaymentSuccess,
    onOrderCreated,
    showMessage,
    setPaymentStatus,
    setCompletedOrderId,
  ])

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EDEDED',
        marginTop: 8,
        minWidth: 500,
        gap: 16,
      }}
    >
      <ExpressCheckoutElement
        options={{
          paymentMethods: {
            applePay: 'always',
            googlePay: 'always',
            link: 'auto',
          },
        }}
        onConfirm={handleExpressCheckoutConfirm}
      />

      <CardElement options={{ hidePostalCode: true }} />
      {error && (
        <Text color="#C53030" mt="$3">
          {error}
        </Text>
      )}
      <Button
        mt="$4"
        onPress={onPay}
        disabled={processing || !stripe}
        style={{
          backgroundColor: colors.primary,
          color: 'white',
        }}
      >
        {processing ? 'Processing...' : 'Pay With Card'}
      </Button>
    </View>
  )
}

export default function PaymentPageWeb(props: any) {
  const { selectedAddress, goBack } = props
  const { cart, cartTotalAmount } = useStore()
  const { isMobile, isMobileWeb } = useScreen()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState<string | null>(null)

  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | null>(
    null
  )
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''),
    []
  )
  useEffect(() => {
    async function initPaymentIntent() {
      const orderResponse = await apiCreateSecureOrder({
        deliveryAddress: selectedAddress._id,
        currency: 'usd',
      })
      console.log(orderResponse)
      if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
        throw new Error(orderResponse?.error || 'Failed to create order')
      }
      setCompletedOrderId(orderResponse.data.orderId)
      setClientSecret(orderResponse.data.clientSecret) // keep in state
      setTotalAmount(orderResponse.data.totalAmount)
    }
    initPaymentIntent()
  }, [selectedAddress])

  const orderCalculations = useMemo(() => {
    if (!cart?.days) return { subtotal: 0, platformFee: 1.0, deliveryFee: 10.0, taxes: 0, total: 0 }
    const subtotal = cart.days.reduce(
      (acc, day) => acc + day.items.reduce((ia, it) => ia + it.food.price * it.quantity, 0),
      0
    )
    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = subtotal > 100 ? 10.0 : 5.0
    const taxes = subtotal * 0.1
    const total = subtotal + platformFee + deliveryFee - discountAmount + taxes
    return { subtotal, platformFee, deliveryFee, discountAmount, taxes, total }
  }, [cart])

  return (
    <>
      <YStack
        style={{
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: 16,
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          gap: isMobile ? 8 : 0,
        }}
      >
        <CheckoutStep
          icon={<CreditCardIcon size={16} color="#FF6B00" />}
          title="Payment Method"
          description="Choose your preferred payment method to complete your order."
        />
        <XStack width={'100%'} justify={'flex-end'}>
          <Text
            onPress={goBack}
            hoverStyle={{ color: '#FF1F0D' }}
            pressStyle={{ color: '#FF1F0D' }}
            cursor="pointer"
            color="#FF9F0D"
            textDecorationLine="underline"
            fontSize={isMobile ? '$3' : '$4'}
            mt={isMobile ? '$2' : '$0'}
          >
            Edit address
          </Text>
        </XStack>
      </YStack>

      {/* Order Summary with Cart Items */}
      <PaymentCard mobile={isMobile}>
        <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="600" mb="$3">
          Order Summary
        </Text>

        <OrderSummaryRow>
          <Text fontSize={isMobile ? '$3' : '$4'}>Delivery to:</Text>
          <Text
            fontWeight="500"
            fontSize={isMobile ? '$3' : '$4'}
            text={isMobile ? 'right' : 'left'}
          >
            {selectedAddress?.location_remark || 'Selected Address'}
          </Text>
        </OrderSummaryRow>

        <Text fontSize={isMobile ? '$3' : '$4'} mb="$3" color="#6C757D">
          {selectedAddress?.street_address
            ? `${selectedAddress.street_address}, ${selectedAddress.city || ''}`
            : 'Address details'}
        </Text>

        {/* Cart Items Summary */}
        <YStack space="$2" mb="$3">
          {cart?.days?.map(
            (day) =>
              day.items.length > 0 && (
                <YStack key={day._id} space="$1">
                  <Text fontSize="$3" fontWeight="600" color="#FF6B00">
                    {day.day} ({new Date(day.date).toLocaleDateString()})
                  </Text>
                  {day.items.map((item) => (
                    <XStack key={item._id} justify="space-between" pl="$2">
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
        <YStack space="$1" pt="$2" borderTopWidth={1} borderTopColor="#EDEDED">
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
          <XStack justify="space-between" pt="$2" borderTopWidth={1} borderTopColor="#EDEDED">
            <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="bold">
              Final Total:
            </Text>
            <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="bold" color="#FF6B00">
              ${cartTotalAmount + 31 - 10 + 1}
            </Text>
          </XStack>
        </YStack>
      </PaymentCard>

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
          <PaymentFormInner
            orderCalculations={orderCalculations}
            {...props}
            clientSecret={clientSecret}
            setPaymentStatus={setPaymentStatus}
            setCompletedOrderId={setCompletedOrderId}
            orderId={completedOrderId}
            totalAmount={totalAmount}
          />
        </Elements>
      )}

      {/* Payment Status Popup */}
      <PaymentStatusPopup
        paymentStatus={paymentStatus}
        completedOrderId={completedOrderId}
        setPaymentStatus={setPaymentStatus}
      />
    </>
  )
}
