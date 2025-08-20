import { useCallback, useEffect, useMemo, useState } from 'react'
import { useScreen } from 'app/hook/useScreen'
import { useStore } from 'app/src/store/useStore'
import { apiCheckout, apiCreateOrder } from 'app/services/OrderService'
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
console.log(paymentRequest)
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

  const transformCartToOrder = useCallback(() => {
    if (!cart?.days || !selectedAddress) return null
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

  // Initialize Payment Request (Apple Pay / Google Pay) when supported
  useEffect(() => {
    if (!stripe || !orderCalculations?.total) return
    const amountCents = Math.max(0, Math.round(orderCalculations.total * 100))
    // country/currency should match your Stripe account configuration
    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: { label: 'NikFoods Order', amount: 400 },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    })
console.log(pr)
    pr.canMakePayment().then((result) => {
      console.log(result)
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
        const orderData = transformCartToOrder()
        if (!orderData) throw new Error('Unable to process cart data')
        const orderResponse: any = await apiCreateOrder(orderData, token)
        const orderId = orderResponse?.data?._id

        const init: any = await apiCheckout<{ success: boolean; clientSecret?: string }>(
          {
            amount: Math.round(orderCalculations.total * 100),
            orderId,
          },
          token
        )
        if (!init?.success || !init?.clientSecret) throw new Error('Failed to initialize payment')

        const confirmParams = { payment_method: ev.paymentMethod.id }
        const { error: confirmError } = await stripe.confirmCardPayment(
          init.clientSecret,
          confirmParams,
          { handleActions: false }
        )
        if (confirmError) {
          ev.complete('fail')
          throw new Error(confirmError.message)
        }

        ev.complete('success')
        const finalResult = await stripe.confirmCardPayment(init.clientSecret)
        if (finalResult.error) {
          throw new Error(finalResult.error.message || 'Payment failed')
        }

        try {
          await apiClearCart(token)
        } catch {}

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
    transformCartToOrder,
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
      const orderData = transformCartToOrder()
      if (!orderData) throw new Error('Unable to process cart data')
      const orderResponse: any = await apiCreateOrder(orderData, token)
      const orderId = orderResponse?.data?._id

      const init: any = await apiCheckout<{ success: boolean; clientSecret?: string }>(
        {
          amount: Math.round(orderCalculations.total * 100),
          orderId,
        },
        token
      )
      if (!init?.success || !init?.clientSecret) throw new Error('Failed to initialize payment')

      const card = elements.getElement(CardElement)
      if (!card) throw new Error('Card element not found')

      const confirmResult = await stripe.confirmCardPayment(init.clientSecret, {
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

      try {
        await apiClearCart(token)
      } catch {}

      showMessage('Payment successful', 'success')
      if (onPaymentSuccess) onPaymentSuccess({ orderId, total: orderCalculations.total })
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
    transformCartToOrder,
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
