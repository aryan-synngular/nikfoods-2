import React, { useMemo } from 'react'
import { CheckoutPage } from '@my/ui'
import { Platform, View, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native'
import { MOBILE_DEV_SERVER_URL } from 'app/constants/api.constant'
import { useEffect, useState } from 'react'
import { apiGenerateCheckoutToken } from 'app/services/OrderService'

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

  const baseCheckoutUrl = `${siteBaseUrl}/checkout`
  const [checkoutUrl, setCheckoutUrl] = useState<string>(baseCheckoutUrl)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiGenerateCheckoutToken<{
           token: string; expiresIn: number 
        }>()
        console.log('RES_____________', res)
        const token = res?.token
        if (token && !cancelled) {
          setCheckoutUrl(`${baseCheckoutUrl}?token=${encodeURIComponent(token)}`)
        }
      } catch (err) {
        if (!cancelled) setCheckoutUrl(baseCheckoutUrl)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [baseCheckoutUrl])
  const styles = StyleSheet.create({
    container: { flex: 1 },
  })
console.log(checkoutUrl)
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={styles.container}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#0b9c17ff" />
          </View>
        ) : (
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
        )}
      </SafeAreaView>
    </View>
  )
}
