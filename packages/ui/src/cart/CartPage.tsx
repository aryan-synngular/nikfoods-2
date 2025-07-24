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
  // State to track if we're on desktop or mobile
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)
  const checkOutLink = useLink({
    href: '/checkout',
  })

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

  // Calculate cart totals

  // Handlers for cart item actions
  const handleIncrement = (dayIndex: number, itemId: string) => {
    // setCartDays((days) =>
    //   days.map((day, idx) => {
    //     if (idx !== dayIndex) return day
    //     return {
    //       ...day,
    //       items: day.items.map((item) =>
    //         item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    //       ),
    //     }
    //   })
    // )
  }
  const handleQuantityChange = async (change: number, itemId: string) => {
    console.log(change)
    console.log(itemId)
    try {
      const data = await apiUpdateCartItemQuantity({ cartItemId: itemId, change })
      console.log(data)
      await getCartData()
    } catch (error) {
      console.log(error)
    }
  }

  const handleDecrement = async (dayIndex: number, itemId: string) => {
    try {
      const data = await apiUpdateCartItemQuantity({ cartItemId: itemId, change: -1 })
      console.log(data)
    } catch (error) {
      console.log(error)
    }
    // setCartDays((days) =>
    //   days.map((day, idx) => {
    //     if (idx !== dayIndex) return day

    //     return {
    //       ...day,
    //       items: day.items.map((item) =>
    //         item.id === itemId && item.quantity > 1
    //           ? { ...item, quantity: item.quantity - 1 }
    //           : item
    //       ),
    //     }
    //   })
    // )
  }

  // Check if cart is empty
  const [cart, setCart] = useState<ICart>({} as ICart)
  const [dessert, setDessert] = useState([])
  const isCartEmpty = cartDays.every((day) => day.items.length === 0)

  const getCartData = useCallback(async () => {
    try {
      const data = await apiGetCart<ICartResponse>()
      console.log(data?.data)
      setCart(data?.data)
    } catch (error) {
      console.log(error)
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
  // Don't render the layout until we know if we're on desktop or mobile
  if (isDesktop === null) {
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
          backgroundColor: '#FAFAFA',
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
            }}
          >
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000' }}>Your Cart</Text>
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
                  {/* Cart sections by day */}
                  {cart?.days?.map((day, index) =>
                    day.items.length > 0 ? (
                      <CartDaySection
                        key={day.day}
                        day={day.day}
                        date={day?.date}
                        items={day.items}
                        deliveryLabel={'Some Lable'}
                        onIncrement={(itemId, change) => handleQuantityChange(change, itemId)}
                        onDecrement={(itemId, change) => handleQuantityChange(change, itemId)}
                      />
                    ) : (
                      <></>
                    )
                  )}

                  {/* Add more button */}
                  <AddMoreButton onPress={onAddMoreItems} />

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
                          buttonTitle="Checkout"
                          subtotal={totalAmount}
                          onCheckout={handleCheckout}
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
                      buttonTitle="Checkout"
                      subtotal={totalAmount}
                      onCheckout={handleCheckout}
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
