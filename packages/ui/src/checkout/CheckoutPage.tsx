'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrollView, Text, YStack, XStack, Button, Spinner } from 'tamagui'
import { Plus } from '@tamagui/lucide-icons'
import { CartSummary } from '../cart/CartSummary'
import { EmptyCart } from '../cart/EmptyCart'
import { SavingsBanner } from '../cart/SavingsBanner'
import { DessertDeals } from '../cart/DessertDeals'
import { AppHeader } from '../Header'
import CheckoutSteps from './CheckoutSteps'
// import { useAuth } from 'app/hook/useAuth'
import CheckoutLoggedIn from './CheckoutLoggedIn'
import { IAddress } from 'app/types/user'
import { apiGetAllAddress } from 'app/services/UserService'
import { apiGetCartTotalAmount } from 'app/services/CartService'
import { IListResponse, IResponse } from 'app/types/common'
import { useScreen } from 'app/hook/useScreen'
import { useAuth } from 'app/provider/auth-context'
import { Platform } from 'react-native'
import { useStore } from 'app/src/store/useStore'
import { apiGetCartAddress } from 'app/services/CartService'
import { useToast } from '../useToast'
import AddressPopup from '../popups/AddressPopup'
import { CartSummaryShimmerLoader } from '../loaders'

// Shimmer loader component
function Shimmer({ style }: { style?: any }) {
  return (
    <YStack
      bg="#ececec"
      style={{ ...style, opacity: 0.7, overflow: 'hidden', position: 'relative' }}
      className="shimmer-effect"
    />
  )
}

// Loading skeleton for checkout page
function CheckoutSkeleton({ isMobile, isMobileWeb }: { isMobile: boolean; isMobileWeb: boolean }) {
  return (
    <YStack
      pt={100}
      style={{
        flex: 1,
        justifyContent: 'start',
        alignItems: 'center',
      }}
    >
      <YStack
        style={{
          maxWidth: isMobile || isMobileWeb ? 400 : 1200,
          width: '100%',
          marginHorizontal: 'auto',
          paddingHorizontal: 24,
        }}
      >
        <XStack
          style={{
            width: '100%',
            flexDirection: isMobile || isMobileWeb ? 'column' : 'row',
            gap: !isMobile ? 24 : 0,
            paddingVertical: 24,
          }}
        >
          {/* Left column skeleton */}
          <YStack
            style={{
              flex: isMobile || isMobileWeb ? 1 : 0.65,
              width: isMobile || isMobileWeb ? '100%' : '65%',
            }}
          >
            <YStack style={{ gap: 16 }}>
              <Shimmer style={{ width: '100%', height: 60, borderRadius: 8 }} />
              <Shimmer style={{ width: '100%', height: 200, borderRadius: 8 }} />
              <Shimmer style={{ width: '100%', height: 150, borderRadius: 8 }} />
            </YStack>
          </YStack>

          {/* Right column skeleton (desktop only) */}
          {!isMobile && !isMobileWeb && (
            <YStack
              style={{
                flex: 0.35,
                width: '35%',
              }}
            >
              <Shimmer style={{ width: '100%', height: 300, borderRadius: 16 }} />
            </YStack>
          )}
        </XStack>
      </YStack>
    </YStack>
  )
}

interface CartItemData {
  id: string
  name: string
  description?: string
  price: number
  quantity: number
  imageUrl: string
}

interface CartDayData {
  day: string
  date: string
  deliveryLabel?: string
  items: CartItemData[]
}

