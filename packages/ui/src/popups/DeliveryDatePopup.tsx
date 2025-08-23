'use client'

import { useEffect, useState } from 'react'
import {
  Text,
  YStack,
  XStack,
  Button,
  Sheet,
  Image,
  Checkbox,
  useMedia,
  ScrollView,
  Spinner,
} from 'tamagui'
import { X, Check, Plus, Minus } from '@tamagui/lucide-icons'
import { Platform } from 'react-native'
import { useScreen } from 'app/hook/useScreen'
import { useStore } from 'app/src/store/useStore'

interface DeliveryDateOption {
  day: string
  date: string
  fullDate: string
  disabled: boolean
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
  listType?: string
}

export function DeliveryDatePopup({
  open,
  loading,
  onOpenChange,
  onSelect,
  item,
  listType,
}: DeliveryDatePopupProps) {
  // Build initial selected state from item.days
  const media = useMedia()
  const { isMobile, isMobileWeb } = useScreen()
  const { selectedWeekDay } = useStore()

  const initialSelected = (item?.days || []).map((d) => ({
    day_name: d.day.day,
    date: d.day.date,
    quantity: d.quantity,
    cartItemId: d._id, // include cartItemId for edit/remove/unchanged
  }))

  // State: [{ day_name, date, quantity }]
  const [selectedDates, setSelectedDates] =
    useState<{ day_name: string; date: string; quantity: number; cartItemId?: string }[]>(
      initialSelected
    )

  // Reset on open
  useEffect(() => {
    if (open) {
      // Start with the initial selection from item
      let next = [...initialSelected]

      // If a week day is selected in store, auto-select it when available and not already selected
      try {
        if (selectedWeekDay) {
          const options = generateDateOptions().filter((opt) => !opt.disabled)
          const match = options.find((o) => o.day === selectedWeekDay)
          const alreadySelected = next.some((d) => d.day_name === selectedWeekDay)
          if (match && !alreadySelected) {
            next.push({ day_name: match.day, date: match.date, quantity: 1 })
          }
        }
      } catch {}

      setSelectedDates(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item, selectedWeekDay])

  console.log('Selected dates:', selectedDates)
  // Generate date options for the current week (Mon-Sat), excluding Sunday
  const generateDateOptions = (): DeliveryDateOption[] => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

    const now = new Date()
    const nowDay = now.getDay() // 0-6 (Sun-Sat)

    // Start of today at 00:00
    const startOfToday = new Date(now)
    startOfToday.setHours(0, 0, 0, 0)

    // Find Monday of the current week
    // If today is Sunday (0), we want next Monday
    // If today is Monday (1), we want today
    // If today is Tuesday (2), we want yesterday (Monday)
    const monday = new Date(startOfToday)
    let daysToSubtract

    if (nowDay === 0) {
      // Sunday - get next Monday (add 1 day)
      daysToSubtract = -1
    } else {
      // Monday to Saturday - subtract (day - 1) to get to Monday
      daysToSubtract = nowDay - 1
    }

    monday.setDate(monday.getDate() - daysToSubtract)

    // Build options for Monday through Saturday
    const options: DeliveryDateOption[] = []
    for (let offset = 0; offset < 6; offset++) {
      // 0..5 => Mon..Sat
      const date = new Date(monday)
      date.setDate(monday.getDate() + offset)

      const isCurrentDay = date.getTime() === startOfToday.getTime()
      const isPastDay = date.getTime() < startOfToday.getTime()

      // Disable if day is gone, or current day after 1 PM
      const day = dayNames[date.getDay()]

      let disabled = isPastDay || (isCurrentDay && now.getHours() >= 13)
      if (listType === 'weeklyMenu' && !disabled) {
        disabled = !item?.availableWeekDays?.includes(day.toLowerCase())
      }

      const dateStr = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}, ${date.getFullYear()}`
      const fullDate = date.toISOString()

      options.push({ day, date: dateStr, fullDate, disabled })
    }

    return options
  }

  // Hide disabled days from the options list
  const dateOptions = generateDateOptions().filter((opt) => !opt.disabled)

  // Toggle selection
  const handleToggleDate = (val: DeliveryDateOption) => {
    if (val.disabled) return
    console.log('Toggling date:', val)
    setSelectedDates((prev) => {
      const idx = prev.findIndex((d) => d.day_name === val.day)
      if (idx === -1) {
        // Not selected, add with quantity 1
        return [...prev, { day_name: val.day, date: val.date, quantity: 1 }]
      } else {
        // Already selected, remove
        return prev.filter((d) => d.day_name !== val.day)
      }
    })

    console.log('Selected dates after toggle:', selectedDates)
  }

  // Increment quantity
  const handleIncrement = (day: string) => {
    setSelectedDates((prev) =>
      prev.map((d) => (d.day_name === day ? { ...d, quantity: d.quantity + 1 } : d))
    )
  }

  // Decrement quantity
  const handleDecrement = (day: string) => {
    setSelectedDates(
      (prev) =>
        prev
          .map((d) => (d.day_name === day ? { ...d, quantity: d.quantity - 1 } : d))
          .filter((d) => d.quantity > 0) // Remove if quantity is now 0
    )
  }

  // On select, pass selectedDates (with quantity)
  const handleSelect = () => {
    // 1. Build maps for easier comparison
    const initialMap = new Map(initialSelected.map((d) => [d.day_name, d]))
    const selectedMap = new Map(selectedDates.map((d) => [d.day_name, d]))

    // 2. Removed: in initial but not in selected
    const removed = initialSelected
      .filter((d) => !selectedMap.has(d.day_name) && d.cartItemId)
      .map((d) => d.cartItemId)

    // 3. Edited: in both, but quantity changed
    const edited = initialSelected
      .filter(
        (d) =>
          selectedMap.has(d.day_name) &&
          d.quantity !== selectedMap.get(d.day_name)?.quantity &&
          d.cartItemId
      )
      .map((d) => ({
        cartItemId: d.cartItemId,
        quantity: selectedMap.get(d.day_name)?.quantity,
      }))

    // 4. Added: in selected but not in initial
    const added = selectedDates
      .filter((d) => !initialMap.has(d.day_name))
      .map((d) => ({
        day_name: d.day_name,
        date: d.date,
        quantity: d.quantity,
      }))
    console.log(added)
    // 6. Send all four arrays
    onSelect({
      removed, // array of cartItemIds
      edited, // array of {cartItemId, quantity}
      added, // array of {day_name, date, quantity}
    })
    // onOpenChange(false)
  }

  const formattedPrice = `$${item?.price?.toFixed(2)}`

  // Use Sheet for native, Dialog for web

  const MainComponent = () => {
    return (
      <ScrollView
        flex={1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <YStack padding={20} space={16} flex={1}>
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <Text fontSize={isMobile || isMobileWeb ? 18 : 20} fontWeight="600" color="#2A1A0C">
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
            padding={isMobile || isMobileWeb ? 10 : 12}
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
              <Text
                fontSize={isMobile || isMobileWeb ? 16 : 18}
                fontWeight="600"
                color="#2A1A0C"
                numberOfLines={2}
              >
                {item?.name}
              </Text>
              <Text
                fontSize={isMobile || isMobileWeb ? 16 : 18}
                fontWeight="600"
                color="#FF9F0D"
                marginTop={4}
              >
                {formattedPrice}
              </Text>
            </YStack>
          </XStack>

          {/* Date options */}
          <YStack space={isMobile || isMobileWeb ? 8 : 12} flex={1}>
            <Text fontSize={16} fontWeight="500" color="#2A1A0C">
              Select from available days:
            </Text>
            {dateOptions.map((option) => {
              const selected = selectedDates.find((d) => d.day_name === option.day)
              const isSelected = !!selected
              const quantity = selected?.quantity || 1

              return (
                <XStack
                  key={option.fullDate}
                  borderWidth={isMobile || isMobileWeb ? 1 : 1.5}
                  borderColor={option.disabled ? '#E0E0E0' : isSelected ? '#FF9F0D' : '#E0E0E0'}
                  borderRadius={isMobile || isMobileWeb ? 12 : 16}
                  padding={isMobile || isMobileWeb ? 14 : 16}
                  margin={isMobile || isMobileWeb ? 3 : 5}
                  backgroundColor={option.disabled ? '#F7F7F7' : isSelected ? '#FFF8EE' : 'white'}
                  onPress={() => !option.disabled && handleToggleDate(option)}
                  pressStyle={{
                    opacity: option.disabled ? 1 : 0.8,
                    scale: option.disabled ? 1 : 0.98,
                  }}
                  justifyContent="space-between"
                  alignItems="center"
                  minHeight={isMobile || isMobileWeb ? 40 : 60}
                  opacity={option.disabled ? 0.6 : 1}
                >
                  <XStack alignItems="center" space={16} flex={1}>
                    <Checkbox
                      id={`date-${option.fullDate}`}
                      checked={isSelected}
                      backgroundColor={isSelected ? '#FF9F0D' : 'transparent'}
                      borderColor={isSelected ? '#FF9F0D' : '#E0E0E0'}
                      size={isMobile || isMobileWeb ? '$4' : '$5'}
                      disabled={option.disabled}
                    />
                    <Text
                      fontSize={isMobile || isMobileWeb ? 15 : 17}
                      fontWeight="500"
                      color="#2A1A0C"
                      flex={1}
                    >
                      {option.day}
                    </Text>
                    <Text
                      fontSize={isMobile || isMobileWeb ? 12 : 14}
                      color="#666"
                      textAlign="right"
                    >
                      {option.date}
                    </Text>
                  </XStack>
                  {isSelected && !option.disabled && (
                    <XStack
                      style={{
                        marginLeft: isMobile || isMobileWeb ? 8 : 0,
                        borderWidth: 1,
                        borderColor: '#EEEEEE',
                        borderRadius: 4,
                        alignItems: 'center',
                        height: isMobile || isMobileWeb ? 24 : 32,
                      }}
                      onPress={(e) => e.stopPropagation && e.stopPropagation()} // Prevent parent toggle
                    >
                      <XStack
                        onPress={(e) => {
                          if (option.disabled) return
                          e.stopPropagation && e.stopPropagation()
                          handleDecrement(option.day)
                        }}
                        style={{
                          width: isMobile || isMobileWeb ? 24 : 32,
                          height: isMobile || isMobileWeb ? 24 : 32,
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
                          width: isMobile || isMobileWeb ? 24 : 32,
                          textAlign: 'center',
                          fontSize: isMobile || isMobileWeb ? 14 : 16,
                          fontWeight: '500',
                          color: '#000000',
                        }}
                      >
                        {quantity}
                      </Text>
                      <XStack
                        onPress={(e) => {
                          if (option.disabled) return
                          e.stopPropagation && e.stopPropagation()
                          handleIncrement(option.day)
                        }}
                        style={{
                          width: isMobile || isMobileWeb ? 24 : 32,
                          height: isMobile || isMobileWeb ? 24 : 32,
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
            mb={isMobile || isMobileWeb ? 24 : 0}
            fontWeight="600"
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            background="#FF9F0D"
            marginTop={isMobile || isMobileWeb ? 0 : 16}
            disabled={loading}
            style={{
              backgroundColor: '#FFB648',
            }}
            hoverStyle={{
              background: '#FFB648',
              borderRadius: 12,
            }}
            // opacity={selectedDates.length === 0 ? 0.7 : 1}
            shadowColor="#FF9F0D"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}
          >
            {loading ? <Spinner color="white" /> : 'Select'}
          </Button>
        </YStack>
      </ScrollView>
    )
  }
  if (!isMobile && !isMobileWeb) {
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
            <MainComponent></MainComponent>
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
        <MainComponent></MainComponent>
      </Sheet.Frame>
    </Sheet>
  )
}
