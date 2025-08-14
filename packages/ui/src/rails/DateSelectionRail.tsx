'use client'

import { ScrollView, XStack, YStack, Text, View, useMedia } from 'tamagui'
import { Calendar } from '@tamagui/lucide-icons'
import { useState, useEffect } from 'react'
import { Platform } from 'react-native'
import { useStore } from 'app/src/store/useStore'

export function DateSelectionRail() {
  const media = useMedia()
  const { selectedWeekDay, setSelectedWeekDay } = useStore()
  const [selectedDate, setSelectedDate] = useState<string>('')

  // Update local state when store state changes
 

  const days = () => {
    const today = new Date()
    const currentDay = today.getDay() // 0 (Sun) to 6 (Sat)
    const isBefore1PM = today.getHours() < 13

    const days: any = []

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayKeys: Record<string, string> = {
      Mon: 'Monday',
      Tue: 'Tuesday',
      Wed: 'Wednesday',
      Thu: 'Thursday',
      Fri: 'Friday',
      Sat: 'Saturday',
    }

    // Find the Monday of the current week
    const monday = new Date(today)
    const diffToMonday = today.getDay() === 0 ? -6 : 1 - today.getDay()
    monday.setDate(today.getDate() + diffToMonday)

    for (let i = 0; i < 6; i++) {
      // Monday to Saturday
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)

      const label = dayLabels[date.getDay()]
      const dateStr = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`

      let disabled = false

      if (date < today) {
        // Earlier than today => disabled
        disabled = true
      } else if (date.toDateString() === today.toDateString() && !isBefore1PM) {
        // Today but after 1 PM => disabled
        disabled = true
      }

      days.push({
        label,
        date: dateStr,
        disabled,
        dayKey: dayKeys[label], // Add the day key for store integration
      })
    }

    return days
  }

  const isSmallScreen = Platform.OS !== 'web' || media.maxXs || media.maxSm


  const handleDayClick = (day: any) => {
    if (day.disabled) return
console.log(day.dayKey)
    if (day.dayKey) {
      setSelectedWeekDay(day.dayKey)
    }
  }

  return (
    // <ScrollView width={"100%"} horizontal showsHorizontalScrollIndicator={false}>
    <XStack mt={20} mb={'$4'} px={isSmallScreen ? '$0' : '$4'} justify="center">
      <YStack
        items="center"
        p="$3"
        px={'$6'}
        style={{
          borderColor:'black',
          backgroundColor: 'transparent',
        }}
        // borderRadius="$4"
        borderBottomWidth={ 1}
        cursor="pointer"
      >
        <Text
          fontWeight="600"
          style={{
            color: 'black',
          }}
        >
          All days
        </Text>
        <Text fontSize="$2">Available</Text>
        <Calendar size={14} />
      </YStack>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        bounces={false}
        style={{ width: '100%' }}
      >
        <XStack>
          {days().map((day, index) => {
            const isSelected = selectedWeekDay === day.dayKey
            const isDisabled = day.disabled
            const isAllDays = day.label === 'All days'

            return (
              <YStack
                key={index}
                items="center"
                p="$3"
                px={'$6'}
                onPress={() => handleDayClick(day)}
                style={{
                  backgroundColor: isSelected ? '#FFF4E4' : isDisabled ? '#F8F8F8' : 'transparent',
                  borderColor: isSelected ? 'orange' : '#DFDFDF',
                }}
                // borderRadius="$4"
                opacity={isDisabled ? 0.4 : 1}
                borderBottomWidth={isSelected ? 2 : 1}
                cursor={isDisabled ? 'not-allowed' : 'pointer'}
              >
                <Text
                  fontWeight="600"
                  style={{
                    color: isSelected ? 'orange' : 'black',
                  }}
                >
                  {day.label}
                </Text>
                <Text fontSize="$2">{day.date || 'available'}</Text>
                <Calendar size={14} />
              </YStack>
            )
          })}
        </XStack>
      </ScrollView>
    </XStack>
    // </ScrollView>
  )
}
