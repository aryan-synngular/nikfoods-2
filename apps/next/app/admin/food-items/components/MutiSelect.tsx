import { Select, Adapt, Sheet, YStack, Text, Button } from 'tamagui'
import { useState } from 'react'

const options = ['Red', 'Blue', 'Green', 'Yellow']

export default function MultiSelectDropdown() {
  const [selected, setSelected] = useState<string[]>([])

  const toggleOption = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <YStack>
      <Select>
        <Select.Trigger width={200}>
          <Text>{selected.length > 0 ? selected.join(', ') : 'Select colors'}</Text>
        </Select.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet modal dismissOnSnapToBottom>
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Select.Adapted />
              </Sheet.ScrollView>
            </Sheet.Frame>
          </Sheet>
        </Adapt>

        <Select.Content>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option}
                value={option}
                onPress={() => toggleOption(option)}
              >
                <Select.ItemText>{option}</Select.ItemText>
                {selected.includes(option) && <Text>✔</Text>}
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select>
    </YStack>
  )
}
