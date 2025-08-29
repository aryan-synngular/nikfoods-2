import { View, Input, Label, Select, YStack, XStack, Text, styled, Button } from 'tamagui'
import { IAddress } from 'app/types/user'
import Selectable from '../Selectable'
import { MapPin, Plus, CreditCard as CreditCardIcon, Smartphone } from '@tamagui/lucide-icons'
import { CheckoutStep } from './CheckoutSteps'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { apiCheckout, apiCreateOrder } from 'app/services/OrderService'
import { apiGetCart, apiClearCart } from 'app/services/CartService'
import { useToast } from '../useToast'
import { useLink } from 'solito/navigation'
import { IResponse } from 'app/types/common'
import { useStore } from 'app/src/store/useStore'
import PaymentPage from './PaymentPage'
import { useScreen } from 'app/hook/useScreen'

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
  selectedAddress?: IAddress
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
  onAddAddressClick,
}: {
  currentStep: 'delivery' | 'payment'
  addresses: IAddress[]
  selectedAddress: IAddress
  handleAddressChange: (val: string) => void
  goBack: () => void
  onPaymentSuccess?: (orderData: any) => void
  onPaymentError?: (error: any) => void
  onOrderCreated?: (orderId: string) => void
  onAddAddressClick?: () => void
}) => {

 
  const { isMobile } = useScreen()

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
              {selectedAddress ? (
                <YStack space="$3">
                  <Label fontSize={isMobile ? '$3' : '$4'}>Delivery Address</Label>
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
                  </FormRow>

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
                  </FormRow>
                </YStack>
              ) : (
                <YStack space="$3" alignItems="center" padding="$4">
                  <Text fontSize={isMobile ? '$4' : '$5'} color="#666" textAlign="center">
                    No delivery address selected
                  </Text>
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
                    onPress={onAddAddressClick}
                  >
                    Add Address
                  </Button>
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
