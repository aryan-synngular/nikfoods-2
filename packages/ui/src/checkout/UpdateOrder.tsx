'use client'

import { Platform } from 'react-native'
import UpdateOrderWeb from './UpdateOrder.web'
import UpdateOrderNative from './UpdateOrder.native'

export default function UpdateOrder() {
  if (Platform.OS === 'web') {
    return <UpdateOrderWeb />
  }
  return <UpdateOrderNative />
}
