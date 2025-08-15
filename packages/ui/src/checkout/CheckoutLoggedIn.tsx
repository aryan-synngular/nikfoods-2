import { View, Input, Label, Select, YStack, XStack, Text, styled, Button } from 'tamagui'
import { IAddress } from 'app/types/user'
import Selectable from '../Selectable'
import { MapPin, Plus, CreditCard as CreditCardIcon, Smartphone } from '@tamagui/lucide-icons'
import { CheckoutStep } from './CheckoutSteps'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { PaymentForm, CreditCard, GooglePay, ApplePay } from 'react-square-web-payments-sdk'
import { apiCheckout, apiCreateOrder } from 'app/services/OrderService'
import { apiGetCart, apiClearCart } from 'app/services/CartService'
import { useToast } from '../useToast'
import { useLink } from 'solito/navigation'
import { IResponse } from 'app/types/common'
import { useStore } from 'app/src/store/useStore'
import PaymentPage from './PaymentPage'
// Types based on your cart response structure
interface CartItem {
  _id: string
  food: {
    _id: string
    name: string
    price: number
    description?: string
    url?: string
  }
  quantity: number
  day: string
}

interface CartDay {
  _id: string
  day: string
  date: string
  cart_value: number
  items: CartItem[]
}

interface Cart {
  _id: string
  user: string
  days: CartDay[]
}

interface ICartResponse {
  message: string
  data: Cart
}

const StepCard = styled(View, {
  borderRadius: 8,
  padding: '$4',
  borderWidth: 1,
  borderColor: '#EDEDED',
  marginBottom: '$4',
  shadowColor: 'rgba(0, 0, 0, 0.05)',
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 4,
  backgroundColor: '#FAFAFA',

  variants: {
    mobile: {
      true: {
        padding: '$3',
        marginBottom: '$3',
      },
    },
  },
})

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

