import { useState } from 'react'
import { Text, YStack } from 'tamagui'
import { Platform, useWindowDimensions, StyleSheet, View, TextInput, Switch } from 'react-native'
import { Search } from '@tamagui/lucide-icons'

// Light text color for placeholders and icons
const textLight = '#9CA3AF'

// Define styles for components that need complex styling
const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: 30,
    paddingHorizontal: 12,
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
  }
})

export interface SearchFoodProps {
  onSearch?: (query: string) => void
  onVegToggle?: (vegOnly: boolean) => void
  initialQuery?: string
  initialVegOnly?: boolean
}

export function SearchFood({
  onSearch,
  onVegToggle,
  initialQuery = '',
  initialVegOnly = false,
}: SearchFoodProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [vegOnly, setVegOnly] = useState(initialVegOnly)
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

  // Handle search input change
  const handleSearch = (text: string) => {
    setSearchQuery(text)
    onSearch?.(text)
  }

  // Handle veg toggle
  const handleVegToggle = (checked: boolean) => {
    setVegOnly(checked)
    onVegToggle?.(checked)
  }

  return (
    <YStack style={[styles.container, { width: getResponsiveWidth() }]}>
      <Text style={styles.title}>
        Search Your Favorite Food
      </Text>
      
      <View style={styles.row}>
        {/* Search input with rounded corners */}
        <View style={styles.searchContainer}>
          <Search size={18} color={textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search food items"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={textLight}
          />
        </View>
        
        {/* Veg Only toggle with green background */}
        <View style={[styles.vegToggle, { backgroundColor: vegOnly ? "#22C55E" : "#F3F4F6" }]}>
          <Text style={[styles.vegText, { color: vegOnly ? "white" : "#4B5563" }]}>
            Only Veg
          </Text>
          <Switch
            trackColor={{ false: "#F3F4F6", true: "#22C55E" }}
            thumbColor="white"
            ios_backgroundColor="#3e3e3e"
            onValueChange={handleVegToggle}
            value={vegOnly}
          />
        </View>
      </View>
    </YStack>
  )
}
