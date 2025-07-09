import { SignupScreen } from 'app/features/signup/screen'
import { Stack } from 'expo-router'

export default function Page() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Signup',
          headerShown: false,
        }}
      />
      <SignupScreen />
    </>
  )
}
