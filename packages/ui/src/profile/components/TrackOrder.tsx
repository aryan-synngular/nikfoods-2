import React, { useState, useEffect } from 'react'
import { YStack, XStack, Text, Button, ScrollView, Card, Circle, Avatar, Separator } from 'tamagui'
import { X, Download, MapPin, Phone, MessageCircle, HelpCircle } from '@tamagui/lucide-icons'

interface TrackOrderProps {
  orderId: string
  onClose: () => void
  loading?: boolean
}

interface OrderItem {
  id: number
  name: string
  price: string
  image: string
}

interface TrackingStatus {
  status: string
  time: string
  completed: boolean
  current: boolean
}

interface DeliveryPartner {
  name: string
  rating: number
  avatar: string
  phone: string
}

export default function TrackOrder({ orderId, onClose, loading = false }: TrackOrderProps) {
  const [trackingData, setTrackingData] = useState<any>(null)
  const [dataLoading, setDataLoading] = useState(true)

  // Simulate fetching tracking data
  useEffect(() => {
    const fetchTrackingData = async () => {
      setDataLoading(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock tracking data based on orderId
      const mockTrackingData = {
        '#1293827237464236': {
          orderItems: [
            { id: 1, name: 'Paneer 65', price: '$12.00', image: '🍛' },
            { id: 2, name: 'Doda Barfi', price: '$9.00', image: '🧈' },
            { id: 3, name: 'Doda Barfi', price: '$14.00', image: '🧈' },
          ],
          totalAmount: '$35.00',
          trackingStatus: [
            { status: 'Order Placed', time: '10:15 AM', completed: true, current: false },
            { status: 'Order Confirmed', time: '10:15 PM', completed: true, current: false },
            { status: 'Preparing Food', time: '11:15 AM', completed: true, current: false },
            { status: 'Out of Delivery', time: '02:15 PM', completed: true, current: true },
            { status: 'Delivered', time: 'today, 5:15 PM', completed: false, current: false },
          ],
          deliveryAddress: {
            title: '27 Spice Garden Lane Curry Heights, Flavorville California,',
            subtitle: '94110 United States.',
            phone: 'Aniket, +1 7580-840-920',
          },
          deliveryPartner: {
            name: 'Eric Johnas',
            rating: 4.5,
            avatar: '👨‍🦱',
            phone: '+1 7580-840-920',
          },
          eta: '5 hrs',
        },
        '#1293827237464237': {
          orderItems: [
            { id: 1, name: 'Sweet Lassi', price: '$32.00', image: '🥛' },
            { id: 2, name: 'Chole Bhature', price: '$32.00', image: '🍛' },
          ],
          totalAmount: '$128.00',
          trackingStatus: [
            { status: 'Order Placed', time: '01:30 PM', completed: true, current: false },
            { status: 'Order Confirmed', time: '01:35 PM', completed: true, current: false },
            { status: 'Preparing Food', time: '01:45 PM', completed: true, current: false },
            { status: 'Out of Delivery', time: '02:30 PM', completed: true, current: false },
            { status: 'Delivered', time: '03:15 PM', completed: true, current: false },
          ],
          deliveryAddress: {
            title: '27 Spice Garden Lane Curry Heights, Flavorville California,',
            subtitle: '94110 United States.',
            phone: 'Aniket, +1 7580-840-920',
          },
          deliveryPartner: {
            name: 'Eric Johnas',
            rating: 4.5,
            avatar: '👨‍🦱',
            phone: '+1 7580-840-920',
          },
          eta: 'Delivered',
        },
      }

      const data =
        mockTrackingData[orderId as keyof typeof mockTrackingData] ||
        mockTrackingData['#1293827237464236']
      setTrackingData(data)
      setDataLoading(false)
    }

    fetchTrackingData()
  }, [orderId])

  const renderStatusIcon = (status: TrackingStatus) => {
    if (status.completed) {
      return (
        <Circle
          size={16}
          bg="#4CAF50"
          borderWidth={2}
          borderColor="#4CAF50"
          justifyContent="center"
          alignItems="center"
        >
          <Text color="white" fontSize="$1" fontWeight="bold">
            ✓
          </Text>
        </Circle>
      )
    } else if (status.current) {
      return <Circle size={16} bg="#FF9F0D" borderWidth={2} borderColor="#FF9F0D" />
    } else {
      return <Circle size={16} bg="white" borderWidth={2} borderColor="#E0E0E0" />
    }
  }

  return (
    <YStack flex={1} bg="transparent" justify="center" items="center" p="$4">
      <Card
        width="100%"
        maxWidth={800}
        maxHeight="90vh"
        bg="white"
        borderRadius="$4"
        overflow="hidden"
        elevate
      >
        <YStack flex={1}>
          {/* Header */}
          <XStack
            justify="space-between"
            items="center"
            p="$4"
            pb="$3"
            borderBottomWidth={1}
            borderBottomColor="#f0f0f0"
          >
            <Text fontSize="$6" fontWeight="700" color="black">
              Track Order
            </Text>
            <XStack items="center" space="$3">
              <Button
                size="$3"
                bg="transparent"
                borderWidth={1}
                borderColor="#FF9F0D"
                color="#FF9F0D"
                icon={<Download size="$1" />}
                fontWeight="500"
              >
                Download Invoice
              </Button>
              <Button
                circular
                size="$2.5"
                bg="transparent"
                color="#999"
                onPress={onClose}
                icon={X}
                hoverStyle={{ bg: '#f5f5f5' }}
              />
            </XStack>
          </XStack>

          {/* Content */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {dataLoading ? (
              <YStack p="$4" space="$4" items="center">
                <Text>Loading tracking information...</Text>
              </YStack>
            ) : (
              <XStack flex={1} p="$4" space="$4">
                {/* Left Column */}
                <YStack flex={1} space="$4" maxW={400}>
                  {/* Order Status */}
                  <YStack space="$3">
                    <YStack
                      space="$2"
                      minH={250}
                      borderColor={'#1C1B1F38'}
                      borderWidth={1}
                      borderRadius={10}
                      p="$3"
                    >
                      <Text fontSize="$5" fontWeight="600" color="black" pb="$1">
                        Order Status
                      </Text>
                      {trackingData?.trackingStatus?.map(
                        (status: TrackingStatus, index: number) => (
                          <XStack key={index} items="center" space="$3">
                            <YStack items="center">
                              {renderStatusIcon(status)}
                              {index < trackingData.trackingStatus.length - 1 && (
                                <YStack
                                  width={2}
                                  height={20}
                                  bg={status.completed ? '#4CAF50' : '#E0E0E0'}
                                  mt="$1"
                                />
                              )}
                            </YStack>
                            <XStack flex={1} justify="space-between" items="center">
                              <Text
                                fontSize="$3"
                                color={
                                  status.current ? '#FF9F0D' : status.completed ? '#4CAF50' : '#666'
                                }
                                fontWeight={status.current || status.completed ? '600' : '400'}
                              >
                                {status.status}
                              </Text>
                              <Text fontSize="$2" color="#999">
                                {status.time}
                              </Text>
                            </XStack>
                          </XStack>
                        )
                      )}
                    </YStack>
                  </YStack>

                  {/* Ordered Items */}
                  <YStack
                    space="$3"
                    minH={200}
                    p="$3"
                    borderColor={'#1C1B1F38'}
                    borderWidth={1}
                    borderRadius={10}
                  >
                    <Text fontSize="$5" fontWeight="600" color="black">
                      Ordered Items
                    </Text>

                    <YStack space="$2">
                      {trackingData?.orderItems?.map((item: OrderItem) => (
                        <XStack key={item.id} justify="space-between" items="center" py="$2">
                          <XStack items="center" space="$3">
                            <Text fontSize="$6">{item.image}</Text>
                            <Text fontSize="$3" color="black">
                              {item.name}
                            </Text>
                          </XStack>
                          <Text fontSize="$3" color="black" fontWeight="500">
                            {item.price}
                          </Text>
                        </XStack>
                      ))}

                      <Separator borderColor="#f0f0f0" my="$2" />

                      <XStack justify="space-between" items="center">
                        <Text fontSize="$4" fontWeight="600" color="black">
                          Total Amount Paid
                        </Text>
                        <Text fontSize="$4" fontWeight="600" color="black">
                          {trackingData?.totalAmount}
                        </Text>
                      </XStack>
                    </YStack>
                  </YStack>
                </YStack>

                {/* Right Column */}
                <YStack
                  flex={1}
                  maxW={500}
                  justify={'center'}
                  items={'center'}
                  flexDirection="column"
                >
                  {/* Map Placeholder */}
                  <YStack
                    minH={250}
                    minW={500}
                    borderColor={'#1C1B1F38'}
                    borderWidth={1}
                    borderRadius={10}
                    bg="#E8F5E8"
                    p="$3"
                  >
                    {/* <Text fontSize="$8">🗺️</Text> */}
                    <Text fontSize="$2" color="#666" mt="$2">
                      Map View
                    </Text>
                    {/* {trackingData?.eta !== 'Delivered' && (
                        <YStack
                          bg="white"
                          px="$2"
                          py="$1"
                          borderRadius="$2"
                          shadowColor="#000"
                          shadowOffset={{ width: 0, height: 1 }}
                          shadowOpacity={0.1}
                          shadowRadius={2}
                        >
                          <Text fontSize="$2" fontWeight="600" color="black">
                            ETA: {trackingData?.eta}
                          </Text>
                        </YStack>
                      )} */}
                  </YStack>

                  <YStack justify={'center'} items={'center'} minH={200} minW={500} p="$2">
                    <XStack
                      justify={'center'}
                      items={'center'}
                      flexDirection="row"
                      gap="$2"
                      minH={200}
                    >
                      {/* Delivery Address */}
                      <YStack
                        space="$3"
                        width={'50%'}
                        p="$3"
                        minH={180}
                        borderColor={'#1C1B1F38'}
                        borderWidth={1}
                        borderRadius={10}
                      >
                        <Text fontSize="$5" fontWeight="600" color="black">
                          Delivery Address
                        </Text>

                        <YStack space="$2">
                          <XStack items="flex-start" space="$2">
                            <MapPin size="$1" color="#666" mt="$0.5" />
                            <YStack flex={1}>
                              <Text fontSize="$3" color="black" lineHeight="$1">
                                {trackingData?.deliveryAddress?.title}
                              </Text>
                              <Text fontSize="$3" color="black">
                                {trackingData?.deliveryAddress?.subtitle}
                              </Text>
                            </YStack>
                          </XStack>

                          <XStack items="center" space="$2">
                            <Phone size="$1" color="#666" />
                            <Text fontSize="$3" color="black">
                              {trackingData?.deliveryAddress?.phone}
                            </Text>
                          </XStack>
                        </YStack>
                      </YStack>

                      {/* Delivery Partner */}
                      <YStack
                        space="$3"
                        minH={180}
                        width={'50%'}
                        p="$3"
                        borderColor={'#1C1B1F38'}
                        borderWidth={1}
                        borderRadius={10}
                      >
                        <Text fontSize="$5" fontWeight="600" color="black">
                          Delivery Partner
                        </Text>

                        <XStack items="center" space="$3">
                          <Avatar circular size="$4">
                            <Avatar.Image src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Ctext y='50%25' font-size='24' text-anchor='middle' dominant-baseline='middle' x='50%25'%3E👨‍🦱%3C/text%3E%3C/svg%3E" />
                            <Avatar.Fallback bg="#f0f0f0">
                              <Text fontSize="$4">👨‍🦱</Text>
                            </Avatar.Fallback>
                          </Avatar>

                          <YStack flex={1}>
                            <Text fontSize="$4" fontWeight="600" color="black">
                              {trackingData?.deliveryPartner?.name}
                            </Text>
                            <XStack items="center" space="$1">
                              <Text fontSize="$2" color="#FF9F0D">
                                ⭐
                              </Text>
                              <Text fontSize="$2" color="#666">
                                {trackingData?.deliveryPartner?.rating}
                              </Text>
                            </XStack>
                          </YStack>
                        </XStack>

                        <XStack space="$2">
                          <Button
                            flex={1}
                            bg="white"
                            borderWidth={1}
                            borderColor="#FF9F0D"
                            color="#FF9F0D"
                            size="$3"
                            icon={<MessageCircle size="$1" />}
                          >
                            Chat
                          </Button>
                          <Button
                            flex={1}
                            bg="#FF9F0D"
                            color="white"
                            size="$3"
                            icon={<Phone size="$1" />}
                          >
                            Call
                          </Button>
                        </XStack>
                      </YStack>
                    </XStack>

                    <YStack pt="$2" width="100%">
                      <XStack justify="space-between" alignItems="center" width="100%">
                        {/* Left-aligned button */}
                        <Button
                          bg="white"
                          borderWidth={1}
                          borderColor="#FF9F0D"
                          color="#FF9F0D"
                          size="$4"
                          fontWeight="500"
                          icon={<HelpCircle size="$1" />}
                          width="30%"
                        >
                          Help
                        </Button>

                        {/* Center-aligned button */}
                        <Button
                          borderColor="#4CAF50"
                          color="#4CAF50"
                          size="$4"
                          fontWeight="500"
                          width="30%"
                        >
                          Re-Order
                        </Button>

                        {/* Right-aligned button */}
                        <Button
                          bg="white"
                          borderWidth={1}
                          borderColor="#F55344"
                          color="#F55344"
                          size="$4"
                          fontWeight="500"
                          width="30%"
                        >
                          Cancel Order
                        </Button>
                      </XStack>
                    </YStack>
                  </YStack>
                </YStack>
              </XStack>
            )}
          </ScrollView>
        </YStack>
      </Card>
    </YStack>
  )
}
