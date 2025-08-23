import { useEffect, useMemo, useState, useCallback } from 'react'
import { useStore } from 'app/src/store/useStore'
import { apiCreateSecureOrder, apiCheckPaymentStatus } from 'app/services/OrderService'
import { apiClearCart } from 'app/services/CartService'
import { useToast } from '../useToast'
import { MapPin, Plus, CreditCard as CreditCardIcon, Smartphone } from '@tamagui/lucide-icons'
import { Button, ScrollView, styled, Text, View, XStack, YStack } from 'tamagui'
import {
  useStripe,
  PlatformPay,
  PlatformPayButton,
  isPlatformPaySupported,
  usePlatformPay,
} from '@stripe/stripe-react-native'
import { useLink } from 'solito/navigation'

import PaymentStatusPopup from './PaymentStatusPopup'
import { useScreen } from 'app/hook/useScreen'
import { CheckoutStep } from './CheckoutSteps'
import { colors } from '../colors'

export default function PaymentPageNative({
  onPaymentSuccess,
  onPaymentError,
  onOrderCreated,
  selectedAddress,
  goBack,
}: any) {
  const { cart, cartTotalAmount,fetchCart ,setSuccessOrderId} = useStore()

  const { showMessage } = useToast()
  const { initPaymentSheet, presentPaymentSheet } = useStripe()
  const { confirmPlatformPayPayment } = useStripe()
  const { isMobile, isMobileWeb } = useScreen()

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | null>(
    null
  )
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const [platformPayReady, setPlatformPayReady] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState<string | null>(null)
  const succesPage = useLink({
    href: "/checkout/success"
  
  })
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

  useEffect(() => {
    ;(async () => {
      try {
        const supported = await isPlatformPaySupported()
        setPlatformPayReady(!!supported)
      } catch {
        setPlatformPayReady(false)
      }
    })()
  }, [])
console.log("clientSecret")
console.log(clientSecret)
  // Fallback: Stripe Payment Sheet (cards, Link, wallets)
  const onPay = useCallback(async () => {
    if (!selectedAddress || !cart||!clientSecret||!completedOrderId) return
    try {
      setProcessing(true)
      setError(null)
      
      // Step 1: Create secure order (validates cart, stock, pricing server-side)
      // const orderResponse: any = await apiCreateSecureOrder({
        //   deliveryAddress: selectedAddress._id,
        //   currency: 'usd',
        // })
        
        // if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
          //   throw new Error(orderResponse?.error || 'Failed to create order')
          // }
          
          // const { orderId, clientSecret, totalAmount } = orderResponse.data
          // setCompletedOrderId(orderId)
          
          // Step 2: Initialize Stripe Payment Sheet
          const { error: sheetError,paymentOption } = await initPaymentSheet({
            merchantDisplayName: 'NikFoods',
            paymentIntentClientSecret: clientSecret,
            applePay: { merchantCountryCode: 'US' },
            googlePay: { merchantCountryCode: 'US', currencyCode: 'USD' },
            allowsDelayedPaymentMethods: false,
          })
          
          if (sheetError) {
console.log("sheetError")
console.log(sheetError)

            throw new Error(sheetError.message)
          }
          
          // Step 3: Present payment sheet
          const { error: presentError } = await presentPaymentSheet()
          if (presentError) {
            console.log("presentError")
            console.log(presentError)
            throw new Error(presentError.message)
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

          console.log("----------------orderId")
          console.log(completedOrderId)
          console.log(attempts)
          const statusResponse: any = await apiCheckPaymentStatus(completedOrderId??"")
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
setSuccessOrderId(completedOrderId)

      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError)
      }

      setPaymentStatus('success')
      showMessage('Payment successful', 'success')
      onPaymentSuccess?.({ completedOrderId, total: totalAmount })
      onOrderCreated?.(completedOrderId)
      succesPage.onPress()

    } catch (e: any) {
      console.error('Payment error:', e)
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
      onPaymentError?.(e)
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

  // Native Apple Pay / Google Pay using confirmPlatformPayPayment
  const onExpressPay = useCallback(async () => {
        if (!selectedAddress || !cart||!clientSecret||!completedOrderId) return

    try {
      setProcessing(true)
      setError(null)
      
      // Step 1: Create secure order
      // const orderResponse: any = await apiCreateSecureOrder({
        //   deliveryAddress: selectedAddress._id,
        //   currency: 'usd',
        // })
        
        // if (!orderResponse?.success || !orderResponse?.data?.clientSecret) {
          //   throw new Error(orderResponse?.error || 'Failed to create order')
          // }
          
          // const { orderId, clientSecret, totalAmount } = orderResponse.data
          // setCompletedOrderId(orderId)
          
          // Step 2: Confirm platform pay payment
          const { error: platformError } = await confirmPlatformPayPayment(clientSecret, {
        googlePay: {
          testEnv: true,
          merchantName: 'NikFoods',
          merchantCountryCode: 'US',
          currencyCode: 'USD',
          billingAddressConfig: {
            format: PlatformPay.BillingAddressFormat.Full,
            isPhoneNumberRequired: true,
            isRequired: true,
          },
        },
      })
      if (platformError) throw new Error(platformError.message)
        
        setPaymentStatus('processing')
    // Step 3: Wait for webhook confirmation (poll for payment status)
      let paymentConfirmed = false
      let attempts = 0
      const maxAttempts = 30 // 30 seconds max wait time

      while (!paymentConfirmed && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
        attempts++

        try {

          console.log("----------------orderId")
          console.log(completedOrderId)
          console.log(attempts)
          const statusResponse: any = await apiCheckPaymentStatus(completedOrderId??"")
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
setSuccessOrderId(completedOrderId)
      } catch (clearError) {
        console.warn('Failed to clear cart:', clearError)
      }

      setPaymentStatus('success')
      showMessage('Payment successful', 'success')
      onPaymentSuccess?.({ completedOrderId, total: totalAmount })
      onOrderCreated?.(completedOrderId)
      succesPage.onPress()
    } catch (e: any) {
      console.error('Payment error:', e)
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
      onPaymentError?.(e)
    } finally {
      setProcessing(false)
    }
  }, [
    cart,
    selectedAddress,
    orderCalculations,
    showMessage,
    onPaymentSuccess,
    onPaymentError,
    onOrderCreated,
    confirmPlatformPayPayment,
  ])

  return (
    <ScrollView flex={1} showsVerticalScrollIndicator={false}>
      <YStack
        space={isMobile || isMobileWeb ? '$1' : '$4'}
        p={isMobile || isMobileWeb ? '$1' : '$4'}
      >
        <YStack
          style={{
            alignItems: isMobile ? 'flex-start' : 'center',
            marginBottom: 8,
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
            >
              Edit address
            </Text>
          </XStack>
        </YStack>

        {/* Order Summary with Cart Items */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 10,
            padding: isMobile ? 12 : 16,
            borderWidth: 1,
            borderColor: '#EDEDED',
            marginTop: isMobile ? 12 : 16,
          }}
        >
          <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="600" mb="$3">
            Order Summary
          </Text>

          <XStack justifyContent="space-between" alignItems="center" mb="$2">
            <Text fontSize={isMobile ? '$3' : '$4'}>Delivery to:</Text>
            <Text
              fontWeight="500"
              fontSize={isMobile ? '$3' : '$4'}
              text={isMobile ? 'right' : 'left'}
            >
              {selectedAddress?.location_remark || 'Selected Address'}
            </Text>
          </XStack>

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
        </View>
        <YStack mt={16} space="$3">
          {error && <Text color="#C53030">{error}</Text>}

          {platformPayReady && (
            <PlatformPayButton
              onPress={onExpressPay}
              type={PlatformPay.ButtonType.Pay}
              appearance={PlatformPay.ButtonStyle.Black}
              borderRadius={8}
              style={{ width: '100%', height: 44 }}
              disabled={processing}
            />
          )}

          <Button
            onPress={onPay}
            disabled={processing}
            style={{ backgroundColor: colors.primary }}
            color="white"
          >
            {processing ? 'Processing...' : 'Other Payment Options'}
          </Button>

          <PaymentStatusPopup
            paymentStatus={paymentStatus}
            completedOrderId={completedOrderId}
            setPaymentStatus={setPaymentStatus}
          />
        </YStack>
      </YStack>
    </ScrollView>
  )
}
