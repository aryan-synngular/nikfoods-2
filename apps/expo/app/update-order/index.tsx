import UpdateOrderScreen from 'app/features/update-order/screen'

import { Stack } from 'expo-router'
export default function Page() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Update Order',
          headerShown: false,
        }}
      />
      <UpdateOrderScreen/>
    </>
  )
}
