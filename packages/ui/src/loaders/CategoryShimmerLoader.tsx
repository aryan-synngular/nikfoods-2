import { YStack, XStack, Circle } from 'tamagui'
import { useWindowDimensions } from 'react-native'
import React from 'react'
import { useScreen } from 'app/hook/useScreen'

function Shimmer({ style }: { style?: any }) {
  // Use a simple shimmer effect with background gradient for web, solid for native
  return (
    <YStack
      bg="#ececec"
      style={{
        ...style,
        opacity: 0.7,
        overflow: 'hidden',
        position: 'relative',
      }}
      className="shimmer-effect"
    />
  )
}

export function CategoryShimmerLoader({ count = 13 }: { count?: number }) {
  const { width } = useWindowDimensions()
 const  {isMobile,isMobileWeb}=useScreen()
  // Responsive: show fewer cards on mobile
  const cardCount = count || (isMobile ? 8 : 13)
  return (
    <XStack mt={(isMobile||isMobileWeb)?25:0} gap={16} style={{ padding: (isMobile||isMobileWeb)?10:20, justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
      {Array.from({ length: cardCount }).map((_, i) => (
        <YStack
          key={i}
          bg="#FFF4E4"
          style={{
            padding: 16,
            borderRadius: 12,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
            maxHeight: 250,
            width: 150,
            minWidth: 120,
            boxShadow: '3px 3px 10px 0px #AEAEC066',
          }}
        >
          <Circle size={100} overflow="hidden">
            <Shimmer style={{ width: '100%', height: '100%', borderRadius: 999 }} />
          </Circle>
          <Shimmer style={{ width: 80, height: 16, borderRadius: 8 }} />
          <Circle size={24} bg="#FF9F0D">
            <Shimmer style={{ width: '100%', height: '100%', borderRadius: 999 }} />
          </Circle>
        </YStack>
      ))}
    </XStack>
  )
}

export default CategoryShimmerLoader
