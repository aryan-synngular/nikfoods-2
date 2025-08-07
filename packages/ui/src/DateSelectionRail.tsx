'use client'

import { XStack, YStack, Text, Button } from 'tamagui'
import { useState } from 'react'
import { Calendar, Lock, Plus, Trash2 } from '@tamagui/lucide-icons'

export interface DateOption {
  id: string
  label: string
  date: string
  status: 'available' | 'locked' | 'deleted' | 'selected'
  icon: 'plus' | 'lock' | 'trash' | 'calendar'
}

export interface DateSelectionRailProps {
  dates?: DateOption[]
  onDateSelect?: (date: DateOption) => void
  selectedDate?: string
}

export function DateSelectionRail({ dates, onDateSelect, selectedDate }: DateSelectionRailProps) {
  const [selectedDateId, setSelectedDateId] = useState<string | undefined>(selectedDate)

  // Default dates if none provided
  const defaultDates: DateOption[] = [
    {
      id: 'all-days',
      label: 'All days',
      date: 'available',
      status: 'available',
      icon: 'plus',
    },
    {
      id: 'mon-19',
      label: 'Mon',
      date: '19 May',
      status: 'locked',
      icon: 'lock',
    },
    {
      id: 'tue-20',
      label: 'Tue',
      date: '20 May',
      status: 'locked',
      icon: 'lock',
    },
    {
      id: 'wed-21',
      label: 'Wed',
      date: '21 May',
      status: 'deleted',
      icon: 'trash',
    },
    {
      id: 'thu-22',
      label: 'Thu',
      date: '22 May',
      status: 'selected',
      icon: 'calendar',
    },
    {
      id: 'fri-23',
      label: 'Fri',
      date: '23 May',
      status: 'available',
      icon: 'plus',
    },
    {
      id: 'sat-24',
      label: 'Sat',
      date: '24 May',
      status: 'available',
      icon: 'plus',
    },
  ]

  const dateOptions = dates || defaultDates

  const handleDateSelect = (date: DateOption) => {
    if (date.status === 'locked' || date.status === 'deleted') {
      return // Don't allow selection of locked or deleted dates
    }

    setSelectedDateId(date.id)
    onDateSelect?.(date)
  }

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'plus':
        return <Plus size={16} />
      case 'lock':
        return <Lock size={16} />
      case 'trash':
        return <Trash2 size={16} />
      case 'calendar':
        return <Calendar size={16} />
      default:
        return <Plus size={16} />
    }
  }

  return (
    <YStack py={20} px={20}>
      <Text fontSize={20} fontWeight="600" mb={16}>
        Select Delivery Date
      </Text>

      <XStack gap={12} flexWrap="wrap">
        {dateOptions.map((date) => {
          const isSelected = selectedDateId === date.id
          const isDisabled = date.status === 'locked' || date.status === 'deleted'

          return (
            <Button
              key={date.id}
              onPress={() => handleDateSelect(date)}
              disabled={isDisabled}
              // bg={date.status === 'selected' ? '$orange10' : '$gray2'}
              // borderColor={date.status === 'selected' ? '$orange10' : '$gray8'}
              // borderRadius={8}
              px={12}
              py={8}
              minW={80}
              opacity={isDisabled ? 0.5 : 1}
              pressStyle={{
                opacity: isDisabled ? 0.5 : 0.8,
                scale: 0.98,
              }}
            >
              <YStack gap={4}>
                <Text
                  fontSize={14}
                  fontWeight="600"
                  // color={date.status === 'selected' ? 'white' : '$gray12'}
                >
                  {date.label}
                </Text>
                <Text
                  fontSize={12}

                  // color={date.status === 'selected' ? 'white' : '$gray11'}
                >
                  {date.date}
                </Text>
                <YStack mt={4}>{getIcon(date.icon)}</YStack>
              </YStack>
            </Button>
          )
        })}
      </XStack>
    </YStack>
  )
}
