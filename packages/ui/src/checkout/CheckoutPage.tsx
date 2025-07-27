'use client'

import { useState, useEffect, useCallback } from 'react'
import { ScrollView, Text, YStack, XStack } from 'tamagui'
import { CartSummary } from '../cart/CartSummary'
import { EmptyCart } from '../cart/EmptyCart'
import { SavingsBanner } from '../cart/SavingsBanner'
import { DessertDeals } from '../cart/DessertDeals'
import { AppHeader } from '../Header'
import CheckoutSteps from './CheckoutSteps'
import { useAuth } from 'app/hook/useAuth'
import CheckoutLoggedIn from './CheckoutLoggedIn'
import { IAddress } from 'app/types/user'
import { apiGetAllAddress } from 'app/services/UserService'
import { apiGetCartTotalAmount } from 'app/services/CartService'
import { IListResponse, IResponse } from 'app/types/common'
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
  const { loading, isAuthenticated } = useAuth()
  console.log(isAuthenticated)
  // State to track if we're on desktop or mobile
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const [address, setAddress] = useState<IListResponse<IAddress> | null>(null)
  const [currentStep, setCurrentStep] = useState<'delivery' | 'payment'>('delivery')
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null)
  const handleAddressChange = (val) => {
    setSelectedAddress(address?.items.find((addr) => addr._id == val)!)
  }
  const [total, setTotal] = useState<{ total: number }>({ total: 0 })
  // Effect to check window width and update isDesktop state
  useEffect(() => {
    // Function to check if we're on desktop
    const checkIfDesktop = () => {
      if (typeof window !== 'undefined') {
        setIsDesktop(window.innerWidth >= 768) // 768px is a common breakpoint for tablet/desktop
      }
    }

    // Check initially
    checkIfDesktop()

    // Add event listener for window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkIfDesktop)

      // Cleanup
      return () => window.removeEventListener('resize', checkIfDesktop)
    }
  }, [])

  const getAllAddress = useCallback(async () => {
    try {
      const data = await apiGetAllAddress<IResponse<IListResponse<IAddress>>>()
      setAddress(data?.data)
      if (data?.data?.items.length > 0) {
        setSelectedAddress(data?.data?.items[0])
      }
    } catch (error) {
      console.log('Error:', error)
    }
  }, [])

  useEffect(() => {
    getAllAddress()
  }, [getAllAddress])
  // Sample cart data organized by day - in a real app, this would come from props or context
  const [cartDays, setCartDays] = useState<CartDayData[]>([
    {
      day: 'Wednesday',
      date: '2025-07-08',
      deliveryLabel: 'Delivery on Thursday',
      items: [
        {
          id: '1',
          name: 'Paneer 65',
          description: 'Punjabi Chefs 2 pcs, bubble-wrap+green chutney',
          price: 14.0,
          quantity: 1,
          imageUrl: '/foodImages/paneer65.png',
        },
        {
          id: '2',
          name: 'Dodda Barfi',
          description: 'Pack of 5 Dodda Barfi',
          price: 10.0,
          quantity: 1,
          imageUrl: '/foodImages/barfi.png',
        },
      ],
    },
    {
      day: 'Thursday',
      date: '2025-07-09',
      deliveryLabel: 'Same day delivery',
      items: [
        {
          id: '3',
          name: 'Doda Barfi (5 pcs)',
          description: "Set of 5 barfi's made from mawa and milk",
          price: 24.0,
          quantity: 2,
          imageUrl: '/foodImages/barfi.png',
        },
        {
          id: '4',
          name: 'Paneer 65',
          description: 'Punjabi Chefs 2 pcs, bubble-wrap+green chutney',
          price: 14.0,
          quantity: 1,
          imageUrl: '/foodImages/paneer65.png',
        },
      ],
    },
    {
      day: 'Friday',
      date: '2025-07-10',
      deliveryLabel: 'Same day delivery',
      items: [
        {
          id: '5',
          name: 'Panjiri',
          description: 'Punjabi Chefs 2 pcs, bubble-wrap+green chutney',
          price: 14.0,
          quantity: 1,
          imageUrl: '/foodImages/panjiri.png',
        },
        {
          id: '6',
          name: 'Kesar Milk',
          description: 'Regular size glass with dry fruits mixed',
          price: 12.0,
          quantity: 1,
          imageUrl: '/foodImages/kesarMilk.png',
        },
      ],
    },
  ])

  // Sample dessert deals
  const dessertDeals = [
    {
      id: 'd1',
      name: 'Gulab Jamun',
      description: 'Pack of 2 Gulab Jamuns',
      price: 6.0,
      imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2019/04/Gulab-Jamun-500x500.jpg',
    },
    {
      id: 'd2',
      name: 'Dodda Barfi',
      description: 'Pack of 5 Dodda Barfi',
      price: 9.0,
      imageUrl: 'https://www.cookwithmanali.com/wp-content/uploads/2018/08/Kaju-Katli-500x500.jpg',
    },
    {
      id: 'd3',
      name: 'Rasmalai',
      description: 'Pack of 2 Kesar milk dipped Rasmalai',
      price: 4.5,
      imageUrl:
        'https://www.cookwithmanali.com/wp-content/uploads/2017/08/Rasmalai-Recipe-500x500.jpg',
    },
  ]

  const getTotal = useCallback(async () => {
    try {
      const data = await apiGetCartTotalAmount<IResponse<{ total: number }>>()
      console.log(data)
      setTotal(data?.data)
    } catch (error) {
      console.log(error)
    }
  }, [])
  useEffect(() => {
    getTotal()
  }, [getTotal])

  // Calculate cart totals
  const subtotal = cartDays.reduce((sum, day) => {
    return sum + day.items.reduce((daySum, item) => daySum + item.price * item.quantity, 0)
  }, 0)

  // Handlers for cart item actions
  const handleIncrement = (dayIndex: number, itemId: string) => {
    setCartDays((days) =>
      days.map((day, idx) => {
        if (idx !== dayIndex) return day

        return {
          ...day,
          items: day.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }
      })
    )
  }

  const handleDecrement = (dayIndex: number, itemId: string) => {
    setCartDays((days) =>
      days.map((day, idx) => {
        if (idx !== dayIndex) return day

        return {
          ...day,
          items: day.items.map((item) =>
            item.id === itemId && item.quantity > 1
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        }
      })
    )
  }

  // Check if cart is empty
  const isCartEmpty = cartDays.every((day) => day.items.length === 0)

  // Don't render the layout until we know if we're on desktop or mobile
  if (isDesktop === null && loading) {
    return (
      <YStack
        style={{
          flex: 1,
          backgroundColor: '#FAFAFA',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Loading...</Text>
      </YStack>
    )
  }
  const onHandleClick = () => {
    console.log('Helleoefne ')
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
      style={{
        width: '100%',
        minHeight: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
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
            paddingTop: 16,
            paddingBottom: 16,
            backgroundColor: 'white',
            // borderBottomWidth: 1,
            // borderBottomColor: '#F0F0F0',
            // shadowColor: '#000',
            // shadowOffset: { width: 0, height: 2 },
            // shadowOpacity: 0.05,
            // shadowRadius: 4,
            // elevation: 2,
            // zIndex: 5
          }}
        >
          <XStack
            style={{
              maxWidth: 1200,
              width: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal: 16,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000' }}>Checkout </Text>
            {/* Savings banner */}
            {/* <SavingsBanner amount={15} /> */}
          </XStack>
        </YStack>

        {isCartEmpty ? (
          <YStack
            style={{
              paddingVertical: 24,
              maxWidth: 1200,
              width: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal: 24,
            }}
          >
            <EmptyCart onBrowse={onBrowse} />
          </YStack>
        ) : (
          <YStack
            style={{
              maxWidth: 1200,
              width: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal: 24,
            }}
          >
            <XStack
              style={{
                width: '100%',
                flexDirection: isDesktop ? 'row' : 'column',
                gap: isDesktop ? 24 : 0,
                paddingVertical: 24,
              }}
            >
              {/* Left column - Cart items */}
              <YStack
                style={{
                  flex: isDesktop ? 0.65 : 1,
                  width: isDesktop ? '65%' : '100%',
                }}
              >
                <ScrollView style={{ flex: 1 }}>
                  {isAuthenticated ? (
                    <CheckoutLoggedIn
                      addresses={address?.items ?? []}
                      goBack={() => setCurrentStep('delivery')}
                      handleAddressChange={handleAddressChange}
                      selectedAddress={selectedAddress!}
                      currentStep={currentStep}
                    />
                  ) : (
                    <CheckoutSteps />
                  )}

                  {/* Only show dessert deals in the left column on mobile */}
                  {isDesktop === false && (
                    <DessertDeals
                      items={dessertDeals}
                      onAddItem={refreshCartDetails}
                      onViewAll={onViewAllDesserts}
                    />
                  )}
                </ScrollView>
              </YStack>

              {/* Right column - Summary and Dessert deals (desktop only) */}
              {isDesktop === true ? (
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
                        <CartSummary
                          subtotal={total.total}
                          buttonTitle="Continue To Pay"
                          onCheckout={onHandleClick}
                        />
                      </YStack>

                      {/* Dessert deals section */}
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
                        }}
                      >
                        <DessertDeals
                          items={dessertDeals}
                          onAddItem={refreshCartDetails}
                          onViewAll={onViewAllDesserts}
                        />
                      </YStack>
                    </YStack>
                  </ScrollView>
                </YStack>
              ) : (
                // On mobile, show summary at the bottom
                <YStack
                  style={{
                    position: 'sticky',
                    bottom: 0,
                    width: '100%',
                    backgroundColor: '#FAFAFA',
                    padding: 16,
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
                    }}
                  >
                    <CartSummary
                      subtotal={total.total}
                      buttonTitle="Continue To Pay"
                      onCheckout={onHandleClick}
                    />
                  </YStack>
                </YStack>
              )}
            </XStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  )
}
