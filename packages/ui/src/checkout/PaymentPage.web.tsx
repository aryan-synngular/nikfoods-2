import { useCallback, useEffect, useMemo, useState } from 'react'
import { useScreen } from 'app/hook/useScreen'
import { useStore } from 'app/src/store/useStore'
import { apiCreateSecureOrder } from 'app/services/OrderService'
import { apiClearCart } from 'app/services/CartService'
import { useToast } from '../useToast'
import { useSearchParams } from 'next/navigation'
import {
  CardElement,
  Elements,
  PaymentRequestButtonElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import type { PaymentRequest as StripePaymentRequest } from '@stripe/stripe-js'
import { View, Text, Button } from 'tamagui'

function PaymentFormInner({
  selectedAddress,
  goBack,
  onPaymentSuccess,
  onPaymentError,
  onOrderCreated,
}: any) {
  const { cart } = useStore()
  const { showMessage } = useToast()
  const sp = useSearchParams()
  const token = sp.get('token') || undefined
  const stripe = useStripe()
  const elements = useElements()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)

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

  // Initialize Payment Request (Apple Pay / Google Pay) when supported
  useEffect(() => {
    if (!stripe || !orderCalculations?.total) return
    const amountCents = Math.max(0, Math.round(orderCalculations.total * 100))

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'NikFoods Order', amount: amountCents },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    })

    pr.canMakePayment().then((result) => {
      if (result) {
        setPaymentRequest(pr)
      } else {
        setPaymentRequest(null)
      }
    })

    return () => {
      setPaymentRequest(null)
    }
  }, [stripe, orderCalculations])

  // Attach handler for Payment Request flow
  useEffect(() => {
    if (!paymentRequest || !stripe) return

    const handler = async (ev: any) => {
      setProcessing(true)
      setError(null)
      try {
        // Step 1: Create secure order
        const orderResponse: any = await apiCreateSecureOrder(
          {
            deliveryAddress: selectedAddress._id,
            currency: 'usd',
          },
          token
        )

        if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
          ev.complete('fail')
          throw new Error(orderResponse?.error || 'Failed to create order')
        }

        const { orderId, clientSecret } = orderResponse.data
        setCurrentOrderId(orderId)

        // Step 2: Confirm payment
        const confirmParams = { payment_method: ev.paymentMethod.id }
        const { error: confirmError } = await stripe.confirmCardPayment(
          clientSecret,
          confirmParams,
          { handleActions: false }
        )
        if (confirmError) {
          ev.complete('fail')
          throw new Error(confirmError.message)
        }

        ev.complete('success')
        const finalResult = await stripe.confirmCardPayment(clientSecret)
        if (finalResult.error) {
          throw new Error(finalResult.error.message || 'Payment failed')
        }

        // Step 3: Payment successful - clear cart and notify
        try {
          await apiClearCart(token)
        } catch (clearError) {
          console.warn('Failed to clear cart:', clearError)
        }

        showMessage('Payment successful', 'success')
        if (onPaymentSuccess) onPaymentSuccess({ orderId, total: orderCalculations.total })
        if (onOrderCreated) onOrderCreated(orderId)
      } catch (e: any) {
        setError(e?.message || 'Payment failed')
        if (onPaymentError) onPaymentError(e)
      } finally {
        setProcessing(false)
      }
    }

    paymentRequest.on('paymentmethod', handler)
    return () => {
      paymentRequest.off('paymentmethod', handler)
    }
  }, [
    paymentRequest,
    stripe,
    token,
    selectedAddress,
    orderCalculations,
    onPaymentError,
    onPaymentSuccess,
    onOrderCreated,
    showMessage,
  ])

  const onPay = useCallback(async () => {
    if (!stripe || !elements) return
    if (!selectedAddress || !cart) return

    setProcessing(true)
    setError(null)
    try {
      // Step 1: Create secure order
      const orderResponse: any = await apiCreateSecureOrder(
        {
          deliveryAddress: selectedAddress._id,
          currency: 'usd',
        },
        token
      )

      if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
        throw new Error(orderResponse?.error || 'Failed to create order')
      }

      const { orderId, clientSecret, totalAmount } = orderResponse.data
      setCurrentOrderId(orderId)

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
        throw new Error(confirmResult.error.message || 'Payment failed')
      }

      // Step 3: Payment successful - clear cart and notify
      try {
        await apiClearCart(token)
      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError)
      }

      showMessage('Payment successful', 'success')
      if (onPaymentSuccess) onPaymentSuccess({ orderId, total: totalAmount })
      if (onOrderCreated) onOrderCreated(orderId)
    } catch (e: any) {
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
    token,
    orderCalculations,
    onPaymentError,
    onPaymentSuccess,
    onOrderCreated,
    showMessage,
  ])

  return (
    <View
      style={{
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EDEDED',
        marginTop: 4,
        width: 500,
      }}
    >
      {paymentRequest ? (
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: { paymentRequestButton: { type: 'buy', theme: 'dark', height: '44px' } },
          }}
        />
      ) : null}
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
        background="#FF6B00"
        color="white"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </Button>
      <Text mt="$3" color="#6C757D">
        Final Total: {orderCalculations.total.toFixed(2)}
      </Text>
    </View>
  )
}

export default function PaymentPageWeb(props: any) {
  const stripePromise = useMemo(
    () => loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''),
    []
  )
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner {...props} />
    </Elements>
  )
}
