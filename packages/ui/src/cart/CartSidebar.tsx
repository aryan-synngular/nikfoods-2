"use client"
import { useEffect, useState } from "react"
import {
  Button,
  Image,
  Separator,
  Text,
  XStack,
  YStack,
  H3,
  H4,
  ScrollView,
  Spinner,
} from "tamagui"
import { ArrowRight, Minus, Plus } from "@tamagui/lucide-icons"
import { useStore } from 'app/src/store/useStore'
import { useToast } from '../useToast' // adjust import if needed
import { useLink } from "solito/navigation"
import { set } from "date-fns"
import { colors } from "../colors"

export default function CartSidebar() {
  const { cart, updateCartItemQuantity,cartTotalAmount } = useStore()
  // const [isLoading, setIsLoading] = useState(true)
  const { showMessage } = useToast()
const [loading, setLoading] = useState({ itemId: "", change: 0 })
  const checkOutLink = useLink({
    href: '/checkout',
  })



  // Map API cart to UI cartData
  const cartData = (cart?.days || []).filter(day => day.items.length > 0).map(day => ({
    day: day.day,
    items: day.items.map(item => ({
      id: item._id,
      name: item.food?.name,
      image: item.food?.url || "/api/placeholder/80/80",
      quantity: item.quantity,
      price: item.food?.price || 0,
    })),
  }))

  const totalAmount = cartData.reduce((total, day) =>
    total + day.items.reduce((dayTotal, item) => dayTotal + (item.price * item.quantity), 0), 0
  )

  // Add API quantity change logic
  const handleQuantityChange = async (itemId: string, change: number) => {
    try {
      if (change === 0) return // No change needed
      setLoading({ itemId, change })
      await updateCartItemQuantity({ cartItemId: itemId, change })
      showMessage('Quantity Updated Successfully', 'success')
    } catch (error) {
      showMessage('Failed to update quantity', 'error')
    } finally {
      setLoading({ itemId: "", change: 0 })
    }
  }

  const CartItemComponent = ({ item }) => (
    <XStack
      style={{
        padding: 12,
        backgroundColor: "white",
        borderRadius: 12,
        marginBottom: 8,
        alignItems: "center",
        justifyContent: "space-between"
      }}
    >
      <XStack style={{ alignItems: "center", flex: 1 }}>
        <Image
          source={{ uri: item.image }}
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            marginRight: 12
          }}
        />
        <YStack style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#1a1a1a",
              marginBottom: 4
            }}
          >
            {item.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#5a5858ff",
              marginBottom: 4,
              marginTop: 2
            }}
          >
           ${item.price}
          </Text>
          <XStack style={{ alignItems: "center" }}>
            <Button
              size="$2"
              circular
              style={{
                width: 24,
                height: 24,
                backgroundColor: "#f5f5f5",
                borderWidth: 1,
                borderColor: "#e0e0e0"
              }}
              onPress={() => handleQuantityChange(item.id, -1)}
              disabled={loading.itemId === item.id && loading.change === -1}
            >
              {loading.itemId === item.id && loading.change === -1 ? (
                <Spinner   color={colors.primary} />
              ) : (
                <Minus size={12} color="#666" />
              )}
            </Button>
            <Text
              style={{
                marginHorizontal: 12,
                fontSize: 16,
                fontWeight: "500",
                minWidth: 20,
                textAlign: "center"
              }}
            >
              {item.quantity}
            </Text>
            <Button
              size="$2"
              circular
              style={{
                width: 24,
                height: 24,
                backgroundColor: "#f5f5f5",
                borderWidth: 1,
                borderColor: "#e0e0e0"
              }}
              onPress={() => handleQuantityChange(item.id, 1)}
              disabled={loading.itemId === item.id && loading.change === 1}
            >
             {loading.itemId === item.id && loading.change === 1 ? (
               <Spinner color={colors.primary} />
             ) : (
               <Plus size={12} color="#666" />
             )}
            </Button>
          </XStack>
        </YStack>
      </XStack>
    </XStack>
  )

  return (
    <YStack
      style={{
        backgroundColor: "#f8f9fa",
        padding: 20,
        width: '100%',
        position: 'sticky',
        top: 60,
        height: 'calc(100vh - 80px)',
        overflowY: 'auto',
        borderLeft: '1px solid #e0e0e0',
        alignSelf: 'flex-start'
      }}
    >
      <H3
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: "#1a1a1a",
        }}
      >
        Your Cart
      </H3>

   
        <>
        <ScrollView  showsVerticalScrollIndicator={false} >

          <YStack style={{ flex: 1 }}>
            {cartData.map((dayCart, index) => (
              <YStack key={index} style={{ marginBottom: 16 }}>
                <H4
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: 8
                  }}
                >
                 {dayCart.day}'s cart
                </H4>
                {dayCart.items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </YStack>
            ))}
          </YStack>
          
          </ScrollView>
         {cartTotalAmount>0&& <YStack style={{
            position: "sticky",
            bottom: 0,
            backgroundColor: "white",
            width: "100%",
            zIndex: 20,
            boxShadow: "0 -2px 8px rgba(0,0,0,0.04)",
            paddingTop: 12,
            paddingLeft: 20,
            paddingRight: 20,
          }}
          >
            <XStack
              style={{
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: "#1a1a1a"
                }}
              >
                Total
              </Text>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: "#1a1a1a"
                }}
              >
                ${cartTotalAmount}
              </Text>
            </XStack>
         
                 <Button
                       onPress={() => {
                         checkOutLink.onPress()
                       }}
                       style={{
                         backgroundColor: '#FF9F0D',
                         borderRadius: 8,
                         height: 40,
                         marginTop: 6,
                         flexDirection: 'row',
                         alignItems: 'center',
                         justifyContent: 'center',
                         fontWeight: 600,
                         color: 'white',
                         marginBottom: 8,
                       }}
                       iconAfter={loading.itemId === "" && loading.change === 0 ? (
                         <ArrowRight fontWeight={600} color="white" />
                       ) : (
                         <Spinner color="white" />
                       )}
                       disabled={loading.itemId !== "" || loading.change !== 0}
                     >
                       Checkout
                     </Button>
            <Text
              style={{
                fontSize: 12,
                color: "#666",
                textAlign: "center"
              }}
            >
              We accept all major credit cards
            </Text>
          </YStack>}
        </>
    
    </YStack>
  )
}