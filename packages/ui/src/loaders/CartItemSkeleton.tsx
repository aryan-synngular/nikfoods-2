'use client'

import { useEffect, useState } from 'react'
import { XStack, YStack, View } from 'tamagui'

export function CartItemSkeleton() {
  const [shimmerOpacity, setShimmerOpacity] = useState(0.3)

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerOpacity((prev) => (prev === 0.3 ? 0.7 : 0.3))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const shimmerStyle = {
    backgroundColor: '#E5E5E5',
    opacity: shimmerOpacity,
    borderRadius: 4,
    transition: 'opacity 1s ease-in-out',
  }

  return (
    <XStack
      style={{
        paddingBottom: 8,
        paddingTop: 8,
        paddingRight: 8,
        paddingLeft: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
      }}
    >
      {/* Product image skeleton */}
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 4,
          marginRight: 16,
          ...shimmerStyle,
        }}
      />

      {/* Product details skeleton */}
      <YStack style={{ flex: 1, gap: 8 }}>
        <View
          style={{
            height: 16,
            width: '70%',
            ...shimmerStyle,
          }}
        />
        <View
          style={{
            height: 14,
            width: '90%',
            ...shimmerStyle,
          }}
        />
      </YStack>

      {/* Quantity selector skeleton */}
      <XStack
        style={{
          alignItems: 'center',
          marginRight: 24,
        }}
      >
        <View
          style={{
            width: 96,
            height: 32,
            borderRadius: 4,
            ...shimmerStyle,
          }}
        />
      </XStack>

      {/* Price skeleton */}
      <View
        style={{
          height: 18,
          width: 60,
          ...shimmerStyle,
        }}
      />
    </XStack>
  )
}
