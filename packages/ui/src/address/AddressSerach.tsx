import React, { useState } from 'react'
import { Input, YStack, ListItem, Separator, Spinner, XStack, Text, ScrollView } from 'tamagui'
import { Platform } from 'react-native'
import { apiGetPlaces, apiGetPlaceDetails } from "app/services/UserService" // Adjust the import path as needed

type PlacePrediction = {
  place_id: string
  description: string
}

type PlaceDetails = {
  street: string
  town: string
  city: string
  state: string
  country: string
  pincode: string
  lat: number
  lng: number
  full_address: string
}

interface AddressSearchProps {
  onSelect: (place: PlacePrediction, details?: PlaceDetails) => void
  apiBaseUrl?: string // optional for mobile to pass API base
}

export function AddressSearch({ onSelect, apiBaseUrl }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchSuggestions = async (text: string) => {
    setQuery(text)

    if (text.length < 3) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
   
    try {
      const res = await apiGetPlaces(text)
      console.log(res)
      
      // Handle the nested response structure: res.data.data.predictions
      const predictions = (res as any)?.data?.data?.predictions || []
      setResults(predictions)
    } catch (err) {
      console.error('Failed to fetch places', err)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaceSelect = async (place: PlacePrediction) => {
    try {
      // Fetch place details
      const detailsRes = await apiGetPlaceDetails<{data: PlaceDetails}>(place.place_id)
      const details = detailsRes?.data
      console.log(details)
      // Call onSelect with both place and details
      onSelect(place, details)
      setResults([])
      setQuery("")
    } catch (err) {
      console.error('Failed to fetch place details', err)
      // Still call onSelect with just the place if details fail
      onSelect(place)
      setResults([])
      setQuery(place.description)
    }
  }

  return (
    <YStack space="$2" position="relative" width={'100%'}>
      <Input
      width={'100%'}
        value={query}
        onChangeText={fetchSuggestions}
        placeholder="Search address"
      />
      
      {isLoading && (
        <XStack 
          items="center" 
          space="$2" 
          p="$2"
          position="absolute"
          style={{
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            shadowColor: 'rgba(0,0,0,0.1)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Spinner size="small" />
          <Text fontSize="$3" color="gray">Searching...</Text>
        </XStack>
      )}
      
      {results.length > 0 && !isLoading && (
        <YStack
          position="absolute"
          style={{
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            borderWidth: 1,
            borderColor: '#E0E0E0',
            borderRadius: 8,
            shadowColor: 'rgba(0,0,0,0.1)',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false} height={200}>
            {results.map((place, i) => (
              <React.Fragment key={place.place_id}>
                <ListItem
                  hoverTheme
                  pressTheme
                  title={place.description}
                  onPress={() => handlePlaceSelect(place)}
                />
                {i < results.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </ScrollView>
        </YStack>
      )}
    </YStack>
  )
}
