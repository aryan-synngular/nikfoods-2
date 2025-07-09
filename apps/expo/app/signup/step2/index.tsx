import { SignupStep2Screen } from 'app/features/signup/step2-screen'
import { Stack } from 'expo-router'

export default function Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Create Account',
          headerShown: false,
        }}
      />
      <SignupStep2Screen />
    </>
  )
}
