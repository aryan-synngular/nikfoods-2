'use client'

import { useEffect, useState } from 'react'
import { Text, YStack, XStack, Button, Sheet, Image, Checkbox, useMedia, ScrollView, Spinner } from 'tamagui'
import { X, Check, Plus, Minus } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'

interface DeliveryDateOption {
  day: string
  date: string
  fullDate: string
}

interface DeliveryDatePopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (payload: {
    removed: string[]
    edited: { cartItemId: string; quantity: number }[]
    added: { day_name: string; date: string; quantity: number }[]
  }) => void
  item: any
  loading?: boolean
}

export function DeliveryDatePopup({ open,loading, onOpenChange, onSelect, item }: DeliveryDatePopupProps) {
  // Build initial selected state from item.days
  const media = useMedia()
  const initialSelected = (item?.days || []).map((d) => ({
    day_name: d.day.day,
    date: d.day.date,
    quantity: d.quantity,
    cartItemId: d._id, // include cartItemId for edit/remove/unchanged
  }))

  // State: [{ day_name, date, quantity }]
  const [selectedDates, setSelectedDates] = useState<{ day_name: string; date: string; quantity: number; cartItemId?: string }[]>(initialSelected)

  // Reset on open
  useEffect(() => {
    if (open) {
      setSelectedDates(initialSelected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item])

  // Generate date options for the next 5 days
  const generateDateOptions = (): DeliveryDateOption[] => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const options: DeliveryDateOption[] = []

    const now = new Date()
    const isBefore1PM = now.getHours() < 13

    let startDate = new Date()
    if (!isBefore1PM) {
      // Start from tomorrow
      startDate.setDate(startDate.getDate() + 1)
    }

    let count = 0
    let dayOffset = 0

    while (count < 6) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + dayOffset)

      if (date.getDay() !== 0) {
        // Exclude Sunday
        const day = days[date.getDay()]
        const dateStr = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`
        const fullDate = date.toISOString().split('T')[0]
        options.push({ day, date: dateStr, fullDate })
        count++
      }

      dayOffset++
    }

    return options
  }

  const dateOptions = generateDateOptions()

  // Toggle selection
  const handleToggleDate = (val: DeliveryDateOption) => {
    setSelectedDates((prev) => {
      const idx = prev.findIndex((d) => d.day_name === val.day)
      if (idx === -1) {
        // Not selected, add with quantity 1
        return [...prev, { day_name: val.day, date: val.fullDate, quantity: 1 }]
      } else {
        // Already selected, remove
        return prev.filter((d) => d.day_name !== val.day)
      }
    })
  }

  // Increment quantity
  const handleIncrement = (day: string) => {
    setSelectedDates((prev) =>
      prev.map((d) =>
        d.day_name === day ? { ...d, quantity: d.quantity + 1 } : d
      )
    )
  }

  // Decrement quantity
  const handleDecrement = (day: string) => {
    setSelectedDates((prev) =>
      prev
        .map((d) =>
          d.day_name === day
            ? { ...d, quantity: d.quantity - 1 }
            : d
        )
        .filter((d) => d.quantity > 0) // Remove if quantity is now 0
    )
  }

  // On select, pass selectedDates (with quantity)
  const handleSelect = () => {
    // 1. Build maps for easier comparison
    const initialMap = new Map(initialSelected.map(d => [d.day_name, d]))
    const selectedMap = new Map(selectedDates.map(d => [d.day_name, d]))

    // 2. Removed: in initial but not in selected
    const removed = initialSelected
      .filter(d => !selectedMap.has(d.day_name) && d.cartItemId)
      .map(d => d.cartItemId)

    // 3. Edited: in both, but quantity changed
    const edited = initialSelected
      .filter(d => selectedMap.has(d.day_name) && d.quantity !== selectedMap.get(d.day_name)?.quantity && d.cartItemId)
      .map(d => ({
        cartItemId: d.cartItemId,
        quantity: selectedMap.get(d.day_name)?.quantity,
      }))

    // 4. Added: in selected but not in initial
    const added = selectedDates
      .filter(d => !initialMap.has(d.day_name))
      .map(d => ({
        day_name: d.day_name,
        date: d.date,
        quantity: d.quantity,
      }))


    // 6. Send all four arrays
    onSelect({
      removed,    // array of cartItemIds
      edited,     // array of {cartItemId, quantity}
      added,      // array of {day_name, date, quantity}
    })
    // onOpenChange(false)
  }

  const formattedPrice = `$${item?.price?.toFixed(2)}`

  // Use Sheet for native, Dialog for web
  if (Platform.OS === 'web') {
    // Web implementation with Dialog
    const { Dialog } = require('tamagui')

    return (
      <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            backgroundColor="rgba(0,0,0,0.5)"
            animation="lazy"
            opacity={1}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            backgroundColor="white"
            borderRadius={16}
            maxWidth={500}
            width={media.sm ? '90%' : 500}
            elevate
            maxHeight={media.sm ? '80vh' : '90vh'}
            padding={0}
            animation="medium"
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack p={16} space={14}>
                {/* Header */}
                <XStack justify="space-between" items="center">
                  <Text fontSize={18} fontWeight="600" color="#2A1A0C">
                    Choose Delivery date
                  </Text>
                  <Button
                    size="$2"
                    circular
                    icon={<X size={18} />}
                    background="transparent"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => onOpenChange(false)}
                  />
                </XStack>

                {/* Food item info */}
                <XStack justify="space-between" items="center">
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={10}
                    overflow="hidden"
                    backgroundColor="#F5F5F5"
                  >
                    <Image
                      source={{ uri: item?.url }}
                      width="100%"
                      height="100%"
                      resizeMode="cover"
                    />
                  </YStack>
                  <YStack flex={1} marginLeft={12}>
                    <Text fontSize={16} fontWeight="600" color="#2A1A0C">
                      {item?.name}
                    </Text>
                    <Text fontSize={16} fontWeight="600" color="#FF9F0D">
                      {formattedPrice}
                    </Text>
                  </YStack>
                </XStack>

                {/* Date options */}
                <YStack space={8}>
                  {dateOptions.map((option) => {
                    const selected = selectedDates.find((d) => d.day_name === option.day)
                    const isSelected = !!selected
                    const quantity = selected?.quantity || 1

                    return (
                      <XStack
                        key={option.fullDate}
                        borderWidth={1}
                        borderColor={isSelected ? '#FF9F0D' : '#E0E0E0'}
                        borderRadius={12}
                        padding={12}
                        backgroundColor={isSelected ? '#FFF8EE' : 'white'}
                        onPress={() => handleToggleDate(option)}
                        pressStyle={{ opacity: 0.8 }}
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <XStack alignItems="center" space={12}>
                          <Checkbox
                            id={`date-${option.fullDate}`}
                            checked={isSelected}
                            backgroundColor={isSelected ? '#FF9F0D' : 'transparent'}
                            borderColor={isSelected ? '#FF9F0D' : '#E0E0E0'}
                          />
                          <XStack>
                            <Text minW={"80%"} fontSize={15} fontWeight="500" color="#2A1A0C">
                              {option.day}
                            </Text>
                            <Text minW={"80%"} fontSize={13} color="#666">
                              {option.date}
                            </Text>
                          </XStack>
                        </XStack>
                        {isSelected && (
                          <XStack
                            style={{
                              borderWidth: 1,
                              borderColor: '#EEEEEE',
                              borderRadius: 4,
                              alignItems: 'center',
                              height: 32,
                            }}
                            onPress={e => e.stopPropagation && e.stopPropagation()} // Prevent parent toggle
                          >
                            <XStack
                              onPress={(e) => {
                                e.stopPropagation && e.stopPropagation()
                                handleDecrement(option.day)
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#FFF8EE',
                                cursor: 'pointer',
                              }}
                            >
                              <Minus size={16} color="#FFB648" />
                            </XStack>
                            <Text
                              style={{
                                width: 32,
                                textAlign: 'center',
                                fontSize: 16,
                                fontWeight: '500',
                                color: '#000000',
                              }}
                            >
                              {quantity}
                            </Text>
                            <XStack
                              onPress={(e) => {
                                e.stopPropagation && e.stopPropagation()
                                handleIncrement(option.day)
                              }}
                              style={{
                                width: 32,
                                height: 32,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#FFF8EE',
                                cursor: 'pointer',
                              }}
                            >
                              <Plus size={16} color="#FFB648" />
                            </XStack>
                          </XStack>
                        )}
                      </XStack>
                    )
                  })}
                </YStack>

                {/* Select button */}
             <Button
              onPress={handleSelect}
              color="white"
              height={54}
              fontSize={17}
              fontWeight="600"
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              background="#FF9F0D"
              marginTop={16}
              disabled={loading}
              hoverStyle={{
                background: '#FFB648',
                borderRadius: 12
              }}
              // opacity={selectedDates.length === 0 ? 0.7 : 1}
              shadowColor="#FF9F0D"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={8}
              elevation={8}
              
            >
              {loading ? <Spinner color="white" /> : "Select"}
            </Button>
              </YStack>
            </ScrollView>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    )
  }

  // Native implementation with Sheet
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      dismissOnSnapToBottom
      zIndex={100_000}
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
      />
      <Sheet.Handle backgroundColor="#E0E0E0" />
      <Sheet.Frame
        backgroundColor="white"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
        flex={1}
      >
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <YStack padding={20} space={16} flex={1}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize={20} fontWeight="600" color="#2A1A0C">
                Choose Delivery date
              </Text>
              <Button
                size="$3"
                circular
                icon={<X size={20} />}
                backgroundColor="transparent"
                pressStyle={{ backgroundColor: '#F5F5F5' }}
                onPress={() => onOpenChange(false)}
              />
            </XStack>

            {/* Food item info */}
            <XStack
              backgroundColor="#F8F8F8"
              borderRadius={12}
              padding={12}
              alignItems="center"
              space={12}
            >
              <YStack
                width={70}
                height={70}
                borderRadius={12}
                overflow="hidden"
                backgroundColor="#F5F5F5"
              >
                <Image source={{ uri: item?.url }} width="100%" height="100%" resizeMode="cover" />
              </YStack>
              <YStack flex={1}>
                <Text fontSize={18} fontWeight="600" color="#2A1A0C" numberOfLines={2}>
                  {item?.name}
                </Text>
                <Text fontSize={18} fontWeight="600" color="#FF9F0D" marginTop={4}>
                  {formattedPrice}
                </Text>
              </YStack>
            </XStack>

            {/* Date options */}
            <YStack space={12} flex={1}>
              <Text fontSize={16} fontWeight="500" color="#2A1A0C">
                Select delivery days:
              </Text>
              {dateOptions.map((option) => {
                const selected = selectedDates.find((d) => d.day_name === option.day)
                const isSelected = !!selected
                const quantity = selected?.quantity || 1

                return (
                  <XStack
                    key={option.fullDate}
                    borderWidth={1.5}
                    borderColor={isSelected ? '#FF9F0D' : '#E0E0E0'}
                    borderRadius={16}
                    padding={16}
                    margin={5}
                    backgroundColor={isSelected ? '#FFF8EE' : 'white'}
                    onPress={() => handleToggleDate(option)}
                    pressStyle={{ opacity: 0.8, scale: 0.98 }}
                    justifyContent="space-between"
                    alignItems="center"
                    minHeight={60}
                  >
                    <XStack alignItems="center" space={16} flex={1}>
                      <Checkbox
                        id={`date-${option.fullDate}`}
                        checked={isSelected}
                        backgroundColor={isSelected ? '#FF9F0D' : 'transparent'}
                        borderColor={isSelected ? '#FF9F0D' : '#E0E0E0'}
                        size="$5"
                      />
                      <Text fontSize={17} fontWeight="500" color="#2A1A0C" flex={1}>
                        {option.day}
                      </Text>
                    <Text fontSize={14} color="#666" textAlign="right">
                      {option.date}
                    </Text>
                    </XStack>
                    {isSelected && (
                      <XStack
                                style={{
                                  borderWidth: 1,
                                  borderColor: '#EEEEEE',
                                  borderRadius: 4,
                                  alignItems: 'center',
                                  height: 32,
                                }}
                                onPress={e => e.stopPropagation && e.stopPropagation()} // Prevent parent toggle
                              >
                                <XStack
                                  onPress={(e) => {
                                    e.stopPropagation && e.stopPropagation()
                                    handleDecrement(option.day)
                                  }}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#FFF8EE',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Minus size={16} color="#FFB648" />
                                </XStack>
                                <Text
                                  style={{
                                    width: 32,
                                    textAlign: 'center',
                                    fontSize: 16,
                                    fontWeight: '500',
                                    color: '#000000',
                                  }}
                                >
                                  {quantity}
                                </Text>
                                <XStack
                                  onPress={(e) => {
                                    e.stopPropagation && e.stopPropagation()
                                    handleIncrement(option.day)
                                  }}
                                  style={{
                                    width: 32,
                                    height: 32,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#FFF8EE',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <Plus size={16} color="#FFB648" />
                                </XStack>
                              </XStack>
                    )}
                  </XStack>
                )
              })}
            </YStack>

            {/* Select button */}
            <Button
              onPress={handleSelect}
              color="white"
              height={54}
              fontSize={17}
              fontWeight="600"
              pressStyle={{ opacity: 0.8, scale: 0.98 }}
              background="#FF9F0D"
              marginTop={16}
              disabled={loading}
              hoverStyle={{
                background: '#FFB648',
                borderRadius: 12
              }}
              // opacity={selectedDates.length === 0 ? 0.7 : 1}
              shadowColor="#FF9F0D"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={8}
              elevation={8}
              
            >
              {loading ? <Spinner color="white" /> : "Select"}
            </Button>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  )
}
