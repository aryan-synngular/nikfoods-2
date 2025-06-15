import { Image, Text, YStack, XStack, Circle } from 'tamagui'
import { ArrowRight } from '@tamagui/lucide-icons'

interface CategoryCardProps {
  imageUrl: string
  name: string
  selected?: boolean
  onPress?: () => void
}

export function CategoryCard({ imageUrl, name, selected = false, onPress }: CategoryCardProps) {
  return (
    <YStack
      bg={selected ? '#FFF4E4' : '#d47b1a'}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      style={{
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <YStack>
        <Circle size={100} overflow="hidden">
          <Image source={{ uri: imageUrl }} width="100%" height="100%" resizeMode="cover" />
        </Circle>
      </YStack>

      <Text fontSize={16} fontWeight="600" color={selected ? '#2A1A0C' : 'white'}>
        {name}
      </Text>

      <XStack>
        <Circle size={24} bg={selected ? '#d47b1a' : 'white'}>
          <ArrowRight size={14} color={selected ? 'white' : '#d47b1a'} />
        </Circle>
      </XStack>
    </YStack>
  )
}
