import { View, Input, Label, Select, YStack, XStack, Text, styled, Button } from 'tamagui'
import { IAddress } from 'app/types/user'
import Selectable from '../Selectable'
import { MapPin, Plus } from '@tamagui/lucide-icons'
import { Section } from './CheckoutSteps'
const StepCard = styled(View, {
  style: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    backgroundColor: '#FAFAFA',
  },
})
const CheckoutLoggedIn = ({
  currentStep,
  addresses = [],
  selectedAddress,
  handleAddressChange,
  goBack,
}: {
  currentStep: 'delivery' | 'payment'
  addresses: IAddress[]
  selectedAddress: IAddress
  handleAddressChange: (val: string) => void
  goBack: () => void
}) => {
  return (
    <StepCard>
      <YStack
        space="$4"
        minW={500}
        style={{
          borderRadius: '20px',
        }}
      >
        {currentStep === 'delivery' && (
          <View>
            <Section
              icon={<MapPin size={16} color="#FF6B00" />}
              title="Delivery Address"
              description="We'll only use your address to deliver your order safely and on time."
            />
            {/* <Text fontSize="$6" fontWeight="bold">
              Delivery Address
            </Text> */}
            {/* Select Box */}
            <YStack width={'100%'} p={'$4'} bg={'white'} style={{ borderRadius: '10px' }}>
              <Selectable
                size={'$4'}
                value={selectedAddress?._id}
                title="Saved Address"
                placeholder="Select a address..."
                options={addresses?.map((addr) => ({
                  value: addr._id,
                  label: `${addr.location_remark} ${addr.street_address}   ${addr.city} ${addr.province} ${addr.postal_code} `,
                }))}
                onValueChange={handleAddressChange}
              >
                <Button
                  borderColor="#FF9F0D"
                  style={{
                    color: '#FF9F0D',
                    fontWeight: 'bold',
                  }}
                  iconAfter={<Plus color={'#FF9F0D'}></Plus>}
                  borderWidth={1}
                  m={4}
                  chromeless
                  variant="outlined"
                >
                  Add Address
                </Button>
              </Selectable>

              {selectedAddress && (
                <YStack space="$3" mt="$3">
                  <Label>Address</Label>
                  <Input readOnly value={selectedAddress?.street_address} />

                  <XStack space="$3">
                    <YStack flex={1}>
                      <Label>Town City</Label>
                      <Input readOnly value={selectedAddress?.city} />
                    </YStack>
                    <YStack flex={1}>
                      <Label>Province</Label>
                      <Input readOnly value={selectedAddress?.province} />
                    </YStack>
                  </XStack>

                  <Label>Notes about your order</Label>
                  <Input
                    readOnly
                    value={selectedAddress?.notes}
                    placeholder="E.g. special notes for delivery"
                  />

                  <Text fontSize="$5" fontWeight="bold" mt="$4">
                    Personal Details
                  </Text>
                  <XStack space="$3">
                    <YStack flex={1}>
                      <Label>Name</Label>
                      <Input readOnly placeholder="Name" value={selectedAddress?.name} />
                    </YStack>
                    <YStack flex={1}>
                      <Label>Email Address</Label>
                      <Input readOnly placeholder="Email address" value={selectedAddress?.email} />
                    </YStack>
                  </XStack>

                  <XStack space="$3">
                    <YStack flex={1}>
                      <Label>Phone (optional)</Label>
                      <Input
                        readOnly
                        placeholder="Phone (optional)"
                        value={selectedAddress?.phone}
                      />
                    </YStack>
                    <YStack flex={1}>
                      <Label>Location Remark</Label>
                      <Input
                        readOnly
                        placeholder="e.g. home, office"
                        value={selectedAddress?.location_remark}
                      />
                    </YStack>
                  </XStack>
                </YStack>
              )}
            </YStack>
          </View>
        )}

        {currentStep == 'payment' && (
          <View>
            <XStack justify={'space-between'} items={'center'}>
              <Text fontSize="$6" fontWeight="bold">
                Payment Method
              </Text>
              <Text
                onPress={goBack}
                hoverStyle={{
                  color: '#FF1F0D',
                }}
                cursor="pointer"
                style={{
                  color: '#FF9F0D',
                  borderBottomWidth: '1px',
                  borderBottomColor: '#FF9F0D',
                }}
              >
                Edit address
              </Text>
            </XStack>
            <Text>Payment UI will be integrated here.</Text>
          </View>
        )}
      </YStack>
    </StepCard>
  )
}

export default CheckoutLoggedIn
