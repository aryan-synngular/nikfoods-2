import { SignupStep2Screen } from 'app/features/signup/step2-screen'
import { Stack } from 'expo-router'

export default function Page() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'AddAddress',
          headerShown: false,
        }}
      />
      <SignupStep2Screen />
    </>
  )
}
