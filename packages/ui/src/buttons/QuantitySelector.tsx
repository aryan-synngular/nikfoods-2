"use client"

import { useState } from 'react'
import { XStack, Button, Text } from 'tamagui'
import { Minus, Plus } from '@tamagui/lucide-icons'
import { AddButton } from './AddButton'

interface QuantitySelectorProps {
  initialQuantity?: number
  onAdd?: () => void
  onIncrement?: () => void
  onDecrement?: () => void
  quantity?: number
}

export function QuantitySelector({ 
  initialQuantity = 0,
  onAdd,
  onIncrement,
  onDecrement,
  quantity: externalQuantity
}: QuantitySelectorProps) {
  // Use internal state if no external quantity is provided
  const [internalQuantity, setInternalQuantity] = useState(initialQuantity)
  
  // Determine if we're using controlled or uncontrolled mode
  const isControlled = externalQuantity !== undefined
  const currentQuantity = isControlled ? externalQuantity : internalQuantity
  
  // Handle internal state changes if not controlled externally
  const handleAdd = () => {
    if (!isControlled) {
      setInternalQuantity(1)
    }
    if (onAdd) {
      onAdd()
    }
  }
  
  const handleIncrement = () => {
    if (!isControlled) {
      setInternalQuantity(prev => prev + 1)
    }
    if (onIncrement) {
      onIncrement()
    }
  }
  
  const handleDecrement = () => {
    if (!isControlled) {
      setInternalQuantity(prev => (prev <= 1 ? 0 : prev - 1))
    }
    if (onDecrement) {
      onDecrement()
    }
  }
  
  return (
    <>
      {currentQuantity > 0 ? (
        <XStack style={{alignItems: 'center', borderRadius: 8, borderWidth: 1, borderColor: '#E0CAB6'}} gap={8}>
          <Button
            size="$2"
            style={{
              backgroundColor: '#FFF4E4', 
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0
            }}
            onPress={handleDecrement}
            icon={<Minus size={16} color="#FF9F0D" />}
          />
          <Text fontSize={14} width={16} style={{textAlign: 'center'}}>
            {currentQuantity}
          </Text>
          <Button
            size="$2"
            style={{
              backgroundColor: '#FFF4E4', 
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8
            }}
            onPress={handleIncrement}
            icon={<Plus size={16} color="#FF9F0D" />}
          />
        </XStack>
      ) : (
        <AddButton onPress={handleAdd} />
      )}
    </>
  )
}
