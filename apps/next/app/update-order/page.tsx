'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  apiGetUpdatingOrderById,
  apiCheckout,
  apiUpdateOrderItems,
} from 'app/services/OrderService'
import { PaymentForm, CreditCard, GooglePay, ApplePay } from 'react-square-web-payments-sdk'
import { useToast } from '@my/ui/src/useToast'
import { View, Text, YStack, XStack, Spinner, Button } from 'tamagui'
import { CreditCard as CreditCardIcon } from '@tamagui/lucide-icons'
import PaymentStatusPopup from '@my/ui/src/checkout/PaymentStatusPopup'

export default function UpdateOrderPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const updatingOrderId = sp?.get('updatingOrderId') || ''

  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'processing' | 'success' | 'failed' | null>(
    null
  )
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null)
  const { info, success, error: showError } = useToast()

  useEffect(() => {
    const run = async () => {
      if (!updatingOrderId) return
      setLoading(true)
      setError(null)
      try {
        const res = await apiGetUpdatingOrderById<{ success: boolean; data?: any }>(updatingOrderId)
        setData(res?.data ?? null)
      } catch (e: any) {
        setError(e?.error || 'Failed to load')
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

    const subtotal = days.reduce((acc: number, day: any) => {
      if (typeof day?.dayTotal === 'number') return acc + day.dayTotal
      const itemsTotal = (day?.items || []).reduce((itemAcc: number, item: any) => {
        return itemAcc + (item?.price || 0) * (item?.quantity || 0)
      }, 0)
      return acc + itemsTotal
    }, 0)

    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = subtotal > 100 ? 10.0 : 5.0
    const taxes = subtotal * 0.1
    const total = subtotal + platformFee + deliveryFee - discountAmount + taxes

    return { subtotal, platformFee, deliveryFee, discountAmount, taxes, total }
  }, [updatingOrder])

  const appId = 'sandbox-sq0idb--7LNP6X3I9DoOMOGUjwokg'
  const locationId = 'LFH3Z9618P0SA'

  const handlePaymentToken = useCallback(
    async (token: any, buyer: any) => {
      if (!updatingOrder?._id) {
        setPaymentError('Missing updating order information')
        return
      }

      setIsProcessingPayment(true)
      setPaymentError(null)
      setPaymentStatus('processing')

      try {
        info('Processing payment...')
        const paymentResponse: any = await apiCheckout({
          sourceId: token?.token || '',
          amount: Math.round(orderCalculations.total * 100),
          orderId: updatingOrder._id,
          buyerVerificationToken: buyer?.verificationToken,
        })

        if (paymentResponse?.success) {
          await apiUpdateOrderItems<{ success: boolean; updatedTotal?: number }>({
            updatingOrderId,
          })
          setPaymentStatus('success')
          setCompletedOrderId(updatingOrder._id)
          success('Payment successful. Your order update will be applied shortly.')
        } else {
          throw new Error(paymentResponse?.message || 'Payment processing failed')
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Payment failed. Please try again.'
        setPaymentError(errorMessage)
        setPaymentStatus('failed')
        setCompletedOrderId(updatingOrder._id)
        showError(errorMessage)
      } finally {
        setIsProcessingPayment(false)
      }
    },
    [updatingOrder, orderCalculations, info, success, showError, router]
  )

  if (loading) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" p="$4">
        <YStack space="$3" alignItems="center">
          <Spinner size="large" color="#FF6B00" />
          <Text fontSize="$4">Loading updating order...</Text>
        </YStack>
      </View>
    )
  }

  if (error || !updatingOrder) {
    return (
      <View flex={1} justifyContent="center" alignItems="center" p="$4">
        <Text fontSize="$4" color="#C53030">
          {error || 'No updating order found'}
        </Text>
      </View>
    )
  }

  return (
    <View flex={1} backgroundColor="#F8F9FA" justifyContent="center" alignItems="center" p="$4">
      <View width="100%" maxWidth={700}>
        <YStack space="$4">
          {/* Header */}
          <YStack space="$3" alignItems="center">
            <CreditCardIcon size={32} color="#FF6B00" />
            <Text fontSize="$6" fontWeight="bold" color="#1F2937" textAlign="center">
              Complete Order Update Payment
            </Text>
            <Text fontSize="$4" color="#6B7280" textAlign="center">
              Pay the difference to update your order
            </Text>
          </YStack>

          {/* Order Summary */}
          <View
            backgroundColor="white"
            borderRadius="$4"
            p="$4"
            borderWidth={1}
            borderColor="#EDEDED"
          >
            <Text fontSize="$5" fontWeight="600" marginBottom="$3">
              Order Summary
            </Text>

            <YStack space="$1" paddingTop="$2" borderTopWidth={1} borderTopColor="#EDEDED">
              <XStack justifyContent="space-between">
                <Text fontSize="$3">Subtotal:</Text>
                <Text fontSize="$3">${orderCalculations.subtotal.toFixed(2)}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize="$3">Platform Fee:</Text>
                <Text fontSize="$3">${orderCalculations.platformFee.toFixed(2)}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize="$3">Delivery Fee:</Text>
                <Text fontSize="$3">${orderCalculations.deliveryFee.toFixed(2)}</Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize="$3" color="#00AA00">
                  Discount:
                </Text>
                <Text fontSize="$3" color="#00AA00">
                  -${orderCalculations.discountAmount.toFixed(2)}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text fontSize="$3">Taxes:</Text>
                <Text fontSize="$3">${orderCalculations.taxes.toFixed(2)}</Text>
              </XStack>
              <XStack
                justifyContent="space-between"
                paddingTop="$2"
                borderTopWidth={1}
                borderTopColor="#EDEDED"
              >
                <Text fontSize="$5" fontWeight="bold">
                  Final Total:
                </Text>
                <Text fontSize="$5" fontWeight="bold" color="#FF6B00">
                  ${orderCalculations.total.toFixed(2)}
                </Text>
              </XStack>
            </YStack>
          </View>

          {/* Payment Error Display */}
          {paymentError && (
            <View
              padding="$3"
              backgroundColor="#FEE"
              borderRadius="$3"
              borderWidth={1}
              borderColor="#FCC"
            >
              <Text color="#C53030" fontSize="$4">
                {paymentError}
              </Text>
            </View>
          )}

          {/* Payment Form */}
          <View
            backgroundColor="white"
            borderRadius="$4"
            p="$4"
            borderWidth={1}
            borderColor="#EDEDED"
          >
            <Text fontSize="$5" fontWeight="600" marginBottom="$4">
              Payment Details
            </Text>

            {isProcessingPayment && (
              <View padding="$3" backgroundColor="#E6F3FF" borderRadius="$3" marginBottom="$3">
                <XStack space="$2" alignItems="center">
                  <Spinner size="small" color="#0066CC" />
                  <Text color="#0066CC" fontSize="$4">
                    Processing your order and payment...
                  </Text>
                </XStack>
              </View>
            )}

            <View opacity={isProcessingPayment ? 0.5 : 1}>
              <PaymentForm
                applicationId={appId}
                locationId={locationId}
                cardTokenizeResponseReceived={handlePaymentToken}
                createPaymentRequest={() => ({
                  countryCode: 'US',
                  currencyCode: 'USD',
                  total: {
                    amount: (orderCalculations.total * 100).toString(),
                    label: 'Total',
                  },
                })}
              >
                <YStack space="$3">
                  <View>
                    <GooglePay />
                  </View>
                  <View>
                    <ApplePay />
                  </View>
                  <View>
                    <CreditCard />
                  </View>
                </YStack>
              </PaymentForm>
            </View>
          </View>

          {/* Security Notice */}
          <View padding="$3" backgroundColor="#F8F9FA" borderRadius="$3">
            <XStack space="$2" alignItems="center" justifyContent="center">
              <Text fontSize="$3" color="#6C757D" textAlign="center">
                🔒 Your payment information is secure and encrypted
              </Text>
            </XStack>
          </View>
        </YStack>
      </View>

      {/* Payment Status Modal */}
      <PaymentStatusPopup
        setPaymentStatus={setPaymentStatus}
        completedOrderId={completedOrderId}
        paymentStatus={paymentStatus}
      />
    </View>
  )
}
