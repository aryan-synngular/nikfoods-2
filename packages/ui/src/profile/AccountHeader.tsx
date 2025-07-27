// app/components/Header.tsx
import { Text, View } from 'tamagui'

export const Header = ({ title }: { title: string }) => (
  <View bg="$background" p="$4" borderColor="gray">
    <Text fontSize="$7" fontWeight="bold">
      {title}
    </Text>
  </View>
)
