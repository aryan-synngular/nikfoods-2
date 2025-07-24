// components/platform/NativeAddressSearch.tsx
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
// import { GOOGLE_PLACES_API_KEY } from '@env' // or load securely

export default function NativeAddressSearch() {
  return (
    <GooglePlacesAutocomplete
      placeholder="Search for your address"
      fetchDetails={true}
      onPress={(data, details = null) => {
        console.log('Selected:', data, details)
      }}
      query={{
        key: 'GOOGLE_PLACES_API_KEY',
        language: 'en',
      }}
      styles={{
        textInput: {
          height: 40,
          borderRadius: 8,
          paddingHorizontal: 10,
        },
      }}
    />
  )
}
