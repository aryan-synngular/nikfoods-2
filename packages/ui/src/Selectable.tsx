import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import React from 'react'

import type { FontSizeTokens, SelectProps } from 'tamagui'
import { Adapt, Button, Label, Select, Sheet, XStack, YStack, getFontSize } from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'
import { ISelectOption } from 'app/types/common'

export default function Selectable(
  props: SelectProps & {
    trigger?: React.ReactNode
    options: ISelectOption[]
    title: string
    placeholder: string
    children?: React.ReactNode
    selectBoxWidth?: number
    // value:ISelectOption
  }
) {
  const {
    children,
    value,
    onValueChange,
    options = [],
    title = '',
    placeholder = 'Select..',
    selectBoxWidth = 550,
  } = props
  return (
    <>
      <Label>{title}</Label>
      <Select
        size="$4"
        value={value}
        onValueChange={onValueChange}
        disablePreventBodyScroll
        {...props}
      >
        <Select.Trigger iconAfter={ChevronDown}>
          <Select.Value placeholder={placeholder} />
        </Select.Trigger>

        <Adapt when="maxMd" platform="touch">
          <Sheet native={!!props.native} modal dismissOnSnapToBottom animation="medium">
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay
              bg="$shadowColor"
              animation="lazy"
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.ScrollUpButton items="center" justify="center" position="relative" height="$3">
            <YStack z={10}>
              <ChevronUp size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={['$background', 'transparent']}
              shadowRadius="$4"
            />
          </Select.ScrollUpButton>

          <Select.Viewport mt={30} animation="quick" maxW={selectBoxWidth}>
            <Select.Group>
              {/* for longer lists memoizing these is useful */}
              {React.useMemo(
                () =>
                  options.map((item, i) => {
                    return (
                      <Select.Item index={i} key={item?.value} value={item?.value}>
                        <Select.ItemText>{item?.label}</Select.ItemText>
                        <Select.ItemIndicator marginLeft="auto">
                          <Check size={16} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    )
                  }),
                [options]
              )}
              {children}
            </Select.Group>
            {/* Native gets an extra icon */}
            {props.native && (
              <YStack
                position="absolute"
                r={0}
                t={0}
                b={0}
                items="center"
                justify="center"
                width={'$4'}
                pointerEvents="none"
              >
                <ChevronDown size={getFontSize((props.size as FontSizeTokens) ?? '$true')} />
              </YStack>
            )}
          </Select.Viewport>

          <Select.ScrollDownButton items="center" justify="center" position="relative" height="$3">
            <YStack z={10}>
              <ChevronDown size={20} />
            </YStack>
            <LinearGradient
              start={[0, 0]}
              end={[0, 1]}
              fullscreen
              colors={['transparent', '$background']}
              shadowRadius="$4"
            />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select>
    </>
  )
}
