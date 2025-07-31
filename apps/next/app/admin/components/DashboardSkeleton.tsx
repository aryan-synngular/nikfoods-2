import { YStack, XStack, Text } from 'tamagui'

// Individual stat card skeleton
const StatCardSkeleton = ({ index }: { index: number }) => {
  return (
    <YStack
      width={240}
      height={120}
      borderRadius="$4"
      bg="#F6FAFF"
      p="$4"
      mb="$4"
      mr="$4"
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
          animationDelay: `${index * 0.1}s`,
        }}
      />

      <XStack space alignItems="center" height="100%">
        {/* Icon skeleton */}
        <YStack
          width={56}
          height={56}
          borderRadius={28}
          bg="#F0F0F0"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}
        />

        {/* Text skeleton */}
        <YStack ml="$3" gap="$2">
          <YStack
            bg="#F0F0F0"
            borderRadius={4}
            height={28}
            width={120}
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
          <YStack
            bg="#F0F0F0"
            borderRadius={4}
            height={18}
            width={80}
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
        </YStack>
      </XStack>
    </YStack>
  )
}

// Main dashboard skeleton component
export const DashboardSkeleton = () => {
  return (
    <YStack space="$6">
      {/* Title skeleton */}
      <YStack position="relative" overflow="hidden">
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
        <YStack
          bg="#F0F0F0"
          borderRadius={8}
          height={24}
          width={200}
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

      {/* Stats cards skeleton */}
      <XStack flexWrap="wrap" gap={24} px={6}>
        {Array.from({ length: 5 }).map((_, index) => (
          <StatCardSkeleton key={index} index={index} />
        ))}
      </XStack>
    </YStack>
  )
}
