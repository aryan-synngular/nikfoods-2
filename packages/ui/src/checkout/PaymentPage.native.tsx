import { useEffect, useMemo, useState, useCallback } from 'react'
import { useStore } from 'app/src/store/useStore'
import { apiCheckout, apiCreateOrder } from 'app/services/OrderService'
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
import PaymentStatusPopup from './PaymentStatusPopup'
import { useScreen } from 'app/hook/useScreen'
import { CheckoutStep } from './CheckoutSteps'
import { colors } from '../colors'

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
export default function PaymentPageNative({
  onPaymentSuccess,
  onPaymentError,
  onOrderCreated,
  selectedAddress,
  goBack,
}: any) {
  const { cart, cartTotalAmount } = useStore()

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

  // Fallback: Stripe Payment Sheet (cards, Link, wallets)
  const onPay = useCallback(async () => {
    if (!selectedAddress || !cart) return
    try {
      setProcessing(true)
      setError(null)

      const orderData = buildOrderPayload()
      if (!orderData) throw new Error('Unable to process cart data')

      const { data: orderResponse } = await apiCreateOrder(orderData)
      const orderId = orderResponse?._id

      const init: any = await apiCheckout<{ success: boolean; clientSecret?: string }>({
        amount: Math.round(orderCalculations.total * 100),
        orderId,
        currency: 'usd',
      })
      if (!init?.success || !init.clientSecret) throw new Error('Failed to initialize payment')

      const { error: sheetError } = await initPaymentSheet({
        merchantDisplayName: 'NikFoods',
        paymentIntentClientSecret: init.clientSecret,
        allowsDelayedPaymentMethods: false,
      })
      if (sheetError) throw new Error(sheetError.message)

      const { error: presentError } = await presentPaymentSheet()
      if (presentError) throw new Error(presentError.message)

      await apiClearCart()
      setCompletedOrderId(orderId)
      setPaymentStatus('success')
      showMessage('Payment successful', 'success')
      onPaymentSuccess?.({ orderId, total: orderCalculations.total })
      onOrderCreated?.(orderId)
    } catch (e: any) {
      console.error(e)
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
      onPaymentError?.(e)
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

  // Native Apple Pay / Google Pay using confirmPlatformPayPayment
  const onExpressPay = useCallback(async () => {
    if (!selectedAddress || !cart) return
    try {
      setProcessing(true)
      setError(null)

      const orderData = buildOrderPayload()
      if (!orderData) throw new Error('Unable to process cart data')

      const { data: orderResponse } = await apiCreateOrder(orderData)
      const orderId = orderResponse?._id

      const init: any = await apiCheckout<{ success: boolean; clientSecret?: string }>({
        amount: Math.round(orderCalculations.total * 100),
        orderId,
        currency: 'usd',
      })
      if (!init?.success || !init.clientSecret) throw new Error('Failed to initialize payment')

      const { error: platformError } = await confirmPlatformPayPayment(init.clientSecret, {
        // applePay: {
        //   cartItems: [
        //     {
        //       label: 'NikFoods Order',
        //       amount: orderCalculations.total.toFixed(2),
        //       type: PlatformPay.PaymentSummaryItemType.Final,
        //     },
        //   ],
        //   merchantCountryCode: 'US',
        //   currencyCode: 'USD',
        // },
        googlePay: {
          testEnv: true,
          merchantName: 'My merchant name',
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

      await apiClearCart()
      setCompletedOrderId(orderId)
      setPaymentStatus('success')
      showMessage('Payment successful', 'success')
      onPaymentSuccess?.({ orderId, total: orderCalculations.total })
      onOrderCreated?.(orderId)
    } catch (e: any) {
      console.error(e)
      setPaymentStatus('failed')
      setError(e?.message || 'Payment failed')
      onPaymentError?.(e)
    } finally {
      setProcessing(false)
    }
  }, [
    cart,
    selectedAddress,
    buildOrderPayload,
    orderCalculations,
    showMessage,
    onPaymentSuccess,
    onPaymentError,
    onOrderCreated,
    confirmPlatformPayPayment,
  ])

  return (
    <ScrollView flex={1} showsVerticalScrollIndicator={false}>
      <YStack space={isMobile || isMobileWeb ? '$1' : '$4'} p={isMobile || isMobileWeb ? '$1' : '$4'}>
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
          <XStack width={"100%"} justify={"flex-end"}>

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

          <Button onPress={onPay} disabled={processing} style={{backgroundColor:colors.primary}}  color="white">
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
