'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { YStack, XStack, Input, Text, Button, Image } from 'tamagui'
import {
  ArrowLeft,
  ArrowRight,
  CircleUserRound,
  Dot,
  Pencil,
  Plus,
  Trash,
} from '@tamagui/lucide-icons'
import { apiGetAllUsers } from 'app/services/UserService'
import { IUser } from 'app/types/user'
export default function AllUsersPage() {
  const [users, setUsers] = useState<IUser[]>([])
  const [items, setItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const limit = 7

  const getAllUsers = useCallback(async () => {
    try {
      const data = await apiGetAllUsers()
      console.log(data)
      setUsers(data?.items)
    } catch (error) {
      setError('Failed to fetch food items')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllUsers()
  }, [getAllUsers])

  return (
    <YStack space="$5" p="$4">
      <Text fontWeight="bold" fontSize={20}>
        All Users
      </Text>

      <XStack items="center" justify="space-between" mb="$3" gap={16}>
        {/* <XStack items="center" gap={32}>
          <Input
            placeholder="Search food items..."
            value={search}
            onChangeText={(v) => {
              setSearch(v)
            }}
            width={360}
            borderColor="#4F8CFF"
            bg="#F6FAFF"
          />
        </XStack> */}
      </XStack>
      {/* <ScrollView  horizontal height={"75vh"}  > */}
      <YStack
        minW={1490}
        bg="#fff"
        height={'64vh'}
        style={{
          overflow: 'auto',
        }}
        borderRadius={12}
        shadowColor="#4F8CFF22"
        shadowOpacity={0.08}
      >
        {/* Table Header */}
        <XStack
          bg="#E6F0FF"
          p={12}
          justify={'space-between'}
          borderTopLeftRadius={12}
          borderTopRightRadius={12}
        >
          <Text width={50} fontWeight="700" color="#4F8CFF">
            Image
          </Text>
          <Text width={180} fontWeight="700" color="#4F8CFF">
            Name
          </Text>
          <Text width={250} fontWeight="700" color="#4F8CFF">
            Email
          </Text>
          <Text width={250} fontWeight="700" color="#4F8CFF">
            Registered on
          </Text>

          <Text width={120} fontWeight="700" color="#4F8CFF">
            Phone Number
          </Text>
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Address
          </Text>
        </XStack>
        {/* Table Body */}
        {users?.map((item, idx) => (
          <XStack
            justify={'space-between'}
            key={idx}
            p={12}
            bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'}
            items="center"
            borderBottomWidth={1}
            borderColor="#F0F0F0"
          >
            <XStack
              style={{
                overflow: 'hidden',
              }}
            >
              <CircleUserRound color={'purple'} size={'$4'}></CircleUserRound>
              {/* <Image
                source={ 
                  
                  {

                  uri: item?.url
                    ? item?.url
                    : 'https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwZXRpemVyc3xlbnwwfHwwfHx8MA%3D%3D',
                }}
                alt="nikfoods logo"
                width={'100%'}
                height={'100%'}
              /> */}
            </XStack>
            <Text width={180} fontWeight="600">
              {item?.role ?? 'No Name'}
            </Text>
            <Text width={250} fontWeight={700} color="$blue10">
              {item?.email}
            </Text>
            <Text width={250} color="#222">
              {new Date(item?.createdAt).toLocaleString()}
            </Text>

            <YStack width={120} justify={'center'} items={'center'} gap={4}>
              {item.addresses.map((addr) => (
                <Text
                  p={5}
                  px={16}
                  bg={'$green5'}
                  style={{ borderRadius: '20px' }}
                  justify={'center'}
                  items={'center'}
                  fontWeight="700"
                  color={'$green10'}
                >
                  {addr.phone}
                </Text>
              ))}
            </YStack>

            <YStack width={120} justify={'center'} items={'center'} gap={4}>
              {item.addresses.map((addr) => (
                <Text
                  p={5}
                  px={16}
                  style={{ borderRadius: '20px' }}
                  justify={'center'}
                  items={'center'}
                  fontWeight="700"
                  color={'$red10'}
                >
                  {addr.city}, {addr.province}
                </Text>
              ))}
            </YStack>
          </XStack>
        ))}
      </YStack>
      {/* </ScrollView> */}

      {/* Page Navigation */}
      <XStack justify="flex-end" items={'center'} mt="$4" gap="$3">
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowLeft}
          disabled={page === 1 || loading}
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
        ></Button>
        <Text fontWeight="700" color="#4F8CFF" items="center">
          Page {page} of {Math.ceil(items?.total / Number(limit))}
        </Text>
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowRight}
          disabled={page >= Math.ceil(items?.total / Number(limit)) || loading}
          onPress={() => setPage((prev) => prev + 1)}
        ></Button>
      </XStack>
      {/* Edit Dialog */}
    </YStack>
  )
}
