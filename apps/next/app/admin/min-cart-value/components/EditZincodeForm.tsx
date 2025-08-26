'use client'
import { useState } from 'react'
import {
  YStack,
  XStack,
  Input,
  Text,
  Button,
  Label,
} from 'tamagui'
import { X } from '@tamagui/lucide-icons'

interface IZincode {
  _id?: string
  zipcode: string
  minCartValue: number
}

interface EditZincodeFormProps {
  initialData?: IZincode | null
  onSuccess: () => void
  onCancel: () => void
}

export default function EditZincodeForm({ initialData, onSuccess, onCancel }: EditZincodeFormProps) {
  const [formData, setFormData] = useState<IZincode>({
    zipcode: initialData?.zipcode || '',
    minCartValue: initialData?.minCartValue || 0,
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.zipcode.trim()) {
      newErrors.zipcode = 'Zipcode is required'
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipcode.trim())) {
      newErrors.zipcode = 'Please enter a valid zipcode (e.g., 12345 or 12345-6789)'
    }

    if (formData.minCartValue < 0) {
      newErrors.minCartValue = 'Min cart value must be non-negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const url = initialData?._id 
        ? `/api/min-cart-value?id=${initialData._id}`
        : '/api/min-cart-value'
      
      const method = initialData?._id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          zipcode: formData.zipcode.trim(),
          minCartValue: Number(formData.minCartValue),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save zincode')
      }

      onSuccess()
    } catch (error) {
      console.error('Error saving zincode:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save zincode' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <YStack space="$4" width="100%">
      <XStack justify="space-between" items="center">
        <Text fontSize="$6" fontWeight="700" color="#4F8CFF">
          {initialData ? 'Edit Zipcode' : 'Add New Zipcode'}
        </Text>
        <Button
          size="$2"
          chromeless
          icon={X}
          onPress={onCancel}
        />
      </XStack>

      <YStack space="$3">
        <YStack space="$2">
          <Label htmlFor="zipcode" fontWeight="600" color="#333">
            Zipcode *
          </Label>
          <Input
            id="zipcode"
            placeholder="Enter zipcode (e.g., 12345)"
            value={formData.zipcode}
            onChangeText={(text) => {
              setFormData(prev => ({ ...prev, zipcode: text }))
              if (errors.zipcode) {
                setErrors(prev => ({ ...prev, zipcode: '' }))
              }
            }}
            borderColor={errors.zipcode ? '#FF6B6B' : '#E0E0E0'}
            bg="#F8F9FA"
            fontSize="$4"
          />
          {errors.zipcode && (
            <Text color="#FF6B6B" fontSize="$3">
              {errors.zipcode}
            </Text>
          )}
        </YStack>

        <YStack space="$2">
          <Label htmlFor="minCartValue" fontWeight="600" color="#333">
            Minimum Cart Value ($) *
          </Label>
          <Input
            id="minCartValue"
            placeholder="Enter minimum cart value"
            value={formData.minCartValue.toString()}
            onChangeText={(text) => {
              const value = parseFloat(text) || 0
              setFormData(prev => ({ ...prev, minCartValue: value }))
              if (errors.minCartValue) {
                setErrors(prev => ({ ...prev, minCartValue: '' }))
              }
            }}
            keyboardType="numeric"
            borderColor={errors.minCartValue ? '#FF6B6B' : '#E0E0E0'}
            bg="#F8F9FA"
            fontSize="$4"
          />
          {errors.minCartValue && (
            <Text color="#FF6B6B" fontSize="$3">
              {errors.minCartValue}
            </Text>
          )}
        </YStack>
      </YStack>

      {errors.submit && (
        <Text color="#FF6B6B" fontSize="$3" textAlign="center">
          {errors.submit}
        </Text>
      )}

      <XStack gap="$3" justify="flex-end" mt="$4">
        <Button
          size="$3"
          bg="#F8F9FA"
          borderColor="#E0E0E0"
          borderWidth={1}
          color="#666"
          onPress={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          size="$3"
          bg="#4F8CFF"
          color="white"
          onPress={handleSubmit}
          disabled={loading}
          opacity={loading ? 0.7 : 1}
        >
          {loading ? 'Saving...' : (initialData ? 'Update' : 'Create')}
        </Button>
      </XStack>
    </YStack>
  )
}
