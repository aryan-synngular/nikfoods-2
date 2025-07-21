import { useColorScheme, Platform } from 'react-native'
import {
  CustomToast,
  TamaguiProvider,
  type TamaguiProviderProps,
  ToastProvider,
  config,
  isWeb,
} from '@my/ui'
import { ToastViewport } from './ToastViewport'
import { ActivityIndicator, View } from 'react-native'
// Only import useFonts on native platforms
// This prevents Next.js from trying to process TTF files
let useFontsHook: () => boolean;
if (Platform.OS !== 'web') {
  const { useFonts } = require('./useFonts');
  useFontsHook = useFonts;
} else {
  // Mock implementation for web
  useFontsHook = () => true;
}

export function Provider({
  children,
  defaultTheme = 'light',
  ...rest
}: Omit<TamaguiProviderProps, 'config'> & { defaultTheme?: string }) {
  const colorScheme = useColorScheme()
  const theme = defaultTheme || (colorScheme === 'dark' ? 'dark' : 'light')
  const fontsLoaded = useFontsHook()

  // Show a loading indicator while fonts are loading (only on native)
  if (!fontsLoaded && !isWeb) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    )
  }

  return (
    <TamaguiProvider config={config} defaultTheme={theme} {...rest}>
      <ToastProvider swipeDirection="horizontal" duration={6000} native={isWeb ? [] : ['mobile']}>
        {children}
        <CustomToast />
        <ToastViewport />
      </ToastProvider>
    </TamaguiProvider>
  )
}
