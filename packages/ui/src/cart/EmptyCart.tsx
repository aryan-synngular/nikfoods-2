"use client"

import { Button, Text, YStack } from 'tamagui'
import { ShoppingBag } from '@tamagui/lucide-icons'

interface EmptyCartProps {
  onBrowse?: () => void
}

export function EmptyCart({ onBrowse }: EmptyCartProps) {
  return (
    <YStack style={{ 
      padding: 24, 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: 16,
      flex: 1,
      minHeight: 300
    }}>
      <YStack style={{
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF8EE',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ShoppingBag size={36} color="#FF9F0D" />
      </YStack>
      
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '600', 
        color: '#2A1A0C',
        textAlign: 'center'
      }}>
        Your cart is empty
      </Text>
      
      <Text style={{ 
        fontSize: 14, 
        color: '#666',
        textAlign: 'center',
        maxWidth: 300
      }}>
        Looks like you haven't added any items to your cart yet.
      </Text>
      
      <Button
        onPress={onBrowse}
        style={{
          backgroundColor: '#FF9F0D',
          borderRadius: 8,
          height: 46,
          paddingHorizontal: 24,
          marginTop: 8
        }}
      >
        <Text style={{ color: 'white', fontSize: 15, fontWeight: '600' }}>
          Browse Foods
        </Text>
      </Button>
    </YStack>
  )
}
