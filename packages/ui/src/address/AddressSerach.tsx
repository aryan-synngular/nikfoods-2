import React, { useState } from 'react'
import { Input, YStack, ListItem, Separator } from 'tamagui'
import { Platform } from 'react-native'
import { apiGetPlaces } from "app/services/UserService" // Adjust the import path as needed
type PlacePrediction = {
  place_id: string
  description: string
}

interface AddressSearchProps {
  onSelect: (place: PlacePrediction) => void
  apiBaseUrl?: string // optional for mobile to pass API base
}

export function AddressSearch({ onSelect, apiBaseUrl }: AddressSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlacePrediction[]>([])

  const fetchSuggestions = async (text: string) => {
    setQuery(text)

    if (text.length < 3) {
      setResults([])
      return
    }

   
    try {
      const res=await apiGetPlaces(text)
      // const data = await res.json()
      console.log(res)
      setResults(res?.data || [])
    } catch (err) {
      console.error('Failed to fetch places', err)
    }
  }

  return (
    <YStack space="$2">
      <Input
        value={query}
        onChangeText={fetchSuggestions}
        placeholder="Search address"
      />
      {results.length > 0 && (
        <YStack
          borderWidth={1}
          borderColor="$gray8"
          borderRadius="$4"
          overflow="hidden"
        >
          {results.map((place, i) => (
            <React.Fragment key={place.place_id}>
              <ListItem
                hoverTheme
                pressTheme
                title={place.description}
                onPress={() => {
                  onSelect(place)
                  setResults([])
                  setQuery(place.description)
                }}
              />
              {i < results.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </YStack>
      )}
    </YStack>
  )
}
