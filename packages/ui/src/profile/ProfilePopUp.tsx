import { Adapt, Button, Image, Popover, PopoverProps, Sheet, Text, YStack } from 'tamagui'
import { User } from '@tamagui/lucide-icons'
import { tabs } from 'app/constants/account.constant'
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
        <YStack bg={'white'} width={200} style={{ borderRadius: '20px' }}>
          {tabs.map((tab) => (
            <Button
              width={'100%'}
              key={tab.title}
              size="$3"
              py={'$5'}
              bg={'white'}
              hoverStyle={{
                borderWidth: 0,
                background: '#FF9F0D1A',
              }}
              icon={tab.icon}
              justify={'flex-start'}
              // variant={ ? '' : 'outlined'}
              onPress={() => {
                // setTab(tab.title)
              }}
            >
              {tab.title}
            </Button>
          ))}
        </YStack>
      </Popover.Content>
    </Popover>
  )
}
