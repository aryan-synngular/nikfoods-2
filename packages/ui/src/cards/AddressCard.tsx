// components/AddressCard.tsx

import { Card, Text, YStack, XStack, Separator, Button, Paragraph } from 'tamagui'
import { Home, User, Mail, Phone } from '@tamagui/lucide-icons'
import { IAddress } from 'app/types/user'
import { useScreen } from 'app/hook/useScreen'

export function AddressCard({
  address,
  handleEdit,
  handleDelete,
}: {
  address: IAddress
  handleEdit: () => void
  handleDelete: () => void
}) {
  const {isMobile,isMobileWeb}=useScreen()
  return (
    <Card elevate p="$4" borderRadius="$4" width="100%" bg="white">
      <YStack space>
        <Text fontWeight="700" fontSize="$4">
          {address.name}
        </Text>

        <XStack maxW={(isMobile||isMobileWeb)?300:"100%"} items="center" space="$2">
          <Home size="$1" />
          <Paragraph> {address.street_address}
          </Paragraph>
        </XStack>

        <XStack items="center" space="$4" gap={8} flexWrap="wrap">
          <XStack items="center" gap={'$1'} space="$1">
            <User size="$1" />
            <Text>{address.name}</Text>
          </XStack>
          <XStack items="center" gap={'$1'} space="$1">
            <Mail size="$1" />
            <Text>{address.email}</Text>
          </XStack>
          {address.phone && (
            <XStack gap={'$1'} items="center" space="$1">
              <Phone size="$1" />
              <Text color="#FF9F0D">{address.phone}</Text>
            </XStack>
          )}
        </XStack>

        <Separator my="$0.25" />

        <XStack justify="space-between">
          <Button
            onPress={() => handleEdit()}
            borderColor="#FF9F0D"
            color="#FF9F0D"
            variant="outlined"
            size="$3"
          >
            Edit
          </Button>
          <Button onPress={() => handleDelete()} size="$3" color="red" chromeless>
            Delete
          </Button>
        </XStack>
      </YStack>
    </Card>
  )
}
