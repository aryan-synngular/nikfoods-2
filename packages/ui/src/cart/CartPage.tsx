'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ScrollView, Text, YStack, XStack } from 'tamagui'
import { CartDaySection } from './CartDaySection'
import { CartSummary } from './CartSummary'
import { EmptyCart } from './EmptyCart'
import { SavingsBanner } from './SavingsBanner'
import { AddMoreButton } from './AddMoreButton'
import { DessertDeals } from './DessertDeals'
import { AppHeader } from '../Header'
import { apiGetCart, apiUpdateCartItemQuantity } from 'app/services/CartService'
import { useLink } from 'solito/navigation'
import { ICart, ICartResponse } from 'app/types/cart'
import { useToast } from '../useToast'
import { CartItemsShimmerLoader } from '../loaders/CartItemsShimmerLoader'
import { CartSummaryShimmerLoader } from '../loaders/CartSummaryShimmerLoader'
import { DessertDealsShimmerLoader } from '../loaders/DessertDealsShimmerLoader'
import { useStore } from 'app/src/store/useStore'
import { Platform } from 'react-native'

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

export function CartPage({
  onBrowse,
  onCheckout,
  onAddMore,
  onViewAllDesserts,
  onAddDessert,
}: CartPageProps) {
  const homeLink = useLink({
    href: '/',
  })

  const {cart,fetchCart,cartRecommendations,cartTotalAmount,fetchCartRecommendations,fetchCartTotalAmount,addToCart, updateCartItemQuantity }=useStore()
  const { showMessage } = useToast()
const [loading, setLoading] = useState({ itemId: "", change: 0 })
console.log(loading)
  const isDesktop = Platform.OS === 'web'
  // State to track if we're on desktop or mobile - initialize properly
  // const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false)

  const checkOutLink = useLink({
    href: '/checkout',
  })

  // Effect to handle window resize and initial detection - fixed
  // useEffect(() => {
    
  //   if (!(Platform.OS==="web")) return

  //   const checkIfDesktop = () => {
  //     const newIsDesktop = window.innerWidth >= 768
  //     setIsDesktop(newIsDesktop)
  //   }

  //   // Set initial value immediately
  //   checkIfDesktop()

  //   window.addEventListener('resize', checkIfDesktop)
  //   return () => window.removeEventListener('resize', checkIfDesktop)
  // }, [])

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

  const handleQuantityChange = async (change: number, itemId: string) => {
    if (change === 0) return // No change needed
      setLoading({ itemId, change })
    try {
       await updateCartItemQuantity({ cartItemId: itemId, change })
      showMessage('Quantity Updated Successfully', 'success')
    } catch (error) {
      console.log(error)
    } finally {
          setLoading({ itemId: "", change: 0 })

    }
  }

  const handleDecrement = async (dayIndex: number, itemId: string) => {
    try {
      const data = await apiUpdateCartItemQuantity({ cartItemId: itemId, change: -1 })
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

console.log(cart)
  const getCartData = useCallback(async () => {
    setIsLoading(true)
    try {
       await fetchCart()
    } catch (error) {
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    getCartData()
  }, [getCartData])

  const totalAmount = useMemo(() => {
    if (!cart?.days || cart.days.length === 0) return 0

    return cart.days.reduce((dayAcc, day) => {
      const dayTotal =
        day?.items?.reduce((itemAcc, item) => {
          const price = item.food?.price || 0
          return itemAcc + price * (item.quantity || 1)
        }, 0) || 0
      return dayAcc + dayTotal
    }, 0)
  }, [cart])

  const isCartEmpty =
    !isLoading && (!cart?.days || !(cart.days.length > 0))

  // Don't render the layout until we know if we're on desktop or mobile
  if (isDesktop === null) {
    return (
      <YStack
        style={{
          width: '100%',
          minHeight: '100vh',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FAFAFA',
        }}
      >
        <AppHeader />
        <YStack
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text>Loading...</Text>
        </YStack>
      </YStack>
    )
  }

  const refreshCartDetails = () => {
    getCartData()
  }

  const handleCheckout = () => {
    console.log('Helo')
    checkOutLink.onPress()
  }
  const onAddMoreItems = () => {
    homeLink.onPress()
  }
  return (
    <YStack
    
      style={{
        width: '100%',
        minHeight: '100%',
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
              marginTop:isDesktop ? 0 : 100,
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000' }}>Your Cart</Text>
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
              height: '100%',
              marginHorizontal: 'auto',
              paddingHorizontal: 24,
            }}
          >
            <XStack
              style={{
                width: '100%',
                height:"100%",
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
                <ScrollView height={"100%"}  style={{ flex: 1 }}>
                  {/* Cart sections by day */}
                  {isLoading || isUpdatingQuantity ? (
                    <CartItemsShimmerLoader />
                  ) : (
                    cart?.days?.map((day, index) =>
                      day.items.length > 0 ? (
                        <CartDaySection
                          key={day.day}
                          day={day.day}
                          date={day?.date}
                          items={day.items}
                          isItemLoading={loading}
                          deliveryLabel={'Some Lable'}
                          onIncrement={(itemId, change) => handleQuantityChange(change, itemId)}
                          onDecrement={(itemId, change) => handleQuantityChange(change, itemId)}
                        />
                      ) : (
                        <></>
                      )
                    )
                  )}

                  {/* Add more button */}
                  {!isLoading && <AddMoreButton onPress={onAddMoreItems} />}

                  {/* Only show dessert deals in the left column on mobile */}
                  {!isDesktop && (
                    <>
                      {isLoading ? (
                        <DessertDealsShimmerLoader />
                      ) : (
                        <DessertDeals
                          items={dessertDeals}
                          onAddItem={refreshCartDetails}
                          onViewAll={onViewAllDesserts}
                        />
                      )}
                    </>
                  )}
                </ScrollView>
              </YStack>

              {/* Right column - Summary and Dessert deals (desktop only) */}
              {isDesktop ? (
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
                        {isLoading ? (
                          <CartSummaryShimmerLoader />
                        ) : (
                          <CartSummary
                            buttonTitle="Checkout"
                            subtotal={totalAmount}
                            onCheckout={handleCheckout}
                            loading={loading}
                          />
                        )}
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
                        {isLoading ? (
                          <DessertDealsShimmerLoader />
                        ) : (
                          <DessertDeals
                            items={dessertDeals}
                            onAddItem={refreshCartDetails}
                            onViewAll={onViewAllDesserts}
                          />
                        )}
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
                    {isLoading ? (
                      <CartSummaryShimmerLoader />
                    ) : (
                      <CartSummary
                        buttonTitle="Checkout"
                        subtotal={totalAmount}
                        onCheckout={handleCheckout}
                        loading={loading}
                      />
                    )}
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
