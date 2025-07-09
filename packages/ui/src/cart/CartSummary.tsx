"use client"

import { useState } from 'react'
import { Button, Input, Text, XStack, YStack } from 'tamagui'
import { ArrowRight } from '@tamagui/lucide-icons'

interface CartSummaryProps {
  subtotal: number
  deliveryFee?: number
  tax?: number
  onCheckout?: () => void
}

export function CartSummary({ subtotal, deliveryFee = 2.99, tax = 0, onCheckout }: CartSummaryProps) {
  const [couponCode, setCouponCode] = useState('')
  const total = Math.round(subtotal) // Simplified for the example to match the image
  
  return (
    <YStack style={{ padding: 24, gap: 20 }}>
      {/* Summary header */}
      <Text style={{ fontSize: 24, fontWeight: '600', color: '#000000' }}>
        Summary
      </Text>
      
      {/* Subtotal */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, color: '#000000' }}>
          Subtotal
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000000' }}>
          ${subtotal}
        </Text>
      </XStack>
      
      {/* Other */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 18, color: '#000000' }}>
          Other
        </Text>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#000000' }}>
          0
        </Text>
      </XStack>
      
      {/* Coupon input */}
      <XStack style={{ 
        borderWidth: 1, 
        borderColor: '#E0E0E0', 
        borderRadius: 100,
        overflow: 'hidden',
        height: 56
      }}>
        <XStack style={{ 
          flex: 1, 
          paddingLeft: 16, 
          alignItems: 'center',
          backgroundColor: 'white'
        }}>
          <Text style={{ color: '#AAAAAA', marginRight: 8 }}>🎟️</Text>
          <Input
            flex={1}
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Add a coupon"
            style={{ 
              borderWidth: 0,
              height: 56,
              fontSize: 16
            }}
          />
        </XStack>
        <XStack style={{ 
          backgroundColor: '#FFF3E0', 
          paddingHorizontal: 24,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ color: '#FFB648', fontWeight: '600', fontSize: 16 }}>Add</Text>
        </XStack>
      </XStack>
      
      {/* Divider */}
      <YStack style={{ height: 1, backgroundColor: '#E0E0E0' }} />
      
      {/* Total */}
      <XStack style={{ justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 20, fontWeight: '600', color: '#000000' }}>
          Total
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000' }}>
          ${total}
        </Text>
      </XStack>
      
      {/* Checkout button */}
      <Button 
        onPress={onCheckout}
        style={{ 
          backgroundColor: '#FFB648', 
          borderRadius: 100,
          height: 56,
          marginTop: 8,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
          Checkout
        </Text>
        <ArrowRight color="white" size={20} />
      </Button>
      
      {/* Credit card acceptance text */}
      <Text style={{ 
        fontSize: 14, 
        color: '#666666', 
        textAlign: 'center',
        marginTop: 12
      }}>
        We accept all major credit cards
      </Text>
    </YStack>
  )
}
