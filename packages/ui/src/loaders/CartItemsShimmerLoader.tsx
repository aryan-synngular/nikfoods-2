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

function CartItemShimmer() {
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
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        elevation: 2,
      }}
    >
      <YStack
        style={{
          width: 60,
          height: 60,
          borderRadius: 4,
          marginRight: 16,
          backgroundColor: '#F5F5F5',
          overflow: 'hidden',
        }}
      >
        <Shimmer style={{ width: '100%', height: '100%', borderRadius: 4 }} />
      </YStack>
      <YStack style={{ flex: 1 }}>
        <Shimmer style={{ width: '60%', height: 16, borderRadius: 4, marginBottom: 8 }} />
        <Shimmer style={{ width: '40%', height: 12, borderRadius: 4 }} />
      </YStack>
      <XStack style={{ alignItems: 'center', marginRight: 24 }}>
        <Shimmer style={{ width: 80, height: 32, borderRadius: 4 }} />
      </XStack>
      <Shimmer style={{ width: 60, height: 18, borderRadius: 4, minWidth: 60 }} />
    </XStack>
  )
}

function DayTotalShimmer() {
  return (
    <XStack
      style={{
        paddingTop: 16,
        paddingBottom: 16,
        justifyContent: 'flex-end',
        gap: 20,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
      }}
    >
      <Shimmer style={{ width: 80, height: 16, borderRadius: 4 }} />
      <Shimmer style={{ width: 60, height: 20, borderRadius: 4 }} />
    </XStack>
  )
}

function CartDaySectionShimmer() {
  return (
    <YStack
      style={{
        marginBottom: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        paddingRight: 24,
        paddingLeft: 24,
        paddingTop: 4,
        paddingBottom: 4,
      }}
    >
      {/* Day header */}
      <XStack
        style={{
          paddingTop: 16,
          paddingBottom: 16,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Shimmer style={{ width: 180, height: 18, borderRadius: 4 }} />
        <Shimmer style={{ width: 100, height: 18, borderRadius: 4 }} />
        <Shimmer style={{ width: 120, height: 18, borderRadius: 4 }} />
      </XStack>
      {/* Items */}
      <YStack>
        {[...Array(3)].map((_, i) => (
          <CartItemShimmer key={i} />
        ))}
      </YStack>
      <DayTotalShimmer />
    </YStack>
  )
}

export function CartItemsShimmerLoader() {
  return (
    <YStack>
      {[...Array(2)].map((_, i) => (
        <CartDaySectionShimmer key={i} />
      ))}
    </YStack>
  )
}

export default CartItemsShimmerLoader
