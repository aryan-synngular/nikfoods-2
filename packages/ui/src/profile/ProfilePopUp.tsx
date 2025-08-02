import { Adapt, Button, Popover, PopoverProps, Sheet, Text, YStack } from 'tamagui'
import { User } from '@tamagui/lucide-icons'
import { tabs } from 'app/constants/account.constant'
import { Link } from 'solito/link'

const getTabPath = (title: string) => {
  switch (title.toLowerCase()) {
    case 'profile':
      return '/account'
    case 'orders':
      return '/account'
    case 'address':
      return '/account'
    case 'logout':
      return '/account' // Optional: or call `handleSignOut` directly
    default:
      return '/'
  }
}

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
        <Button icon={<User size={'$1'} />}>
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
        <YStack bg="white" width={200} borderRadius={20}>
          {tabs.map((tab) => {
            const path = getTabPath(tab.title)

            // Special case for logout
            if (tab.title.toLowerCase() === 'logout') {
              return (
                <Button
                  key={tab.title}
                  width="100%"
                  size="$3"
                  py="$5"
                  bg="white"
                  hoverStyle={{
                    borderWidth: 0,
                    backgroundColor: '#FF9F0D1A',
                  }}
                  icon={<tab.icon />}
                  justify="flex-start"
                  onPress={handleSignOut}
                >
                  {tab.title}
                </Button>
              )
            }

            return (
              <Link href={path} key={tab.title} asChild>
                <Button
                  width="100%"
                  size="$3"
                  py="$5"
                  bg="white"
                  hoverStyle={{
                    borderWidth: 0,
                    backgroundColor: '#FF9F0D1A',
                  }}
                  icon={<tab.icon />}
                  justify="flex-start"
                >
                  {tab.title}
                </Button>
              </Link>
            )
          })}
        </YStack>
      </Popover.Content>
    </Popover>
  )
}
