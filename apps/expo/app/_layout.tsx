import { useLink } from 'solito/navigation'
import { AuthProvider, useAuth } from 'app/provider/auth-context'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { SplashScreen, Stack, usePathname, Redirect } from 'expo-router'
import { Provider } from 'app/provider'
import { NativeToast } from '@my/ui/src/NativeToast'
import { StripeProvider } from '@stripe/stripe-react-native'

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

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const path = usePathname()

  const publicRoutes = new Set([
    '/login',
    '/signup',
    '/signup/step2',
    '/checkout',
    '/account-created',
  ])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  const isPublic = publicRoutes.has(path)

  if (!user && !isPublic) {
    return <Redirect href="/login" />
  }

  if (
    user &&
    (path === '/login' || path === '/signup' || path === '/signup/step2')
  ) {
    return <Redirect href="/" />
  }

  return <>{children}</>
}
console.log("EXPO KEY")
console.log(process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY)
function RootLayoutNav() {
  return (
    <Provider>
      <AuthProvider>
        <StripeProvider
          publishableKey={
            process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
            ''
          }
          merchantIdentifier={process.env.EXPO_PUBLIC_STRIPE_MERCHANT_ID || ''}
          urlScheme={process.env.EXPO_PUBLIC_URL_SCHEME || 'nikfoods'}
        >
          <ThemeProvider value={DefaultTheme}>
            <AuthGate>
              <Stack></Stack>
            </AuthGate>
            <NativeToast />
          </ThemeProvider>
        </StripeProvider>
      </AuthProvider>
    </Provider>
  )
}
