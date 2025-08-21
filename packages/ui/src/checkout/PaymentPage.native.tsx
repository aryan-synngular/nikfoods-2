import { useEffect, useMemo, useState, useCallback } from 'react'
import { useStore } from 'app/src/store/useStore'
import { apiCreateSecureOrder } from 'app/services/OrderService'
import { apiClearCart } from 'app/services/CartService'
import { useToast } from '../useToast'
import { Button, Text, YStack } from 'tamagui'
import { useStripe } from '@stripe/stripe-react-native'

export default function PaymentPageNative({
  selectedAddress,
  onPaymentSuccess,
  onPaymentError,
  onOrderCreated,
}: any) {
  const { cart } = useStore()
  const { showMessage } = useToast()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const onPay = useCallback(async () => {
    if (!selectedAddress || !cart) return

    try {
      setProcessing(true)
      setError(null)

      // Step 1: Create secure order (validates cart, stock, pricing server-side)
      const orderResponse: any = await apiCreateSecureOrder({
        deliveryAddress: selectedAddress._id,
        currency: 'usd',
      })

      if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
        throw new Error(orderResponse?.error || 'Failed to create order')
      }

      const { orderId, clientSecret, totalAmount } = orderResponse.data
      setCurrentOrderId(orderId)

      // Step 2: Initialize Stripe Payment Sheet
      const { error: sheetError } = await initPaymentSheet({
        merchantDisplayName: 'NikFoods',
        paymentIntentClientSecret: clientSecret,
        applePay: { merchantCountryCode: 'US' },
        googlePay: { merchantCountryCode: 'US', currencyCode: 'USD' },
        allowsDelayedPaymentMethods: false,
      })

      if (sheetError) {
        throw new Error(sheetError.message)
      }

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet()
      if (presentError) {
        throw new Error(presentError.message)
      }

      // Step 4: Payment successful - clear cart and notify
      try {
        await apiClearCart()
      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError)
      }

      showMessage('Payment successful', 'success')
      if (onPaymentSuccess) onPaymentSuccess({ orderId, total: totalAmount })
      if (onOrderCreated) onOrderCreated(orderId)
    } catch (e: any) {
      console.error('Payment error:', e)
      setError(e?.message || 'Payment failed')
      if (onPaymentError) onPaymentError(e)
    } finally {
      setProcessing(false)
    }
  }, [
    cart,
    selectedAddress,
    orderCalculations,
    initPaymentSheet,
    presentPaymentSheet,
    showMessage,
    onPaymentSuccess,
    onPaymentError,
    onOrderCreated,
  ])

  return (
    <YStack space="$3">
      {error && <Text color="#C53030">{error}</Text>}

      <Button onPress={onPay} disabled={processing} background="#FF6B00" color="white">
        {processing ? 'Processing...' : 'Pay'}
      </Button>

      <Text color="#6C757D">Final Total: {orderCalculations.total.toFixed(2)}</Text>
    </YStack>
  )
}
