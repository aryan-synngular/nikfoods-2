import { useEffect, useMemo, useState, useCallback } from 'react'
import { apiCreateSecureOrderForUpdate, apiCheckPaymentStatus, apiGetUpdateOrderDetails } from 'app/services/OrderService'
import { apiUpdateOrderItems } from 'app/services/OrderService'
import { useToast } from '../useToast'
import { CreditCard as CreditCardIcon } from '@tamagui/lucide-icons'
import { Button, ScrollView, Text, View, XStack, YStack, Spinner } from 'tamagui'
import { useLink } from 'solito/navigation'
import { createParam } from 'solito'
import {
  useStripe,
  PlatformPay,
  PlatformPayButton,
  isPlatformPaySupported,
  usePlatformPay,
} from '@stripe/stripe-react-native'
import PaymentStatusPopup from './PaymentStatusPopup'
import { useScreen } from 'app/hook/useScreen'
import { colors } from '../colors'
import { useStore } from 'app/src/store/useStore'

// Only import Stripe React Native on actual native platforms

export default function UpdateOrderNative() {
  const { useParam } = createParam<{ updatingOrderId: string }>()
  const [updatingOrderId] = useParam('updatingOrderId')
  console.log("updatingOrder")
  console.log(useParam('updatingOrderId'))
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
  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [paymentAlreadyCompleted, setPaymentAlreadyCompleted] = useState<boolean>(false)
    const { setSuccessOrderId} = useStore()

  const successPage = useLink({
    href: '/checkout/success',
  })
const homePage = useLink({
    href: '/',
  })
  useEffect(() => {
    const run = async () => {
      if (!updatingOrderId) return
      setLoading(true)
      setDataError(null)
      try {
        // Load updating order data
          const orderData = await apiGetUpdateOrderDetails(updatingOrderId)
                console.log(orderData)
        
                if (!orderData?.success) {
                  throw new Error(orderData?.error || 'Failed to load updating order')
                }
        // Check if payment is already completed
        setData(orderData?.data ?? null)

        const updatingOrder = orderData?.data?.updatingOrder
        if (updatingOrder?.paymentStatus === 'paid') {
          setPaymentAlreadyCompleted(true)
          setLoading(false)
          return
        }

        // Create secure payment intent only if payment is not already completed
        const orderResponse = await apiCreateSecureOrderForUpdate({
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
        setDataError(e?.error || e?.message || 'Failed to load')
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

  console.log('clientSecret')
  console.log(clientSecret)

  // Fallback: Stripe Payment Sheet (cards, Link, wallets)
  const onPay = useCallback(async () => {
    if (!updatingOrderId || !clientSecret || !completedOrderId) return
    try {
      setProcessing(true)
      setError(null)

      // Step 2: Initialize Stripe Payment Sheet
      const { error: sheetError } = await initPaymentSheet({
        merchantDisplayName: 'NikFoods',
        paymentIntentClientSecret: clientSecret,
        applePay: { merchantCountryCode: 'US' },
        googlePay: { merchantCountryCode: 'US', currencyCode: 'USD' },
        allowsDelayedPaymentMethods: false,
      })

      if (sheetError) {
        console.log('sheetError')
        console.log(sheetError)
        throw new Error(sheetError.message)
      }

      // Step 3: Present payment sheet
      const { error: presentError } = await presentPaymentSheet()
      if (presentError) {
        console.log('presentError')
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
          console.log('----------------orderId')
          console.log(completedOrderId)
          console.log(attempts)
          const statusResponse: any = await apiCheckPaymentStatus(completedOrderId ?? '')
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
setSuccessOrderId(completedOrderId)
      // setPaymentStatus('success')
      showMessage('Payment successful. Your order update will be applied shortly.', 'success')
      successPage.onPress()
    } catch (e: any) {
      console.error('Payment error:', e)
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }, [
    updatingOrderId,
    clientSecret,
    completedOrderId,
    initPaymentSheet,
    presentPaymentSheet,
    showMessage,
  ])

  // Native Apple Pay / Google Pay using confirmPlatformPayPayment
  const onExpressPay = useCallback(async () => {
    if (!updatingOrderId || !clientSecret || !completedOrderId) return

    try {
      setProcessing(true)
      setError(null)

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
          console.log('----------------orderId')
          console.log(completedOrderId)
          console.log(attempts)
          const statusResponse: any = await apiCheckPaymentStatus(completedOrderId, {
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
setSuccessOrderId(completedOrderId)

      // setPaymentStatus('success')
      showMessage('Payment successful. Your order update will be applied shortly.', 'success')
      successPage.onPress()
    } catch (e: any) {
      console.error('Payment error:', e)
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }, [updatingOrderId, clientSecret, completedOrderId, showMessage, confirmPlatformPayPayment])

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

  if (dataError || !updatingOrder) {
    return (
      <View flex={1} justify="center" items="center" p="$4">
        <Text fontSize="$4" color="#C53030">
          {dataError || 'No updating order found'}
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
       homePage.onPress()

            }} style={{backgroundColor:colors.primary}} hoverStyle={{background:colors.primary}}   color={"white"} size={"$4"}>
              Go To Home
            </Button>
          </YStack>
        </View>
      </View>
    )
  }

  return (
    <ScrollView height={"100%"} flex={1} showsVerticalScrollIndicator={false}>
      <YStack
      space={isMobile || isMobileWeb ? '$1' : '$4'}
      p={isMobile || isMobileWeb ? '$4' : '$4'}
      mt={40}
      >
        <YStack
          style={{
            justifyContent:"center",
            alignItems:'center',
            marginBottom: 8,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
            gap: isMobile ? 8 : 0,
          }}
        >
          <YStack space="$3" items="center">
            <CreditCardIcon size={32} color="#FF6B00" />
            <Text fontSize="$6" fontWeight="bold" color="#1F2937" text="center">
              Complete Order Update Payment
            </Text>
            <Text fontSize="$4" color="#6B7280" text="center">
              Pay the difference to update your order
            </Text>
          </YStack>
        </YStack>

        {/* Order Summary */}
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
                ${orderCalculations.total.toFixed(2)}
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
