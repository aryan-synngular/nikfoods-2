// components/platform/WebAddressSearch.tsx
'use client'
import React, { useRef, useEffect } from 'react'
import { Input } from 'tamagui'

export default function WebAddressSearch() {
  const inputRef = useRef<HTMLInputElement>(null)

  // useEffect(() => {
  //   if (typeof window === 'undefined' || !window.google) return

  //   const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current!, {
  //     types: ['geocode'],
  //     componentRestrictions: { country: 'us' },
  //   })

  //   autocomplete.addListener('place_changed', () => {
  //     const place = autocomplete.getPlace()
  //     console.log('Selected Place:', place)
  //   })
  // }, [])

  return <Input placeholder="Enter your address" />
}
