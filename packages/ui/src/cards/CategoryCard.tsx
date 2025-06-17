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
      bg={selected ? '#FF9F0D' : '#FFF4E4'}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      style={{
        padding: 16,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        maxHeight: 250,

        width: 150,
        // Box shadow for React Native (mobile)
        shadowColor: '#AEAEC066',
        shadowOffset: { width: 10, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 0, // For Android
        // Box shadow for web
        boxShadow: '3px 3px 10px 0px #AEAEC066',
      }}
    >
      <YStack>
        <Circle size={100} overflow="hidden">
          <Image source={{ uri: imageUrl }} width="100%" height="100%" resizeMode="cover" />
        </Circle>
      </YStack>

      <Text fontSize={16} fontWeight="400" color={selected ? 'white' : '#2A1A0C'}>
        {name}
      </Text>

      <XStack>
        <Circle size={24} bg={selected ? 'white' : '#FF9F0D'}>
          <ArrowRight size={14} color={selected ? '#FF9F0D' : 'white'} />
        </Circle>
      </XStack>
    </YStack>
  )
}
