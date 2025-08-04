// app/components/Header.tsx
import { Text, View } from 'tamagui'
import { Platform, Dimensions } from 'react-native'

export const Header = ({ title }: { title: string }) => {
  const { width } = Dimensions.get('window')
  const isWeb = Platform.OS === 'web'
  const isMobile = !isWeb || width < 768

  if (isMobile) {
    return (
      <View p="$1" borderColor="gray">
        <Text fontSize="$6" fontWeight="bold">
          {title}
        </Text>
      </View>
    )
  }

  // Web version (your original design)
  return (
    <View bg="$background" p="$4" borderColor="gray">
      <Text fontSize="$7" fontWeight="bold">
        {title}
      </Text>
    </View>
  )
}