const CheckoutLoggedIn = ({
  currentStep,
  addresses = [],
  selectedAddress,
  handleAddressChange,
  goBack,
  onPaymentSuccess,
  onPaymentError,
  onOrderCreated,
}: {
  currentStep: 'delivery' | 'payment'
  addresses: IAddress[]
  selectedAddress: IAddress
  handleAddressChange: (val: string) => void
  goBack: () => void
  onPaymentSuccess?: (orderData: any) => void
  onPaymentError?: (error: any) => void
  onOrderCreated?: (orderId: string) => void
}) => {
  const {cartTotalAmount,cart,fetchCart}=useStore()
  console.log(cart)
  const ordersPage = useLink({
    href: '/account',
  })
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const { showMessage } = useToast()

  // Mobile detection
  const checkMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < 768)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkMobile()
      const handleResize = () => checkMobile()
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [checkMobile])

  // Fetch cart data
  const fetchCartData = useCallback(async () => {
    try {
      setIsLoadingCart(true)
      await fetchCart()
    } catch (error) {
      console.error('Error fetching cart:', error)
      showMessage('Error loading cart data', 'error')
    } finally {
      setIsLoadingCart(false)
    }
  }, [showMessage])

  useEffect(() => {
    fetchCartData()
  }, [])

  // Calculate totals from cart data
  const orderCalculations = useMemo(() => {
    if (!cart?.days) return { subtotal: 0, platformFee: 1.0, deliveryFee: 10.0, taxes: 0, total: 0 }

    const subtotal = cart.days.reduce((dayAcc, day) => {
      return (
        dayAcc +
        day.items.reduce((itemAcc, item) => {
          return itemAcc + item.food.price * item.quantity
        }, 0)
      )
    }, 0)

    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = subtotal > 100 ? 10.0 : 5.0
    const taxes = subtotal * 0.1
    const total = subtotal + platformFee + deliveryFee - discountAmount + taxes

    return {
      subtotal,
      platformFee,
      deliveryFee,
      discountAmount,
      taxes,
      total,
    }
  }, [cart])

  // Transform cart data to order format
  const transformCartToOrder = useCallback(() => {
    if (!cart?.days || !selectedAddress) return null
    console.log('orderData for cart :', cart)
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

  const appId = 'sandbox-sq0idb--7LNP6X3I9DoOMOGUjwokg'
  const locationId = 'LFH3Z9618P0SA'

  // Industry Standard Payment Flow:
  // 1. Create order in "pending" status
  // 2. Process payment with Square
  // 3. If payment succeeds, update order to "confirmed" and clear cart
  // 4. If payment fails, keep order as "pending" for retry
  const handlePaymentToken = useCallback(
    async (token: any, buyer: any) => {
      if (!selectedAddress || !cart) {
        setPaymentError('Missing required information')
        return
      }

      setIsProcessingPayment(true)
      setPaymentError(null)

      try {
        // Step 1: Create order in pending status
        const orderData = transformCartToOrder()
        console.log('Order data ', orderData)
        if (!orderData) {
          throw new Error('Unable to process cart data')
        }

        showMessage('Creating order...', 'info')
        const orderResponse: any = await apiCreateOrder(orderData)
        const orderId = orderResponse?.data._id

        // Step 2: Process payment with Square
        showMessage('Processing payment...', 'info')
        const paymentResponse: any = await apiCheckout({
          sourceId: token?.token || '',
          amount: Math.round(orderCalculations.total * 100), // Square expects cents
          orderId: orderId, // Include order ID in payment
          buyerVerificationToken: buyer?.verificationToken,
        })

        if (paymentResponse.success) {
          // Step 3: Payment successful - clear cart
          showMessage('Payment successfully...', 'success')
          try {
            await apiClearCart()
          } catch (clearError) {
            console.warn('Could not clear cart:', clearError)
          }

          showMessage('Order placed successfully!', 'success')

          if (onPaymentSuccess) {
            onPaymentSuccess({
              orderId: orderId,
              total: orderCalculations.total,
              paymentId: paymentResponse.paymentId,
            })
          }

          ordersPage.onPress()
          if (onOrderCreated) {
            onOrderCreated(orderId)
          }
        } else {
          throw new Error(paymentResponse.message || 'Payment processing failed')
        }
      } catch (error) {
        console.error('Checkout process error:', error)
        const errorMessage = error?.message || 'Payment failed. Please try again.'
        setPaymentError(errorMessage)
        showMessage(errorMessage, 'error')

        if (onPaymentError) {
          onPaymentError(error)
        }
      } finally {
        setIsProcessingPayment(false)
      }
    },
    [
      cart,
      selectedAddress,
      orderCalculations,
      transformCartToOrder,
      onPaymentSuccess,
      onPaymentError,
      onOrderCreated,
      showMessage,
    ]
  )

  const handlePaymentError = useCallback(
    (errors: any) => {
      console.error('Square payment errors:', errors)
      const errorMessage = 'Payment failed. Please check your payment details and try again.'
      setPaymentError(errorMessage)
      showMessage(errorMessage, 'error')

      if (onPaymentError) {
        onPaymentError(errors)
      }
      setIsProcessingPayment(false)
    },
    [onPaymentError, showMessage]
  )

  // Show loading state while cart is being fetched
  if (isLoadingCart) {
    return (
      <StepCard mobile={isMobile}>
        <ResponsiveContainer mobile={isMobile}>
          <YStack space="$4" alignItems="center" justify="center" minHeight={200}>
            <Text fontSize="$4">Loading Address and cart details...</Text>
          </YStack>
        </ResponsiveContainer>
      </StepCard>
    )
  }

  // Show error if no cart data
  if (!cart || cart.days.length === 0) {
    return (
      <StepCard mobile={isMobile}>
        <ResponsiveContainer mobile={isMobile}>
          <YStack space="$4" alignItems="center" justify="center" minHeight={200}>
            <Text fontSize="$4" color="$red10">
              Your cart is empty
            </Text>
            <Button onPress={() => (window.location.href = '/')}>Continue Shopping</Button>
          </YStack>
        </ResponsiveContainer>
      </StepCard>
    )
  }

  return (
    <StepCard mobile={isMobile}>
      <ResponsiveContainer mobile={isMobile}>
        {currentStep === 'delivery' && (
          <View>
            <CheckoutStep
              icon={<MapPin size={16} color="#FF6B00" />}
              title="Delivery Address"
              description="We'll only use your address to deliver your order safely and on time."
            />

            <AddressFormContainer mobile={isMobile}>
              <Selectable
                size={isMobile ? '$3' : '$4'}
                value={selectedAddress?._id}
                title="Saved Address"
                placeholder="Select an address..."
                options={addresses?.map((addr) => ({
                  value: addr._id,
                  label:
                    `${addr.location_remark || ''} ${addr.street_address || ''} ${addr.city || ''} ${addr.province || ''} ${addr.postal_code || ''}`.trim(),
                }))}
                onValueChange={handleAddressChange}
              >
                <Button
                  borderColor="#FF9F0D"
                  color="#FF9F0D"
                  fontWeight="bold"
                  iconAfter={<Plus color="#FF9F0D" size={isMobile ? 16 : 20} />}
                  borderWidth={1}
                  margin="$3"
                  chromeless
                  variant="outlined"
                  size={isMobile ? '$3' : '$4'}
                >
                  Add Address
                </Button>
              </Selectable>

              {selectedAddress && (
                <YStack space="$3" marginTop="$3">
                  <Label fontSize={isMobile ? '$3' : '$4'}>Address</Label>
                  <Input
                    readOnly
                    value={selectedAddress?.street_address || ''}
                    size={isMobile ? '$3' : '$4'}
                  />

                  <FormRow mobile={isMobile}>
                    <FormField mobile={isMobile}>
                      <Label fontSize={isMobile ? '$3' : '$4'}>Town/City</Label>
                      <Input
                        readOnly
                        value={selectedAddress?.city || ''}
                        size={isMobile ? '$3' : '$4'}
                      />
                    </FormField>
                    {/* <FormField mobile={isMobile}>
                      <Label fontSize={isMobile ? '$3' : '$4'}>Province</Label>
                      <Input
                        readOnly
                        value={selectedAddress?.province || ''}
                        size={isMobile ? '$3' : '$4'}
                      />
                    </FormField> */}
                  </FormRow>

                  {/* <Label fontSize={isMobile ? '$3' : '$4'}>Notes about your order</Label>
                  <Input
                    readOnly
                    value={selectedAddress?.notes || ''}
                    placeholder="E.g. special notes for delivery"
                    size={isMobile ? '$3' : '$4'}
                  /> */}

                  <Text fontSize={isMobile ? '$4' : '$5'} fontWeight="bold" marginTop="$4">
                    Personal Details
                  </Text>

                  <FormRow mobile={isMobile}>
                    <FormField mobile={isMobile}>
                      <Label fontSize={isMobile ? '$3' : '$4'}>Name</Label>
                      <Input
                        readOnly
                        placeholder="Name"
                        value={selectedAddress?.name || ''}
                        size={isMobile ? '$3' : '$4'}
                      />
                    </FormField>
                    <FormField mobile={isMobile}>
                      <Label fontSize={isMobile ? '$3' : '$4'}>Email Address</Label>
                      <Input
                        readOnly
                        placeholder="Email address"
                        value={selectedAddress?.email || ''}
                        size={isMobile ? '$3' : '$4'}
                      />
                    </FormField>
                  </FormRow>

                  <FormRow mobile={isMobile}>
                    <FormField mobile={isMobile}>
                      <Label fontSize={isMobile ? '$3' : '$4'}>Phone (optional)</Label>
                      <Input
                        readOnly
                        placeholder="Phone (optional)"
                        value={selectedAddress?.phone || ''}
                        size={isMobile ? '$3' : '$4'}
                      />
                    </FormField>
                    {/* <FormField mobile={isMobile}>
                      <Label fontSize={isMobile ? '$3' : '$4'}>Location Remark</Label>
                      <Input
                        readOnly
                        placeholder="e.g. home, office"
                        value={selectedAddress?.location_remark || ''}
                        size={isMobile ? '$3' : '$4'}
                      />
                    </FormField> */}
                  </FormRow>
                </YStack>
              )}
            </AddressFormContainer>
          </View>
        )}

        {currentStep === 'payment' && (
          <PaymentPage
            selectedAddress={selectedAddress}
            handleAddressChange={handleAddressChange}
            goBack={goBack}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
            onOrderCreated={onOrderCreated}
          />
        
        )}
      </ResponsiveContainer>
    </StepCard>
  )
}

export default CheckoutLoggedIn
