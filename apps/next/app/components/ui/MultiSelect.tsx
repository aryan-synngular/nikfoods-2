import React from 'react'
import { Popover, XStack, YStack, Text, Button, ScrollView, Separator, Adapt, Sheet } from 'tamagui'
import { Check, ChevronDown } from '@tamagui/lucide-icons'
import { ISelectOption } from 'app/types/common'

interface MultiSelectProps {
  options: ISelectOption[]
  value: string[]
  onChange: (newValues: string[]) => void
  placeholder?: string
  maxHeight?: number
}

export function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = 'Select Category...',
  maxHeight = 200,
}: MultiSelectProps) {
  const toggle = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  return (
    <>
      <Popover>
        <Popover.Trigger asChild>
          <Button
            width={200}
            type="button"
            theme="blue"
            iconAfter={ChevronDown}
            justify="space-between"
          >
            {value.length > 0 ? `${value.length} selected` : placeholder}
          </Button>
        </Popover.Trigger>
        <Adapt when="maxMd" platform="touch">
          <Sheet animation="medium" modal dismissOnSnapToBottom>
            <Sheet.Frame p="$4">
              <Adapt.Contents />
            </Sheet.Frame>
            <Sheet.Overlay
              bg="$shadowColor"
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>
        <Popover.Content
          width={220}
          height={200}
          enterStyle={{ y: -10, opacity: 0 }}
          exitStyle={{ y: -10, opacity: 0 }}
          elevate
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
        >
          <ScrollView maxH={maxHeight}>
            <YStack p={'$2'} items={'center'}>
              {options.map((opt) => {
                const selected = value.includes(opt.value)
                return (
                  <XStack>
                    <Button
                      width={200}
                      px="$3"
                      py="$2"
                      key={opt.value}
                      icon={selected ? Check : <></>}
                      // bg={selected ? '$blue4' : 'white'}
                      hoverStyle={{ bg: '$blue3' }}
                      pressStyle={{ bg: '$blue4' }}
                      onPress={() => toggle(opt.value)}
                      chromeless
                      flex={1}
                      justify={'flex-start'}
                    >
                      {opt.label}
                    </Button>
                  </XStack>
                )
              })}
            </YStack>
          </ScrollView>
          <Separator />
          {/* <Button size="$2" mt="$2" onPress={() => setOpen(false)}>
            Done
          </Button> */}
        </Popover.Content>
      </Popover>
    </>
  )
}
