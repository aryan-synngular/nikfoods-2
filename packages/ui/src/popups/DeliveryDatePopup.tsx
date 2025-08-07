'use client'

import { useEffect, useState } from 'react'
import { Text, YStack, XStack, Button, Sheet, Image, Checkbox, useMedia, ScrollView } from 'tamagui'
import { X, Check } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'

interface DeliveryDateOption {
  day: string
  date: string
  fullDate: string
}

interface DeliveryDatePopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (selectedDates: { day_name: string; date: string }[]) => void
  item: any
}

export function DeliveryDatePopup({ open, onOpenChange, onSelect, item }: DeliveryDatePopupProps) {
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

  useEffect(() => {
    if (open) {
      setSelectedDates([])
    }
  }, [open])
  const media = useMedia()
  const dateOptions = generateDateOptions()
  const [selectedDates, setSelectedDates] = useState<{ day_name: string; date: string }[]>([])

  const handleToggleDate = (val: DeliveryDateOption) => {
    console.log(val)
    setSelectedDates((prev) => {
      const data = prev.filter((date) => date.day_name !== val.day)
      if (data.length === prev.length) {
        return [...prev, { day_name: val.day, date: val.fullDate }]
      } else {
        return data
      }
    })
  }

  const handleSelect = () => {
    console.log(selectedDates)
    onSelect(selectedDates)
    onOpenChange(false)
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
              <YStack padding={16} space={14}>
                {/* Header */}
                <XStack justifyContent="space-between" alignItems="center">
                  <Text fontSize={18} fontWeight="600" color="#2A1A0C">
                    Choose Delivery date
                  </Text>
                  <Button
                    size="$2"
                    circular
                    icon={<X size={18} />}
                    backgroundColor="transparent"
                    pressStyle={{ opacity: 0.7 }}
                    onPress={() => onOpenChange(false)}
                  />
                </XStack>

                {/* Food item info */}
                <XStack justifyContent="space-between" alignItems="center">
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
                    const isSelected = selectedDates.some((day) => day.day_name === option.day)

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
                          <Text fontSize={15} fontWeight="500" color="#2A1A0C">
                            {option.day}
                          </Text>
                        </XStack>
                        <Text fontSize={13} color="#666">
                          {option.date}
                        </Text>
                      </XStack>
                    )
                  })}
                </YStack>

                {/* Select button */}
                <Button
                  onPress={handleSelect}
                  color="white"
                  height={46}
                  fontSize={15}
                  fontWeight="600"
                  pressStyle={{ opacity: 0.8 }}
                  backgroundColor="#FF9F0D"
                  borderRadius={8}
                  marginTop={8}
                  disabled={selectedDates.length === 0}
                  opacity={selectedDates.length === 0 ? 0.7 : 1}
                >
                  Select
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
                const isSelected = selectedDates.some((day) => day.day_name === option.day)

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
                    </XStack>
                    <Text fontSize={14} color="#666" textAlign="right">
                      {option.date}
                    </Text>
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
              backgroundColor="#FF9F0D"
              borderRadius={12}
              marginTop={16}
              disabled={selectedDates.length === 0}
              opacity={selectedDates.length === 0 ? 0.7 : 1}
              shadowColor="#FF9F0D"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={8}
              elevation={8}
            >
              Select
            </Button>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  )
}
