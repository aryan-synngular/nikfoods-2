import { useEffect, useMemo, useState, useCallback } from 'react'
import { useStore } from 'app/src/store/useStore'
import { apiCheckout, apiCreateOrder } from 'app/services/OrderService'
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

  const buildOrderPayload = useCallback(() => {
    if (!cart?.days || !selectedAddress) return null
    return {
      items: cart.days
        .filter((d) => d.items.length > 0)
        .map((day) => ({
          day: day.day,
          deliveryDate: day.date,
          items: day.items.map((it) => ({
            food: it.food._id,
            quantity: it.quantity,
            price: it.food.price,
          })),
          dayTotal: day.items.reduce((acc, it) => acc + it.food.price * it.quantity, 0),
        })),
      deliveryAddress: selectedAddress?._id,
      paymentMethod: 'Credit Card',
      customerDetails: {
        name: selectedAddress?.name,
        email: selectedAddress?.email,
        phone: selectedAddress?.phone,
      },
    }
  }, [cart, selectedAddress])

  const onPay = useCallback(async () => {
    if (!selectedAddress || !cart) return
    try {
      setProcessing(true)
      setError(null)

      const orderData = buildOrderPayload()
      if (!orderData) throw new Error('Unable to process cart data')
      const orderResponse: any = await apiCreateOrder(orderData)
      const orderId = orderResponse?.data?._id

      const init: any = await apiCheckout<{ success: boolean; clientSecret?: string }>({
        amount: Math.round(orderCalculations.total * 100),
        orderId,
        currency: 'usd',
      })
      if (!init?.success || !init?.clientSecret) throw new Error('Failed to initialize payment')

      const { error: sheetError } = await initPaymentSheet({
        merchantDisplayName: 'NikFoods',
        paymentIntentClientSecret: init.clientSecret,
        applePay: { merchantCountryCode: 'US' },
        googlePay: { merchantCountryCode: 'US', currencyCode: 'USD' },
        allowsDelayedPaymentMethods: false,
      })
      if (sheetError) throw new Error(sheetError.message)

      const { error: presentError } = await presentPaymentSheet()
      if (presentError) throw new Error(presentError.message)

      try {
        await apiClearCart()
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
    cart,
    selectedAddress,
    buildOrderPayload,
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
