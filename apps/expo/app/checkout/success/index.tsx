import { CheckoutSuccessPage } from '@my/ui'
import {CheckoutSuccessScreen} from 'app/features/checkout-success/screen'
import { Stack } from 'expo-router'
export default function Page() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Checkout Success',
          headerShown: false,
        }}
      />
      <CheckoutSuccessPage />
    </>
  )
}
