import React from 'react'
import { YStack, XStack, Circle, Square, Separator } from 'tamagui'

// Skeleton Loader Components
export const SkeletonLine = ({
  width,
  height = 16,
}: {
  width: string | number
  height?: number
}) => (
  <YStack
    width={typeof width === 'string' ? undefined : width}
    style={{
      width: typeof width === 'string' ? width : undefined,
      height,
      backgroundColor: '#f0f0f0',
      borderRadius: 4,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }}
  />
)

export const SkeletonCircle = ({ size = 20 }: { size?: number }) => (
  <Circle
    size={size}
    style={{
      backgroundColor: '#f0f0f0',
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }}
  />
)

export const OrderCardSkeleton = () => (
  <YStack
    style={{ borderRadius: 12 }}
    bg="white"
    p="$4"
    shadowColor="#000"
    shadowOffset={{ width: 0, height: 2 }}
    shadowOpacity={0.1}
    shadowRadius={8}
    elevation={3}
  >
    {/* Header Skeleton */}
    <XStack mb="$3" justify="space-between">
      <YStack space="$2" flex={1}>
        <SkeletonLine width="70%" height={18} />
        <SkeletonLine width="50%" height={14} />
      </YStack>
      <SkeletonLine width="25%" height={36} />
    </XStack>

    {/* Items Skeleton */}
    <YStack gap={16}>
      {[1, 2].map((item) => (
        <YStack key={item} pt="$3" gap="$1" borderTopWidth={1} borderTopColor="#E0E0E0">
          <XStack gap="$2" justify="space-between" mb="$2">
            <SkeletonLine width="40%" height={14} />
            <SkeletonLine width="35%" height={14} />
          </XStack>

          <XStack>
            <XStack gap="$2" flex={1}>
              <XStack gap="$2" px="$2" justify="center" items="center">
                <SkeletonCircle size={20} />
                <SkeletonLine width="60%" height={12} />
              </XStack>
            </XStack>

            <YStack gap="$2" pt={4}>
              <SkeletonLine width="80px" height={14} />
            </YStack>
          </XStack>
        </YStack>
      ))}
    </YStack>

    {/* Footer Skeleton */}
    <YStack mt="$4" pt="$3" borderTopWidth={1} borderTopColor="#E0E0E0">
      <XStack justify="flex-end" mb="$3">
        <SkeletonLine width="30%" height={14} />
      </XStack>
      <XStack gap="$3" justify="space-between">
        <XStack gap={10}>
          <SkeletonLine width="80px" height={36} />
          <SkeletonLine width="60px" height={36} />
        </XStack>
        <SkeletonLine width="80px" height={36} />
      </XStack>
    </YStack>
  </YStack>
)

export const OrderDetailsSkeleton = () => (
  <YStack p="$4" space="$4">
    {/* Store Info Skeleton */}
    <YStack space="$3">
      <XStack items="center" space="$2">
        <SkeletonCircle size={16} />
        <YStack space="$1" flex={1}>
          <SkeletonLine width="60%" height={18} />
          <SkeletonLine width="40%" height={14} />
        </YStack>
      </XStack>

      <XStack items="center" space="$2">
        <SkeletonCircle size={16} />
        <YStack space="$1" flex={1}>
          <SkeletonLine width="30%" height={18} />
          <SkeletonLine width="80%" height={14} />
        </YStack>
      </XStack>
    </YStack>

    {/* Order Items Skeleton */}
    <YStack space="$4">
      {[1, 2, 3].map((item) => (
        <YStack key={item} space="$2">
          <XStack justify="space-between" items="center">
            <SkeletonLine width="40%" height={18} />
            <SkeletonLine width="30%" height={14} />
          </XStack>

          {[1, 2].map((product) => (
            <XStack key={product} justify="space-between" items="center" py="$1">
              <XStack items="center" space="$2" flex={1}>
                <SkeletonCircle size={8} />
                <SkeletonLine width="60%" height={16} />
              </XStack>
              <SkeletonLine width="15%" height={16} />
            </XStack>
          ))}
        </YStack>
      ))}
    </YStack>

    {/* Totals Skeleton */}
    <YStack space="$2">
      <Separator borderColor="#f0f0f0" />
      {[1, 2, 3, 4, 5].map((item) => (
        <XStack key={item} justify="space-between" items="center" py="$1">
          <SkeletonLine width="40%" height={16} />
          <SkeletonLine width="20%" height={16} />
        </XStack>
      ))}

      <Separator borderColor="#f0f0f0" />
      <XStack justify="space-between" items="center" py="$3">
        <SkeletonLine width="30%" height={20} />
        <SkeletonLine width="25%" height={20} />
      </XStack>
    </YStack>
  </YStack>
)
