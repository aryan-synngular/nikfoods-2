import React, { useMemo } from 'react'
import { CheckoutPage } from '@my/ui'
import { Platform, View, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native'
import { MOBILE_DEV_SERVER_URL } from 'app/constants/api.constant'

export default function CheckoutScreen() {
  if (Platform.OS === 'web') {
    return <CheckoutPage />
  }

  // Require WebView only on native to avoid bundling issues on web
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { WebView } = require('react-native-webview')

  const siteBaseUrl = useMemo(() => {
    try {
      // Remove trailing /api/ or /api from MOBILE_DEV_SERVER_URL to get site origin
      const trimmed = MOBILE_DEV_SERVER_URL.replace(/\/?api\/?$/, '')
      return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
    } catch {
      return 'http://localhost:3000'
    }
  }, [])

  const checkoutUrl = `${siteBaseUrl}/checkout`
  const styles = StyleSheet.create({
    container: { flex: 1 },
  })

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={styles.container}>
        <WebView
          source={{ uri: checkoutUrl }}
          style={{ flex: 1 }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#0b9c17ff" />
            </View>
          )}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
        />
      </SafeAreaView>
    </View>
  )
}
