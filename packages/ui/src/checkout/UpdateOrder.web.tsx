'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  apiCreateSecureOrderForUpdate,
  apiCheckPaymentStatus,
  apiGetUpdateOrderDetails,
} from 'app/services/OrderService'
import { apiUpdateOrderItems } from 'app/services/OrderService'
import { useToast } from '../useToast'
import { CreditCard as CreditCardIcon } from '@tamagui/lucide-icons'
import {
  CardElement,
  Elements,
  ExpressCheckoutElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { View, Text, Button, YStack, XStack, Spinner } from 'tamagui'
import { useScreen } from 'app/hook/useScreen'
import { colors } from '../colors'
import PaymentStatusPopup from './PaymentStatusPopup'
import { useStore } from 'app/src/store/useStore'

// Type definitions for API responses
interface UpdateOrderDetailsResponse {
  success: boolean
  data?: {
    updatingOrder: {
      paymentStatus: string
      items: any[]
    }
  }
  error?: string
}

interface CreateSecureOrderResponse {
  success: boolean
  data?: {
    clientSecret: string
    originalOrderId: string
    totalAmount: string
  }
  error?: string
}

interface PaymentStatusResponse {
  success: boolean
  data?: {
    paymentStatus: string
  }
  error?: string
}

function UpdateOrderFormInner({
  updatingOrderId,
  orderCalculations,
  clientSecret,
  setPaymentStatus,
  setCompletedOrderId,
  orderId,
  totalAmount,
}: any) {
  const { showMessage } = useToast()
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
    const { setSuccessOrderId} = useStore()

  // Handle Express Checkout (Apple Pay / Google Pay / Link)
  const handleExpressCheckoutConfirm = useCallback(
    async (event: any) => {
      if (!stripe || !updatingOrderId) return
      setProcessing(true)
      setError(null)
      try {
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
            const statusResponse = await apiCheckPaymentStatus<PaymentStatusResponse>(orderId, {
              orderType: 'UPDATE',
              updatingOrderId,
            })
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

        // Step 4: Payment confirmed by webhook - update order items
        try {
          await apiUpdateOrderItems<{ success: boolean; updatedTotal?: number }>({
            updatingOrderId,
          })
        } catch (updateError) {
          console.warn('Failed to update order items:', updateError)
        }
setSuccessOrderId(orderId)
        setPaymentStatus('success')
        showMessage('Payment successful. Your order update will be applied shortly.', 'success')
        // Redirect to success page
        router.push('/checkout/success')
      } catch (e: any) {
        setPaymentStatus('failed')
        setError(e?.message || 'Payment failed')
      } finally {
        setProcessing(false)
      }
    },
    [
      stripe,
      orderCalculations,
      showMessage,
      setPaymentStatus,
      setCompletedOrderId,
      router,
      updatingOrderId,
    ]
  )

  // Fallback card form
  const onPay = useCallback(async () => {
    if (!stripe || !elements) return
    setProcessing(true)
    setPaymentStatus('processing')
    setError(null)
    try {
      // Step 2: Get card element and confirm payment
      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card element not found')

      const confirmResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card,
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
          const statusResponse = await apiCheckPaymentStatus<PaymentStatusResponse>(orderId, {
            orderType: 'UPDATE',
            updatingOrderId,
          })
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

      // Step 4: Payment confirmed by webhook - update order items
      try {
        await apiUpdateOrderItems<{ success: boolean; updatedTotal?: number }>({
          updatingOrderId,
        })
      } catch (updateError) {
        console.warn('Failed to update order items:', updateError)
      }
setSuccessOrderId(orderId)

      setPaymentStatus('success')
      showMessage('Payment successful. Your order update will be applied shortly.', 'success')
      router.push('/checkout/success')
    } catch (e: any) {
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }, [
    stripe,
    elements,
    orderCalculations,
    showMessage,
    setPaymentStatus,
    setCompletedOrderId,
    router,
    updatingOrderId,
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

export default function UpdateOrderWeb() {
  const sp = useSearchParams()
  const router = useRouter()
  const updatingOrderId = sp?.get('updatingOrderId') || ''
  const { isMobile, isMobileWeb } = useScreen()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | null>(
    null
  )
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const [paymentAlreadyCompleted, setPaymentAlreadyCompleted] = useState<boolean>(false)
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''),
    []
  )

  useEffect(() => {
    const run = async () => {
      if (!updatingOrderId) return
      setLoading(true)
      setError(null)
      try {
        // Load updating order data
        const orderData = await apiGetUpdateOrderDetails<UpdateOrderDetailsResponse>(updatingOrderId)
        console.log(orderData)

        if (!orderData?.success) {
          throw new Error(orderData?.error || 'Failed to load updating order')
        }
        setData(orderData?.data ?? null)

        // Check if payment is already completed
        const updatingOrder = orderData?.data?.updatingOrder
        if (updatingOrder?.paymentStatus === 'paid') {
          setPaymentAlreadyCompleted(true)
          setLoading(false)
          return
        }

        // Create secure payment intent only if payment is not already completed
        const orderResponse = await apiCreateSecureOrderForUpdate<CreateSecureOrderResponse>({
          updatingOrderId,
          currency: 'usd',
        })
        console.log(orderResponse)
        if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
          throw new Error(orderResponse?.error || 'Failed to create secure order')
        }
        setCompletedOrderId(orderResponse.data.originalOrderId)
        setClientSecret(orderResponse.data.clientSecret)
        setTotalAmount(orderResponse.data.totalAmount)
      } catch (e: any) {
        setError(e?.error || e?.message || 'Failed to load')
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [updatingOrderId])

  const updatingOrder = data?.updatingOrder

  const orderCalculations = useMemo(() => {
    const days = updatingOrder?.items || []
    if (!days || days.length === 0)
      return {
        subtotal: 0,
        platformFee: 1.0,
        deliveryFee: 10.0,
        discountAmount: 0,
        taxes: 0,
        total: 0,
      }

    // Note: We'll use the totalAmount from the API response since prices are calculated server-side
    // This ensures consistency with the payment intent amount
    const subtotal = totalAmount
      ? parseFloat(totalAmount) -
        1.0 -
        10.0 +
        (parseFloat(totalAmount) > 111 ? 10.0 : 5.0) -
        parseFloat(totalAmount) * 0.1
      : 0

    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = subtotal > 100 ? 10.0 : 5.0
    const taxes = subtotal * 0.1
    const total = totalAmount
      ? parseFloat(totalAmount)
      : subtotal + platformFee + deliveryFee - discountAmount + taxes

    return { subtotal, platformFee, deliveryFee, discountAmount, taxes, total }
  }, [updatingOrder, totalAmount])

  if (loading) {
    return (
      <View flex={1} justify="center" items="center" p="$4">
        <YStack space="$3" items="center">
          <Spinner size="large" color="#FF6B00" />
          <Text fontSize="$4">Loading updating order...</Text>
        </YStack>
      </View>
    )
  }

  if (error || !updatingOrder) {
    return (
      <View flex={1} justify="center" items="center" p="$4">
        <Text fontSize="$4" color="#C53030">
          {error || 'No updating order found'}
        </Text>
      </View>
    )
  }

  // Show payment already completed message
  if (paymentAlreadyCompleted) {
    return (
      <View flex={1} background="#F8F9FA" justify="center" items="center" p="$4">
        <View
          background="white"
          p="$6"
          borderWidth={1}
          borderColor="#EDEDED"
          style={{ borderRadius: 10, maxWidth: 500, textAlign: 'center' }}
        >
          <YStack space="$4" items="center">
            <CreditCardIcon size={48} color="#00AA00" />
            <Text fontSize="$6" fontWeight="bold" color="#1F2937" text="center">
              Payment Already Completed
            </Text>
            <Text fontSize="$4" color="#6B7280" text="center">
              The payment for updating this order has already been processed successfully.
            </Text>
            <Button onPress={()=>{
        router.push('/')

            }}
            
            style={{backgroundColor:colors.primary,color:'white'}}  hoverStyle={{background:colors.primary}}  size={"$4"}>
              Go To Home
            </Button>
          </YStack>
        </View>
      </View>
    )
  }

  return (
    <View flex={1} background="#F8F9FA" justify="center" items="center" p="$4">
      <View width="100%" maxW={700}>
        <YStack space="$4">
          {/* Header */}
          <YStack space="$3" items="center">
            <CreditCardIcon size={32} color="#FF6B00" />
            <Text fontSize="$6" fontWeight="bold" color="#1F2937" text="center">
              Complete Order Update Payment
            </Text>
            <Text fontSize="$4" color="#6B7280" text="center">
              Pay the difference to update your order
            </Text>
          </YStack>

          {/* Order Summary */}
          <View
            background="white"
            p="$4"
            borderWidth={1}
            borderColor="#EDEDED"
            style={{ borderRadius: 8 }}
          >
            <Text fontSize="$5" fontWeight="600" mb="$3">
              Order Summary
            </Text>

            <YStack space="$1" pt="$2" borderTopWidth={1} borderTopColor="#EDEDED">
              <XStack justify="space-between">
                <Text fontSize="$3">Subtotal:</Text>
                <Text fontSize="$3">${orderCalculations.subtotal.toFixed(2)}</Text>
              </XStack>
              <XStack justify="space-between">
                <Text fontSize="$3">Platform Fee:</Text>
                <Text fontSize="$3">${orderCalculations.platformFee.toFixed(2)}</Text>
              </XStack>
              <XStack justify="space-between">
                <Text fontSize="$3">Delivery Fee:</Text>
                <Text fontSize="$3">${orderCalculations.deliveryFee.toFixed(2)}</Text>
              </XStack>
              <XStack justify="space-between">
                <Text fontSize="$3" color="#00AA00">
                  Discount:
                </Text>
                <Text fontSize="$3" color="#00AA00">
                  -${orderCalculations.discountAmount.toFixed(2)}
                </Text>
              </XStack>
              <XStack justify="space-between">
                <Text fontSize="$3">Taxes:</Text>
                <Text fontSize="$3">${orderCalculations.taxes.toFixed(2)}</Text>
              </XStack>
              <XStack justify="space-between" pt="$2" borderTopWidth={1} borderTopColor="#EDEDED">
                <Text fontSize="$5" fontWeight="bold">
                  Final Total:
                </Text>
                <Text fontSize="$5" fontWeight="bold" color="#FF6B00">
                  ${orderCalculations.total.toFixed(2)}
                </Text>
              </XStack>
            </YStack>
          </View>

          {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret: clientSecret }}>
              <UpdateOrderFormInner
                updatingOrderId={updatingOrderId}
                orderCalculations={orderCalculations}
                clientSecret={clientSecret}
                setPaymentStatus={setPaymentStatus}
                setCompletedOrderId={setCompletedOrderId}
                orderId={completedOrderId}
                totalAmount={totalAmount}
              />
            </Elements>
          )}

          {/* Security Notice */}
          <View p="$3" background="#F8F9FA" style={{ borderRadius: 6 }}>
            <XStack space="$2" items="center" justify="center">
              <Text fontSize="$3" color="#6C757D" text="center">
                🔒 Your payment information is secure and encrypted
              </Text>
            </XStack>
          </View>
        </YStack>
      </View>

      {/* Payment Status Modal */}
      <PaymentStatusPopup
        paymentStatus={paymentStatus}
        completedOrderId={completedOrderId}
        setPaymentStatus={setPaymentStatus}
      />
    </View>
  )
}
