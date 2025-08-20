import PaymentPageWeb from './PaymentPage.web'
import PaymentPageNative from './PaymentPage.native'
import { Platform } from 'react-native'

export default function PaymentPage(props: any) {
  if (Platform.OS === 'web') {
    // @ts-ignore
    return <PaymentPageWeb {...props} />
  }
  // @ts-ignore
  return <PaymentPageNative {...props} />
}
