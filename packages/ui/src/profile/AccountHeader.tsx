// app/components/Header.tsx
import { Text, View } from 'tamagui'
import {useScreen} from "app/hook/useScreen"
export const Header = ({ title }: { title: string }) => {
  
  const {isMobile }=useScreen() 

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
