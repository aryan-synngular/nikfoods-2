'use client'

import { Text, XStack } from 'tamagui'
import { Plus } from '@tamagui/lucide-icons'
import { useScreen } from 'app/hook/useScreen'
interface AddMoreButtonProps {
  onPress?: () => void
}

export function AddMoreButton({ onPress }: AddMoreButtonProps) {
  const { isMobile, isMobileWeb } = useScreen()
  return (
    <XStack
      onPress={onPress}
      style={{
        backgroundColor: '#FFF8EE',
        borderRadius: 8,
        padding: 16,
        marginVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#FFE0B2',
        cursor: 'pointer',
        marginHorizontal: isMobile || isMobileWeb ? 12 : 24,
      }}
      pressStyle={{ opacity: 0.8 }}
    >
      <Plus size={16} color="#FF9F0D" style={{ marginRight: 8 }} />
      <Text
        style={{
          fontSize: 14,
          color: '#FF9F0D',
          fontWeight: '600',
        }}
      >
        Add more items
      </Text>
    </XStack>
  )
}
