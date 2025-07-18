import { AccountCreatedPage } from '@my/ui'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account Created',
          headerShown: false,
        }}
      />
      <AccountCreatedPage />
    </>
  )
}
