import { Check, ChevronDown, ChevronUp } from '@tamagui/lucide-icons'
import React from 'react'

import type { FontSizeTokens, SelectProps } from 'tamagui'
import { Adapt, Label, Select, Sheet, XStack, YStack, getFontSize } from 'tamagui'
import { LinearGradient } from 'tamagui/linear-gradient'


export default function SelectableFoodCategory(props: SelectProps & { trigger?: React.ReactNode }) {
   const {value, onValueChange} = props;
  return (
    <Select   size="$4" value={value} onValueChange={onValueChange} disablePreventBodyScroll {...props}>
      {props?.trigger || (
        <Select.Trigger maxWidth={260} iconAfter={ChevronDown}>
          <Select.Value placeholder="Select Food Category" />
        </Select.Trigger>
      )}

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
        <Select.ScrollUpButton
      
          items="center"
          justify="center"
          position="relative"
          width="100%"
          height="$3"
        >
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

        <Select.Viewport
          // to do animations:
          animation="quick"
          // animateOnly={['transform', 'opacity']}
          // enterStyle={{ o: 0, y: -10 }}
          // exitStyle={{ o: 0, y: 10 }}
          minW={200}
        >
          <Select.Group >
            <Select.Label>Category</Select.Label>
            {/* for longer lists memoizing these is useful */}
            {React.useMemo(
              () =>
                FOODITEM_CATEGORY.map((item, i) => {
                  return (
                    <Select.Item
                      index={i}
                      key={item.name}
                      value={item.name.toLowerCase()}
                    >
                      <Select.ItemText>{item.name}</Select.ItemText>
                      <Select.ItemIndicator marginLeft="auto">
                        <Check size={16} />
                      </Select.ItemIndicator>
                    </Select.Item>
                  )
                }),
              [FOODITEM_CATEGORY]
            )}
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
              <ChevronDown
                size={getFontSize((props.size as FontSizeTokens) ?? '$true')}
              />
            </YStack>
          )}
        </Select.Viewport>

        <Select.ScrollDownButton
          items="center"
          justify="center"
          position="relative"
          width="100%"
          height="$3"
        >
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
  )
}

export const FOODITEM_CATEGORY = [
  { name: 'All' },
  { name: 'Main Course' },
  { name: 'Dessert' },
  { name: 'Beverage' },
  { name: 'Snack' },
  { name: 'Breakfast' },
  { name: 'Dinner' },
 
]