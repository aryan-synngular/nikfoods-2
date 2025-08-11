import { YStack, XStack, Circle } from 'tamagui'
import { useWindowDimensions } from 'react-native'

function Shimmer({ style }: { style?: any }) {
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

export function FoodListShimmerLoader({ count = 16 }: { count?: number }) {
  const { width } = useWindowDimensions()
  const isMobile = width < 600
  const cardCount = count || (isMobile ? 6 : 16)
  return (
    <YStack style={{ paddingTop: 20, paddingBottom: 20 }}>
      <XStack
        flexWrap="wrap"
        gap={24}
        style={{ justifyContent: 'flex-start', paddingHorizontal: 20 }}
      >
        {Array.from({ length: cardCount }).map((_, i) => (
          <YStack key={i} width={200} style={{ alignItems: 'center', marginBottom: 16 }}>
            <YStack width={180} style={{ alignItems: 'center' }}>
              <Circle
                size={100}
                overflow="hidden"
                style={{
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.15)',
                  zIndex: 2,
                  marginBottom: -70,
                }}
              >
                <Shimmer style={{ width: '100%', height: '100%', borderRadius: 999 }} />
              </Circle>
              <YStack
                width={180}
                style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'white' }}
                boxShadow="10px 10px 20px rgba(0, 0, 0, 0.1)"
              >
                <YStack height={70} />
                <YStack style={{ padding: 16, gap: 12 }}>
                  <Shimmer style={{ width: 100, height: 16, borderRadius: 8, marginBottom: 8 }} />
                  <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Shimmer style={{ width: 60, height: 16, borderRadius: 8 }} />
                    <Shimmer style={{ width: 60, height: 24, borderRadius: 12 }} />
                  </XStack>
                </YStack>
              </YStack>
            </YStack>
          </YStack>
        ))}
      </XStack>
    </YStack>
  )
}

export default FoodListShimmerLoader
