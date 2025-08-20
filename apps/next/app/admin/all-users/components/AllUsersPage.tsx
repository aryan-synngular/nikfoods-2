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
import { IListResponse } from 'app/types/common'

function Shimmer({ style }: { style?: any }) {
  return (
    <YStack
      bg="#ececec"
      style={{ ...style, opacity: 0.7, overflow: 'hidden', position: 'relative' }}
      className="shimmer-effect"
    />
  )
}

export default function AllUsersPage() {
  const [users, setUsers] = useState<IListResponse<IUser>>({
    items: [],
    page: 0,
    pageSize: 0,
    total: 0,
  })
  const [items, setItems] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const limit = 7

  const getAllUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const data = await apiGetAllUsers<IListResponse<IUser>>()
      console.log(data)
      const allItems = (data as any)?.items ?? []
      setUsers({
        items: allItems,
        page: 1,
        pageSize: limit,
        total: Array.isArray(allItems) ? allItems.length : 0,
      })
      setItems(Array.isArray(allItems) ? allItems.length : 0)
    } catch (error) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getAllUsers()
  }, [getAllUsers])

  const totalPages = useMemo(() => {
    const totalCount = users?.total ?? users?.items?.length ?? 0
    const pages = Math.ceil(totalCount / limit)
    return pages > 0 ? pages : 1
  }, [users, limit])

  const visibleItems = useMemo(() => {
    const start = (page - 1) * limit
    return users.items.slice(start, start + limit)
  }, [users.items, page, limit])

  return (
    <YStack space="$5" p="$4">
      <Text fontWeight="bold" fontSize={20}>
        All Users
      </Text>

    
      {/* <ScrollView  horizontal height={"75vh"}  > */}
      <YStack
        minW={1490}
        bg="#fff"
        height={'64vh'}
        style={{
          overflow: 'auto',
          borderRadius: '12px',
        }}
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
        {loading
          ? Array.from({ length: limit }).map((_, idx) => (
              <XStack
                justify={'space-between'}
                key={`loader-${idx}`}
                p={12}
                bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'}
                items="center"
                borderBottomWidth={1}
                borderColor="#F0F0F0"
              >
                <XStack>
                  <Shimmer style={{ width: 40, height: 40, borderRadius: 20 }} />
                </XStack>
                <Shimmer style={{ width: 140, height: 14, borderRadius: 8 }} />
                <Shimmer style={{ width: 200, height: 14, borderRadius: 8 }} />
                <Shimmer style={{ width: 180, height: 14, borderRadius: 8 }} />
                <YStack width={120} items={'center'} gap={4}>
                  <Shimmer style={{ width: 100, height: 26, borderRadius: 20 }} />
                </YStack>
                <YStack width={120} items={'center'} gap={4}>
                  <Shimmer style={{ width: 100, height: 26, borderRadius: 20 }} />
                </YStack>
              </XStack>
            ))
          : visibleItems.map((item, idx) => (
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
          Page {page} of {totalPages}
        </Text>
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowRight}
          disabled={page >= totalPages || loading}
          onPress={() => setPage((prev) => prev + 1)}
        ></Button>
      </XStack>
      {/* Edit Dialog */}
    </YStack>
  )
}
