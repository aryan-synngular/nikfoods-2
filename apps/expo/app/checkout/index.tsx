import CheckoutScreen from 'app/features/checkout/screen'
import { Stack } from 'expo-router'
export default function Page() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Checkout',
          headerShown: false,
        }}
      />
      <CheckoutScreen />
    </>
  )
}
