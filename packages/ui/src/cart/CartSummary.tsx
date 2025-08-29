'use client'
import { useState } from 'react'
import { Button, Input, Spinner, Text, XStack, YStack } from 'tamagui'
import { ArrowRight } from '@tamagui/lucide-icons'
import { useStore } from 'app/src/store/useStore'
import { useScreen } from 'app/hook/useScreen'

interface CartSummaryProps {
  subtotal: number
  onCheckout: () => void
  deliveryFee?: number
  tax?: number
  buttonTitle: string
  loading?: { itemId: string; change: number }
  disabled?: boolean
  disabledMessage?: string
}

export function CartSummary({
  subtotal,
  onCheckout,
  buttonTitle = '',
  deliveryFee = 2.99,
  tax = 0,
  loading = { itemId: '', change: 0 },
  disabled = false,
  disabledMessage = '',
}: CartSummaryProps) {
  const { isMobile, isMobileWeb } = useScreen()
  const { cartTotalAmount } = useStore()
  const [couponCode, setCouponCode] = useState('')
  const total = Math.round(subtotal) // Simplified for the example to match the image

  return (
    <YStack
      style={{ padding: (isMobile || isMobileWeb )? 12 : 24, gap: (isMobile || isMobileWeb) ? 6 : 20 }}
    >
      {/* Summary header */}
      <Text
        style={{ fontSize: (isMobile || isMobileWeb) ? 18 : 24, fontWeight: (isMobile || isMobileWeb)?"700":'600', color: '#000000' }}
      >
        Summary
      </Text>

      {/* Subtotal */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontSize: isMobile || isMobileWeb ? 16 : 18, color: '#000000' }}>
          Subtotal
        </Text>
        <Text
          style={{
            fontSize: isMobile || isMobileWeb ? 16 : 18,
            fontWeight: '600',
            color: '#000000',
          }}
        >
          ${cartTotalAmount}
        </Text>
      </XStack>

      {/* Other */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontSize: isMobile || isMobileWeb ? 16 : 18, color: '#000000' }}>Other</Text>
        <Text
          style={{
            fontSize: isMobile || isMobileWeb ? 16 : 18,
            fontWeight: '600',
            color: '#000000',
          }}
        >
          0
        </Text>
      </XStack>

      {/* Coupon input */}
      {/* <XStack
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
        <XStack
          style={{
            flex: 1,
            paddingLeft: 16,
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          <Text style={{ color: '#AAAAAA', marginRight: 8 }}>🎟️</Text>
          <Input
            flex={1}
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Add a coupon"
            style={{
              borderWidth: 0,
              height: 56,
              fontSize: 16,
              backgroundColor: 'white',
              borderColor: 'none',
              outlineColor: 'none',
              outlineWidth: 0,
              // outlineStyle: 'none',
            }}
          />
        </XStack>
        <XStack
          style={{
            backgroundColor: '#FFF3E0',
            paddingRight: 24,
            paddingLeft: 24,
            paddingTop: 24,
            paddingBottom: 24,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFB648', fontWeight: '600', fontSize: 16 }}>Add</Text>
        </XStack>
      </XStack> */}

      {/* Divider */}
      <YStack style={{ height: 1, backgroundColor: '#E0E0E0' }} />

      {/* Total */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Text
          style={{
            fontSize: isMobile || isMobileWeb ? 16 : 20,
            fontWeight: '600',
            color: '#000000',
          }}
        >
          Item's Total
        </Text>
        <Text
          style={{
            fontSize: isMobile || isMobileWeb ? 20 : 28,
            fontWeight: '700',
            color: '#000000',
          }}
        >
          ${cartTotalAmount}
        </Text>
      </XStack>

      {/* Checkout button */}
      <Button
        onPress={() => {
          onCheckout()
        }}
        style={{
          backgroundColor: disabled ? '#CCCCCC' : '#FF9F0D',
          borderRadius: 8,
          height: (isMobile || isMobileWeb)?44:40,
          marginTop: 6,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight:(isMobile || isMobileWeb)?700: 600,
          color: 'white',
        }}
        iconAfter={
          loading?.itemId === '' && loading?.change === 0 ? (
            <ArrowRight fontWeight={600} color="white" />
          ) : (
            <Spinner color="white" />
          )
        }
        disabled={loading?.itemId !== '' || loading.change !== 0 || disabled}
      >
        {buttonTitle}
      </Button>

      {/* Disabled message */}
      {disabled && disabledMessage && (
        <Text
          style={{
            fontSize: 16,
            color: '#f55344',
            textAlign: 'center',
            marginTop: 4,
          }}
        >
          {disabledMessage}
        </Text>
      )}

      {/* Credit card acceptance text */}
      <Text
        style={{
          fontSize: 14,
          color: '#777679',
          textAlign: 'center',
        }}
      >
        We accept all major credit cards
      </Text>
    </YStack>
  )
}
