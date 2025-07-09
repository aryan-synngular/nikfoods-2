"use client"

import { Text, XStack } from 'tamagui'

interface SavingsBannerProps {
  amount: number
}

export function SavingsBanner({ amount }: SavingsBannerProps) {
  return (
    <XStack style={{ 
      backgroundColor: '#E0F7FA', 
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      alignItems: 'center',
      justifyContent: 'flex-start'
    }}>
      <Text style={{ 
        fontSize: 14, 
        color: '#00838F',
        fontWeight: '500'
      }}>
        🎉 Yay!! You saved ${amount} on this order.
      </Text>
    </XStack>
  )
}
