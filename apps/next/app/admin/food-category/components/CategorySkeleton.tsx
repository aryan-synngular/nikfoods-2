import { XStack, YStack } from 'tamagui'

const CategoryCardSkeleton = () => {
  return (
    <YStack
      bg="#FFFFFF"
      borderBlockWidth={16}
      borderColor={'#F0F0F0'}
      p="$4"
      width={280}
      height={250}
      shadowColor="rgba(0,0,0,0.08)"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={1}
      shadowRadius={8}
      elevation={3}
      position="relative"
      overflow="hidden"
    >
      {/* Shimmer overlay effect */}
      <YStack
        position="absolute"
        top={0}
        left={-100}
        right={0}
        bottom={0}
        bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
        animation="lazy"
        animateOnly={['left']}
        style={{
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      />

      {/* Circular image skeleton */}
      <YStack alignItems="center" mb="$4">
        <YStack
          bg="#F0F0F0"
          borderRadius={60}
          width={120}
          height={120}
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Category name skeleton */}
      <YStack alignItems="center" space="$2">
        <YStack
          bg="#F0F0F0"
          borderRadius={6}
          height={18}
          width="70%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.3s',
            animationTimingFunction: 'ease-in-out',
          }}
        />

        {/* Action buttons skeleton */}
        <XStack gap="$2" mt={2} alignItems="center">
          <YStack
            bg="#F0F0F0"
            borderRadius={50}
            width={32}
            height={32}
            animation="lazy"
            animateOnly={['backgroundColor']}
            style={{
              animationDuration: '1.5s',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: '0.5s',
              animationTimingFunction: 'ease-in-out',
            }}
          />
        </XStack>
      </YStack>
    </YStack>
  )
}

export const CategorySkeleton = () => {
  return (
    <YStack space="$5" p="$4">
      {/* Header skeleton */}
      <XStack items="center" justify="space-between" mb="$3">
        <XStack items="center" gap={32}>
          <YStack
            bg="#F0F0F0"
            borderRadius={8}
            height={28}
            width={160}
            animation="lazy"
            animateOnly={['backgroundColor']}
            style={{
              animationDuration: '1.5s',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationTimingFunction: 'ease-in-out',
            }}
          />
        </XStack>
        <YStack
          bg="#E8F2FF"
          borderRadius={8}
          height={44}
          width={180}
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.2s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </XStack>

      {/* Category cards skeleton grid */}
      <XStack gap="$4" flexWrap="wrap" justify="flex-start" style={{ paddingTop: 20 }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <CategoryCardSkeleton key={index} />
        ))}
      </XStack>
    </YStack>
  )
}
