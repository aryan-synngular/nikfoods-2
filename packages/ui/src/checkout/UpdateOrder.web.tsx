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
    rearrangedCart?: any
    originalOrderTotal?: string
    updatingOrderTotal?: string
    platformFee?: string
    deliveryFee?: string
    discountAmount?: string
    taxes?: string
    originalOrderItems?: any[]
  }
  error?: string
  deliveryMessages?: string[]
  canCheckout?: boolean
  totalShortfall?: number
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

        // // Step 4: Payment confirmed by webhook - update order items
        // try {
        //   await apiUpdateOrderItems<{ success: boolean; updatedTotal?: number }>({
        //     updatingOrderId,
        //   })
        // } catch (updateError) {
        //   console.warn('Failed to update order items:', updateError)
        // }
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
      // try {
      //   await apiUpdateOrderItems<{ success: boolean; updatedTotal?: number }>({
      //     updatingOrderId,
      //   })
      // } catch (updateError) {
      //   console.warn('Failed to update order items:', updateError)
      // }
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
  const [deliveryMessages, setDeliveryMessages] = useState<string[]>([])
  const [rearrangedCart, setRearrangedCart] = useState<any>(null)
  const [canCheckout, setCanCheckout] = useState<boolean>(true)
  const [checkoutError, setCheckoutError] = useState<string>('')
  const [paymentBreakdown, setPaymentBreakdown] = useState<any>(null)
  const [originalOrderItems, setOriginalOrderItems] = useState<any[]>([])
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
        if (!orderResponse?.success) {
          // Check if it's a minimum order value error
          if (orderResponse?.canCheckout === false) {
            setCanCheckout(false)
            setCheckoutError(orderResponse?.error || 'Minimum order value not met')
            if (orderResponse?.deliveryMessages) {
              setDeliveryMessages(orderResponse.deliveryMessages)
            }
            return // Don't throw error, just return
          }
          
          // For other errors, throw as usual
          const errorMessage = orderResponse?.error || 'Failed to create secure order'
          throw new Error(errorMessage)
        }
        
        // If we reach here, order was created successfully
        setCanCheckout(true)
        setCheckoutError('')
        if (orderResponse?.data) {
          setCompletedOrderId(orderResponse.data.originalOrderId)
          setClientSecret(orderResponse.data.clientSecret)
          setTotalAmount(orderResponse.data.totalAmount)
          
          // Set rearranged cart if it exists
          if (orderResponse.data.rearrangedCart) {
            setRearrangedCart(orderResponse.data.rearrangedCart)
          }
          
          // Set payment breakdown if it exists
          setPaymentBreakdown({
            originalOrderTotal: orderResponse.data.originalOrderTotal,
            updatingOrderTotal: orderResponse.data.updatingOrderTotal,
            platformFee: orderResponse.data.platformFee,
            deliveryFee: orderResponse.data.deliveryFee,
            discountAmount: orderResponse.data.discountAmount,
            taxes: orderResponse.data.taxes,
          })
          
          // Set original order items if they exist
          if (orderResponse.data.originalOrderItems) {
            setOriginalOrderItems(orderResponse.data.originalOrderItems)
          }
        }
        
        // Set delivery messages if they exist
        if (orderResponse?.deliveryMessages && orderResponse.deliveryMessages.length > 0) {
          setDeliveryMessages(orderResponse.deliveryMessages)
        }
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
    const cartToUse = rearrangedCart || updatingOrder?.items || []
    if (!cartToUse || cartToUse.length === 0)
      return {
        subtotal: 0,
        total: 0,
      }

    // Calculate subtotal from rearranged cart if available, otherwise use totalAmount
    let subtotal = 0
    if (rearrangedCart?.days) {
      subtotal = rearrangedCart.days.reduce(
        (acc: number, day: any) => acc + day.items.reduce((ia: number, it: any) => ia + it.food.price * it.quantity, 0),
        0
      )
    } else if (totalAmount) {
      // For update orders, just use the total amount as subtotal (no service fees)
      subtotal = parseFloat(totalAmount)
    }

    const total = subtotal

    return { subtotal, total }
  }, [updatingOrder, totalAmount, rearrangedCart])

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
            
            {deliveryMessages.length > 0 && (
              <Text fontSize="$2" color="#ff9500" mb="$2" fontStyle="italic">
                Note: Some items have been moved to different delivery days to meet minimum order requirements.
              </Text>
            )}

            {/* Cart Items Summary */}
            <YStack space="$2" mb="$3">
              {/* Original Order Items */}
              {originalOrderItems.length > 0 && (
                <YStack space="$1" mb="$3">
                  <Text fontSize="$4" fontWeight="600" color="#0369a1" mb="$2">
                    Original Order Items (Already Paid)
                  </Text>
                  {originalOrderItems.map((day: any) =>
                    day.items.length > 0 && (
                      <YStack key={day.day} space="$1" pl="$2">
                        <Text fontSize="$3" fontWeight="600" color="#0369a1">
                          {day.day} ({new Date(day.deliveryDate).toLocaleDateString()})
                        </Text>
                        {(() => {
                          // Group items by food ID to combine quantities
                          const groupedItems = new Map()
                          day.items.forEach((item: any) => {
                            const foodId = item.food._id
                            if (groupedItems.has(foodId)) {
                              const existing = groupedItems.get(foodId)
                              existing.quantity += item.quantity
                            } else {
                              groupedItems.set(foodId, { ...item })
                            }
                          })
                          
                          return Array.from(groupedItems.values()).map((item: any) => (
                            <XStack key={item.food._id} justify="space-between" pl="$2">
                              <Text fontSize="$3" color="#0369a1" opacity={0.8}>
                                {item.quantity}x {item.food.name}
                              </Text>
                              <Text fontSize="$3" color="#0369a1" opacity={0.8}>
                                ${(item.food.price * item.quantity).toFixed(2)}
                              </Text>
                            </XStack>
                          ))
                        })()}
                      </YStack>
                    )
                  )}
                </YStack>
              )}

              {/* Updated Order Items */}
              {(rearrangedCart?.days || updatingOrder?.items)?.map(
                (day: any) =>
                  day.items.length > 0 && (
                    <YStack key={day._id || day.day} space="$1">
                      <Text fontSize="$3" fontWeight="600" color="#d97706">
                        {day.day} ({new Date(day.date || day.deliveryDate).toLocaleDateString()}) - New Items
                      </Text>
                      {(() => {
                        // Group items by food ID to combine quantities
                        const groupedItems = new Map()
                        day.items.forEach((item: any) => {
                          const foodId = item.food._id
                          if (groupedItems.has(foodId)) {
                            const existing = groupedItems.get(foodId)
                            existing.quantity += item.quantity
                          } else {
                            groupedItems.set(foodId, { ...item })
                          }
                        })
                        
                        return Array.from(groupedItems.values()).map((item: any) => (
                          <XStack key={item._id || item.food._id} justify="space-between" pl="$2">
                            <Text fontSize="$3" color="#d97706">
                              {item.quantity}x {item.food.name}
                            </Text>
                            <Text fontSize="$3" color="#d97706">
                              ${(item.food.price * item.quantity).toFixed(2)}
                            </Text>
                          </XStack>
                        ))
                      })()}
                    </YStack>
                  )
              )}
            </YStack>

            {/* Payment Breakdown */}
            <YStack space="$2" pt="$3" borderTopWidth={1} borderTopColor="#EDEDED">
              <Text fontSize="$4" fontWeight="600" color="#1F2937" mb="$2">
                Payment Breakdown
              </Text>
              
              {/* Already Paid Section */}
              <YStack space="$1" p="$3" background="#f0f9ff" style={{ borderRadius: 6 }}>
                <Text fontSize="$3" fontWeight="600" color="#0369a1">
                  Already Paid (Original Order)
                </Text>
                <XStack justify="space-between">
                  <Text fontSize="$3" color="#0369a1">Original Order Total:</Text>
                  <Text fontSize="$3" color="#0369a1" fontWeight="500">
                    ${paymentBreakdown?.originalOrderTotal || '0.00'}
                  </Text>
                </XStack>
              </YStack>
              
              {/* To Be Paid Section */}
              <YStack space="$1" p="$3" background="#fef3c7" style={{ borderRadius: 6 }}>
                <Text fontSize="$3" fontWeight="600" color="#d97706">
                  To Be Paid (Order Update)
                </Text>
                <XStack justify="space-between">
                  <Text fontSize="$3" color="#d97706">New Items Total:</Text>
                  <Text fontSize="$3" color="#d97706" fontWeight="500">
                    ${paymentBreakdown?.updatingOrderTotal || '0.00'}
                  </Text>
                </XStack>
              </YStack>
              
              {/* Final Total */}
              <XStack justify="space-between" pt="$2" borderTopWidth={1} borderTopColor="#EDEDED">
                <Text fontSize="$5" fontWeight="bold" color="#d97706">
                  Amount to Pay:
                </Text>
                <Text fontSize="$5" fontWeight="bold" color="#FF6B00">
                  ${orderCalculations.total.toFixed(2)}
                </Text>
              </XStack>
            </YStack>
          </View>

          {!canCheckout ? (
            // Show error message when checkout is not allowed
            <YStack space="$4" p="$4" background="#fef2f2" style={{ borderRadius: 8, borderWidth: 1, borderColor: "#fecaca" }}>
              <XStack items="center" gap="$2">
                <Text fontSize="$4" fontWeight="600" color="#dc2626">
                  Order Cannot Be Completed
                </Text>
              </XStack>
              <Text fontSize="$3" color="#dc2626">
                {checkoutError}
              </Text>
              {deliveryMessages.length > 0 && (
                <YStack space="$2">
                  <Text fontSize="$3" fontWeight="600" color="#dc2626">
                    Delivery Information:
                  </Text>
                  {deliveryMessages.map((message, index) => (
                    <Text key={index} fontSize="$2" color="#dc2626" pl="$2">
                      • {message}
                    </Text>
                  ))}
                </YStack>
              )}
              <Text fontSize="$3" color="#dc2626" fontStyle="italic">
                Please add more items to your order to meet the minimum order requirement.
              </Text>
            </YStack>
          ) : clientSecret ? (
            // Show payment methods when checkout is allowed
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
          ) : (
            // Show loading state
            <YStack space="$4" p="$4" items="center">
              <Text fontSize="$3" color="#6b7280">
                Preparing payment...
              </Text>
            </YStack>
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
