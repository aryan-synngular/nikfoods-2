import { Adapt, Button, Image, Popover, PopoverProps, Sheet, Text, YStack } from 'tamagui'
import { CarTaxiFront, Home, LogOut, ShoppingCart, User } from '@tamagui/lucide-icons'
export function ProfilePopUp({
  Icon,
  Name,
  shouldAdapt,
  handleSignOut,
  ...props
}: PopoverProps & { Icon?: any; Name?: string; shouldAdapt?: boolean; handleSignOut: () => void }) {
  return (
    <Popover size="$4" allowFlip stayInFrame offset={15} resize {...props}>
      <Popover.Trigger asChild>
        <Button icon={<User size={'$1'}></User>}>
          <Text ml={-5}> {Name}</Text>
        </Button>
      </Popover.Trigger>

      {shouldAdapt && (
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
      )}

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        // width={200}
        // height={200}
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
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />
        <YStack width={'100%'} justify={'flex-start'} items={'flex-start'}>
          <Popover.Close asChild>
            <Button size="$3" icon={User} gap={2} chromeless onPress={() => {}}>
              Profile
            </Button>
          </Popover.Close>
          <Popover.Close asChild>
            <Button size="$3" icon={Home} gap={2} chromeless onPress={() => {}}>
              Address
            </Button>
          </Popover.Close>
          <Popover.Close asChild>
            <Button size="$3" icon={ShoppingCart} gap={2} chromeless onPress={() => {}}>
              Order
            </Button>
          </Popover.Close>
          <Popover.Close asChild>
            <Button size="$3" icon={LogOut} gap={2} chromeless onPress={handleSignOut}>
              Logout
            </Button>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  )
}
