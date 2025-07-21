import { Adapt, Button, Popover, PopoverProps, Sheet, YStack } from 'tamagui'
import { Edit3, Delete } from '@tamagui/lucide-icons'

export function ActionsPopover({
  Icon,
  Name,
  shouldAdapt,
  handleEdit,
  handleDelete,
  ...props
}: PopoverProps & {
  Icon?: any
  Name?: string
  shouldAdapt?: boolean
  handleEdit: () => void
  handleDelete: () => void
}) {
  return (
    <Popover size="$2" allowFlip stayInFrame offset={15} resize {...props}>
      <Popover.Trigger asChild>
        <Button circular chromeless icon={Icon} />
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
        width={120}
        height={90}
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

        <YStack gap="$1">
          <Popover.Close asChild>
            <Button size="$3" icon={Edit3} chromeless onPress={handleEdit}>
              Edit
            </Button>
          </Popover.Close>
          <Popover.Close asChild>
            <Button size="$3" icon={Delete} chromeless onPress={handleDelete}>
              Delete
            </Button>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  )
}
