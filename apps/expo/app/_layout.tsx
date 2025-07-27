import { useLink } from 'solito/navigation'
import { AuthProvider, useAuth } from 'app/provider/auth-context'
import { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack } from 'expo-router'
import { Provider } from 'app/provider'
import { NativeToast } from '@my/ui/src/NativeToast'
import * as SecureStore from 'expo-secure-store'
import { usePathname } from 'expo-router'
export const unstable_settings = {
  // Ensure that reloading on `/user` keeps a back button present.
  initialRouteName: 'Home',
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function App() {
  const [interLoaded, interError] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after the fonts have loaded (or an error was returned) and the UI is ready.
      SplashScreen.hideAsync()
    }
  }, [interLoaded, interError])

  if (!interLoaded && !interError) {
    return null
  }

  return <RootLayoutNav />
}

function RootLayoutNav() {
  const path = usePathname()
  console.log(path)
  const { user, loading } = useAuth()
  console.log(user)
  console.log(loading)
  const colorScheme = useColorScheme()
  // const [loading, setLoading] = useState(true)
  const loginLink = useLink({
    href: '/login',
  })
  const addAddressLink = useLink({
    href: '/add-address',
  })
  const homeLink = useLink({
    href: '/',
  })
  useEffect(() => {
    const checkUser = async () => {
      try {
        const publicRoutes = ['/login', '/signup']
        if (publicRoutes.includes(path)) {
          return
        }
        // setLoading(true)
        const token = await SecureStore.getItemAsync('token')
        if (token) {
          const storedUser = await SecureStore.getItemAsync('user')

          if (storedUser) {
            const userObj = JSON.parse(storedUser)
            if (!userObj.isCompleted) {
              addAddressLink.onPress()
            } else {
              homeLink.onPress()
            }
          } else {
            console.log('Not Logged In No user')
            loginLink.onPress()
          }
        } else {
          console.log('Not Logged In No Token')
          loginLink.onPress()
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        // setLoading(false)
      }
    }
    checkUser()
  }, [])
  return (
    <Provider>
      <AuthProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack></Stack>
          <NativeToast />
        </ThemeProvider>
      </AuthProvider>
    </Provider>
  )
}
