// components/AddressCard.tsx

import { Card, Text, YStack, XStack, Separator, Button, Paragraph } from 'tamagui'
import { Home, User, Mail, Phone } from '@tamagui/lucide-icons'
import { IAddress } from 'app/types/user'

export function AddressCard({
  address,
  handleEdit,
  handleDelete,
}: {
  address: IAddress
  handleEdit: () => void
  handleDelete: () => void
}) {
  return (
    <Card elevate p="$4" borderRadius="$4" width="100%" bg="white">
      <YStack space>
        <Text fontWeight="700" fontSize="$4">
          {address.name}
        </Text>

        <XStack items="center" space="$2">
          <Home size="$1" />
          <Paragraph>
            {address.location_remark}, {address.street_address}, {address.city}, {address.province}{' '}
            {address.postal_code}
          </Paragraph>
        </XStack>

        <XStack items="center" space="$4" flexWrap="wrap">
          <XStack items="center" gap={'$1'} space="$1">
            <User size="$1" />
            <Text>David</Text>
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
