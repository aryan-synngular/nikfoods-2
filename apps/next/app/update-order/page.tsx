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

export default function UpdateOrderPage() {
  const sp = useSearchParams()
  const router = useRouter()
  const updatingOrderId = sp?.get('updatingOrderId') || ''

  const [loading, setLoading] = useState<boolean>(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
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
          success('Payment successful. Your order update will be applied shortly.')
          router.push('/account')
        } else {
          throw new Error(paymentResponse?.message || 'Payment processing failed')
        }
      } catch (err: any) {
        const errorMessage = err?.message || 'Payment failed. Please try again.'
        setPaymentError(errorMessage)
        showError(errorMessage)
      } finally {
        setIsProcessingPayment(false)
      }
    },
    [updatingOrder, orderCalculations, info, success, showError, router]
  )

  if (loading) {
    return (
      <div style={{ padding: 16, border: '1px solid #EDEDED', borderRadius: 8 }}>
        <p style={{ fontSize: 16, margin: 0 }}>Loading updating order...</p>
      </div>
    )
  }

  if (error || !updatingOrder) {
    return (
      <div style={{ padding: 16, border: '1px solid #EDEDED', borderRadius: 8 }}>
        <p style={{ fontSize: 16, margin: 0, color: '#C53030' }}>
          {error || 'No updating order found'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: 16, height:"100%", background: '#F8F9FA', borderRadius: 8, display:"flex", justifyContent:"center", alignItems:"center" }}>
      <div style={{ minWidth: 700, margin: '0 auto' }}>

      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          padding: 16,
          border: '1px solid #EDEDED',
          marginTop: 16,
        }}
      >
        <p style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 12 }}>Order Summary</p>

        <div style={{ paddingTop: 8, borderTop: '1px solid #EDEDED' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>${orderCalculations.subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Platform Fee:</span>
            <span>${orderCalculations.platformFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Delivery Fee:</span>
            <span>${orderCalculations.deliveryFee.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#00AA00' }}>
            <span>Discount:</span>
            <span>-{orderCalculations.discountAmount.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Taxes:</span>
            <span>${orderCalculations.taxes.toFixed(2)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: 8,
              borderTop: '1px solid #EDEDED',
            }}
            >
            <span style={{ fontSize: 18, fontWeight: 'bold' }}>Final Total:</span>
            <span style={{ fontSize: 18, fontWeight: 'bold', color: '#FF6B00' }}>
              ${orderCalculations.total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {paymentError && (
        <div
        style={{
          padding: 12,
          background: '#FEE',
          borderRadius: 8,
          marginTop: 12,
          border: '1px solid #FCC',
        }}
        >
          <p style={{ color: '#C53030', margin: 0 }}>{paymentError}</p>
        </div>
      )}

      <div
        style={{
          background: '#fff',
          borderRadius: 10,
          padding: 16,
          border: '1px solid #EDEDED',
          marginTop: 16,
        }}
        >
        <p style={{ fontSize: 18, fontWeight: 600, margin: 0, marginBottom: 16 }}>
          Payment Details
        </p>

        {isProcessingPayment && (
          <div style={{ padding: 12, background: '#E6F3FF', borderRadius: 8, marginBottom: 12 }}>
            <p style={{ color: '#0066CC', margin: 0 }}>Processing your order and payment...</p>
          </div>
        )}

        <div style={{ opacity: isProcessingPayment ? 0.5 : 1 }}>
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
            <div style={{ marginTop: 12 }}>
              <GooglePay />
            </div>
            <div style={{ marginTop: 12 }}>
              <ApplePay />
            </div>
            <div style={{ marginTop: 12 }}>
              <CreditCard />
            </div>
          </PaymentForm>
        </div>
      </div>

      <div style={{ marginTop: 12, padding: 12, background: '#F8F9FA', borderRadius: 8 }}>
        <p style={{ fontSize: 14, color: '#6C757D', margin: 0 }}>
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
    </div>
            </div>
  )
}
