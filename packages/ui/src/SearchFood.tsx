'use client'

import { useState, useEffect, useCallback } from 'react'
import { Text, YStack, XStack, Switch } from 'tamagui'
import { Platform, useWindowDimensions, StyleSheet, View, TextInput } from 'react-native'
import { Search } from '@tamagui/lucide-icons'
import { success } from './colors'
import { useStore } from 'app/src/store/useStore'
// Light text color for placeholders and icons
const textLight = '#9CA3AF'

// Define styles for components that need complex styling
const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  vegToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 4,
  },
  vegText: {
    fontSize: 14,
    fontWeight: '500',
  },
})

export interface SearchFoodProps {
  onSearch?: (query: string) => void
  initialQuery?: string
  isTitleVisible?: boolean
}

export function SearchFood({
  onSearch,
  initialQuery = '',
  isTitleVisible = true,
}: SearchFoodProps) {
const { vegOnly } = useStore()
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  // const [vegOnly, setVegOnly] = useState(initialVegOnly)
  const { width } = useWindowDimensions()

  // Get responsive width based on screen size
  const getResponsiveWidth = () => {
    // Mobile: 90% width
    if (width < 768) {
      return '90%'
    }
    // Tablet: 75% width
    else if (width >= 768 && width < 1024) {
      return '75%'
    }
    // Desktop/Web: 50% width
    else {
      return '40%'
    }
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout
      return (query: string) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          onSearch?.(query)
        }, 300) // 300ms debounce
      }
    })(),
    [onSearch]
  )

  // Handle search input change
  const handleSearch = (text: string) => {
    setSearchQuery(text)
    debouncedSearch(text)
  }

  // Handle veg toggle


  // Update search query when initialQuery changes
  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  // Update veg only when initialVegOnly changes

  return (
    <YStack style={[styles.container, { width: getResponsiveWidth(), maxWidth: 600 }]}>
      {isTitleVisible && <Text style={styles.title}>Search Your Favorite Food</Text>}

      <XStack
        style={{
          alignItems: 'center',
          padding: 12,
          borderWidth: 1,
          borderColor: '#E5E7EB',
          borderRadius: 6,
          width: '100%',
          gap: 8,
          boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Search size={18} color={textLight} />
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: '#333',
            paddingVertical: 0,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
          placeholder="Search food items"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={textLight}
        />
        
      </XStack>
    </YStack>
  )
}