interface CartPageProps {
  onBrowse?: () => void
  onCheckout?: () => void
  onAddMore?: () => void
  onViewAllDesserts?: () => void
  onAddDessert?: (id: string) => void
}
export function CheckoutPage({
  onBrowse,
  onCheckout,
  onAddMore,
  onViewAllDesserts,
  onAddDessert,
}: CartPageProps) {
  const { loading, user } = useAuth()
  console.log('isAuthenticated')
  const { cartTotalAmount, fetchCart } = useStore()
  // console.log(isAuthenticated)
  console.log(user)
  const { isMobile, isMobileWeb } = useScreen()

  // State to track if we're on desktop or mobile
  // const [isMobile, setIsDesktop] = useState<boolean | null>(false)
  const [currentStep, setCurrentStep] = useState<'delivery' | 'payment'>('delivery')
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [showAddressPopup, setShowAddressPopup] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(true)
  const { showMessage } = useToast()
  const [total, setTotal] = useState<{ total: number }>({ total: 0 })
  
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null)

  const getCartAddress = useCallback(async () => {
    try {
      setIsLoadingAddress(true)
      const data = await apiGetCartAddress<IResponse<{ selectedAddress: IAddress }>>()
      if (data?.data?.selectedAddress) {
        setSelectedAddress(data.data.selectedAddress)
      }
    } catch (error) {
      console.log('Error loading cart address:', error)
      // Don't show error message as it's optional
    } finally {
      setIsLoadingAddress(false)
    }
  }, [])
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
    getCartAddress()
    fetchCartData()
  }, [getCartAddress])
  // Sample cart data organized by day - in a real app, this would come from props or context

  const getTotal = useCallback(async () => {
    try {
      // const data = await apiGetCartTotalAmount<IResponse<{ total: number }>>()
      // console.log(data)
      // setTotal(data?.data)
      setTotal({ total: 0 })
    } catch (error) {
      console.log(error)
    }
  }, [])
  useEffect(() => {
    getTotal()
  }, [getTotal])

  // Combined loading state
  const isLoading = isLoadingCart || isLoadingAddress

  // Handle address popup success
  const handleAddressSuccess = () => {
    setShowAddressPopup(false)
    getCartAddress() // Refetch cart address
    showMessage('Address added successfully!', 'success')
  }

  // Check if cart is empty
  const isCartEmpty = cartTotalAmount == 0

  // Handle case when user has no addresses
  const hasNoAddresses = user && user?.email && !selectedAddress

  // Don't render the layout until we know if we're on desktop or mobile
  if ((!isMobile === null && loading) || isLoading) {
    return (
      <YStack style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
        <AppHeader />
        <YStack style={{ flex: 1, paddingTop: isMobile || isMobileWeb ? 0 : 0 }}>
          <CheckoutSkeleton isMobile={isMobile} isMobileWeb={isMobileWeb} />
        </YStack>
      </YStack>
    )
  }
  const onHandleClick = () => {
    console.log(currentStep)
    if (currentStep == 'delivery') {
      setCurrentStep('payment')
    }
  }

  const refreshCartDetails = () => {
    getTotal()
  }
  return (
    <YStack
      justify={!isMobile ? 'center' : 'unset'}
      items={!isMobile ? 'center' : 'unset'}
      style={{
        width: '100%',
        minHeight: '100%',
        // justifyContent: 'center',
        // alignItems: 'center',
      }}
    >
      {/* Add the header */}
      <AppHeader />

      <YStack
        style={{
          flex: 1,
        }}
      >
        {/* Cart title - directly below header without container */}
        <YStack
          style={{
            paddingTop: (isMobile || isMobileWeb) ? 60 : 16,
            paddingBottom: (isMobile || isMobileWeb) ? 8 : 16,
            backgroundColor: 'white',
            marginBottom: (isMobile || isMobileWeb) ? 8 : 0,
          }}
        >
          {/* <XStack
            style={{
                           maxWidth:( isMobile||isMobileWeb) ? 400 : 1200,

              // width: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal: (isMobile || isMobileWeb) ?36:16,
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: Platform.OS == 'web' ? 0 : 100,
            }}
          >
            <Text
              style={{
                fontSize: (isMobile || isMobileWeb )? 20 : 28,
                fontWeight: '700',
                color: '#000000',
              }}
            >
              Checkout
            </Text>
          </XStack> */}
        </YStack>

        {/* Show Add Address screen when user has no addresses */}
        {hasNoAddresses ? (
          <YStack
            style={{
              flex: 1,
              maxWidth: (isMobile || isMobileWeb) ? 400 : 600,
              width: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal: 24,
              paddingVertical: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <YStack
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 32,
                alignItems: 'center',
                gap: 24,
                borderWidth: 1,
                borderColor: '#F0F0F0',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text
                fontSize={isMobile || isMobileWeb ? 20 : 24}
                fontWeight="700"
                color="#2A1A0C"
                style={{ textAlign: 'center' }}
              >
                Add Delivery Address
              </Text>
              <Text fontSize={16} color="#666" style={{ maxWidth: 300, textAlign: 'center' }}>
                You need to add a delivery address to proceed with checkout
              </Text>
              <Button
                size="$4"
                bg="#FF9F0D"
                color="white"
                icon={<Plus size={20} />}
                onPress={() => setShowAddressPopup(true)}
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 24,
                }}
              >
                Add Address
              </Button>
            </YStack>
          </YStack>
        ) : isCartEmpty ? (
          <YStack
            style={{
              paddingVertical: isMobile || isMobileWeb ? 4 : 24,
              maxWidth: 1200,
              width: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal: isMobile || isMobileWeb ? 4 : 24,
            }}
          >
            <EmptyCart onBrowse={onBrowse} />
          </YStack>
        ) : (
          <YStack
            style={{
              maxWidth: isMobile || isMobileWeb ? 400 : 1200,
              width: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal:(isMobile || isMobileWeb)?12: 24,
            }}
          >
            <XStack
              style={{
                width: '100%',
                height: '100%',
                flexDirection: isMobile || isMobileWeb ? 'column' : 'row',
                gap: !isMobile ? 24 : 0,
                paddingVertical: 24,
              }}
            >
              {/* Left column - Cart items */}
              {/* <YStack
                style={{
                  flex: !isMobile ? (currentStep == 'payment' ? 1 : 0.65) : 1,
                  width: !isMobile ? (currentStep == 'payment' ? '100%' : '65%') : '100%',
                }}
              > */}
              <YStack
                style={{
                  flex: isMobile || isMobileWeb ? 1 : currentStep == 'payment' ? 1 : 0.65,
                  width:
                    isMobile || isMobileWeb ? '100%' : currentStep == 'payment' ? '100%' : '65%',
                }}
              >
                <ScrollView showsVerticalScrollIndicator={false} height={'100%'} style={{ flex: 1 }}>
                  {user && user?.email ? (
                    <CheckoutLoggedIn
                      addresses={[]}
                      goBack={() => setCurrentStep('delivery')}
                      handleAddressChange={() => {}}
                      selectedAddress={selectedAddress!}
                      currentStep={currentStep}
                      onAddAddressClick={() => setShowAddressPopup(true)}
                    />
                  ) : (
                    // <Text>Yerlig</Text>
                    <CheckoutSteps />
                  )}

                  {/* Only show dessert deals in the left column on mobile */}
                  {/* {isMobile && (
                    <DessertDeals
                      items={dessertDeals}
                      onAddItem={refreshCartDetails}
                      onViewAll={onViewAllDesserts}
                    />
                  )} */}
                </ScrollView>
              </YStack>

              {/* Right column - Summary and Dessert deals (desktop only) */}
              {currentStep === 'delivery' &&
                (!isMobile && !isMobileWeb ? (
                  <YStack
                    style={{
                      flex: 0.35,
                      width: '35%',
                      paddingRight: 0,
                      paddingTop: 0,
                      position: 'relative',
                    }}
                  >
                    <ScrollView
                    showsVerticalScrollIndicator={false}
                      style={{
                        height: '100%',
                        paddingRight: 0,
                      }}
                    >
                      <YStack
                        style={{
                          gap: 24,
                          paddingBottom: 24,
                        }}
                      >
                        {/* Fixed summary card */}
                        <YStack
                          style={{
                            backgroundColor: 'white',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: '#F0F0F0',
                            overflow: 'hidden',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                          }}
                        >
                          {isLoading ? (
                                                    <CartSummaryShimmerLoader />
                                                  ) : (
                          <CartSummary
                            subtotal={total.total}
                            buttonTitle="Continue To Pay"
                            onCheckout={onHandleClick}
                          />)}
                        </YStack>

                        {/* Dessert deals section */}
                        {/* <YStack
                          style={{
                            backgroundColor: 'white',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: '#F0F0F0',
                            overflow: 'hidden',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                          }}
                        >
                          <DessertDeals
                            items={dessertDeals}
                            onAddItem={refreshCartDetails}
                            onViewAll={onViewAllDesserts}
                          />
                        </YStack> */}
                      </YStack>
                    </ScrollView>
                  </YStack>
                ) : (
                  // On mobile, show summary at the bottom
                  <YStack
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      // width: '100%',
                      backgroundColor: 'transparent',
                                             borderRadius: 16,

                      padding: (isMobile || isMobileWeb)?0:16,
                      paddingTop: 0,
                      zIndex: 10,
                    }}
                  >
                    <YStack
                      style={{
                        backgroundColor: 'white',
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: '#F0F0F0',
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                        marginBottom: 100,
                      }}
                    >
                      {isLoading ? (
                                                <CartSummaryShimmerLoader />
                                              ) : (
                      <CartSummary
                        subtotal={total.total ?? cartTotalAmount}
                        buttonTitle={isMobile ? 'Continue To Pay' : 'Continue To Pay'}
                        onCheckout={onHandleClick}

                      />)}
                    </YStack>
                  </YStack>
                ))}
            </XStack>
          </YStack>
        )}
      </YStack>

      {/* Address Popup */}
      <AddressPopup
        editDialogOpen={showAddressPopup}
        editItem={null}
        setEditDialogOpen={setShowAddressPopup}
        onSuccess={handleAddressSuccess}
      />
    </YStack>
  )
}
