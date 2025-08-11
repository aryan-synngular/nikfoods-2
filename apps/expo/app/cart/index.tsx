import { CartPage as CartPageComponent } from '@my/ui'
import { Stack } from 'expo-router'

export default function CartPage() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Cart',
          headerShown: false, // Hide the default Expo header
        }}
      />
      <CartPageComponent />
    </>
  )
}
