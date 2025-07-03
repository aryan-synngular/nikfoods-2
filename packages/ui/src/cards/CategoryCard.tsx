import { Image, Text, YStack, XStack, Circle } from 'tamagui'
import { ArrowRight } from '@tamagui/lucide-icons'
import { useState } from 'react'

interface CategoryCardProps {
  imageUrl: string
  name: string
  selected?: boolean
  onPress?: () => void
}

export function CategoryCard({ imageUrl, name, selected = false, onPress }: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Determine background color based on hover and selected states
  const bgColor = selected || isHovered ? '#FF9F0D' : '#FFF4E4';
  // Determine text color based on background (for better contrast)
  const textColor = selected || isHovered ? 'white' : '#2A1A0C';
  
  return (
    <YStack
      bg={bgColor}
      onPress={onPress}
      pressStyle={{ opacity: 0.8 }}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={{
        transform: [{ translateY: isHovered ? -5 : 0 }],
        transition: 'all 0.3s ease',
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
        // Box shadow for web - changes based on hover state
        boxShadow: isHovered 
          ? '3px 8px 15px 0px #AEAEC099' 
          : '3px 3px 10px 0px #AEAEC066',
        // Add cursor pointer for web
        cursor: 'pointer',
      }}
    >
      <YStack>
        <Circle size={100} overflow="hidden">
          <Image source={{ uri: imageUrl }} width="100%" height="100%" resizeMode="cover" />
        </Circle>
      </YStack>

      <Text fontSize={16} fontWeight="400" color={textColor}>
        {name}
      </Text>

      <XStack>
        <Circle size={24} bg={selected || isHovered ? 'white' : '#FF9F0D'}>
          <ArrowRight size={14} color={selected || isHovered ? '#FF9F0D' : 'white'} />
        </Circle>
      </XStack>
    </YStack>
  )
}
