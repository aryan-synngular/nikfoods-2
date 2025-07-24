// components/AddressSearchInput.tsx
import { Platform } from 'react-native'
import { View } from 'tamagui'
import NativeSearch from './NativeAddressSearch'
import WebSearch from './WebAddressSearch'
import { useEffect } from 'react'

export const AddressSearchInput = () => {
  return <View>{Platform.OS === 'web' ? <WebSearch /> : <NativeSearch />}</View>
}
