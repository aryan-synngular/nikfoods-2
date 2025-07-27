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

export function CartSummaryShimmerLoader() {
  return (
    <YStack
      style={{
        padding: 24,
        gap: 20,
        backgroundColor: 'white',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      <Shimmer style={{ width: 120, height: 24, borderRadius: 4, marginBottom: 8 }} />
      {/* Subtotal */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Shimmer style={{ width: 80, height: 18, borderRadius: 4 }} />
        <Shimmer style={{ width: 60, height: 18, borderRadius: 4 }} />
      </XStack>
      {/* Other */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Shimmer style={{ width: 80, height: 18, borderRadius: 4 }} />
        <Shimmer style={{ width: 40, height: 18, borderRadius: 4 }} />
      </XStack>
      {/* Coupon input */}
      <XStack
        style={{
          borderWidth: 1,
          borderColor: '#E0E0E0',
          borderRadius: 12,
          overflow: 'hidden',
          height: 42,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Shimmer style={{ width: 32, height: 24, borderRadius: 4, marginLeft: 16 }} />
        <Shimmer style={{ width: 120, height: 24, borderRadius: 4 }} />
        <Shimmer style={{ width: 60, height: 32, borderRadius: 8, marginRight: 16 }} />
      </XStack>
      {/* Divider */}
      <YStack style={{ height: 1, backgroundColor: '#E0E0E0' }} />
      {/* Total */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Shimmer style={{ width: 80, height: 20, borderRadius: 4 }} />
        <Shimmer style={{ width: 60, height: 28, borderRadius: 4 }} />
      </XStack>
      {/* Checkout button */}
      <Shimmer style={{ width: '100%', height: 40, borderRadius: 8, marginTop: 6 }} />
      {/* Credit card acceptance text */}
      <Shimmer style={{ width: '60%', height: 14, borderRadius: 4, alignSelf: 'center' }} />
    </YStack>
  )
}

export default CartSummaryShimmerLoader
