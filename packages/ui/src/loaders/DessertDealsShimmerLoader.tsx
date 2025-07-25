import { YStack, XStack } from 'tamagui'
import React from 'react'

function Shimmer({ style }: { style?: any }) {
  return (
    <YStack
      bg="#ececec"
      style={{ ...style, opacity: 0.7, overflow: 'hidden', position: 'relative' }}
      className="shimmer-effect"
    />
  )
}

function DessertDealShimmer() {
  return (
    <XStack
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 8,
        backgroundColor: 'white',
        marginBottom: 12,
        alignItems: 'center',
      }}
    >
      <YStack
        style={{
          width: 70,
          height: 70,
          borderRadius: 8,
          marginRight: 12,
          backgroundColor: '#F5F5F5',
          overflow: 'hidden',
        }}
      >
        <Shimmer style={{ width: '100%', height: '100%', borderRadius: 8 }} />
      </YStack>
      <YStack style={{ flex: 1, justifyContent: 'center' }}>
        <Shimmer style={{ width: '60%', height: 16, borderRadius: 4, marginBottom: 4 }} />
        <Shimmer style={{ width: '80%', height: 13, borderRadius: 4, marginBottom: 8 }} />
        <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Shimmer style={{ width: 60, height: 16, borderRadius: 4 }} />
          <Shimmer style={{ width: 60, height: 32, borderRadius: 4 }} />
        </XStack>
      </YStack>
    </XStack>
  )
}

export function DessertDealsShimmerLoader() {
  return (
    <YStack style={{ padding: 20 }}>
      <XStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Shimmer style={{ width: 180, height: 18, borderRadius: 4 }} />
      </XStack>
      <YStack style={{ gap: 12 }}>
        {[...Array(3)].map((_, i) => (
          <DessertDealShimmer key={i} />
        ))}
      </YStack>
    </YStack>
  )
}

export default DessertDealsShimmerLoader
