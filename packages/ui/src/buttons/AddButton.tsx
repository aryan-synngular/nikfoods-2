import { Button, Text } from 'tamagui'

interface AddButtonProps {
  onPress?: () => void
}

export function AddButton({ onPress }: AddButtonProps) {
  return (
    <Button
      onPress={onPress}
      style={{backgroundColor:"#FF9F0D", borderRadius: 8, height: 32, alignItems: 'center'}}
      color="white"
      pressStyle={{ opacity: 0.8 }}
    >
      <Text color="white" >
        Add
      </Text>
    </Button>
  )
}
