import { LoginScreen } from 'app/features/login/screen'
import { Stack } from 'expo-router'
export default function Page() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Login',
          headerShown: false,
        }}
      />
      <LoginScreen />
    </>
  )
}
