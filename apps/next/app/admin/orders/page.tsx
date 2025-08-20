'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { YStack, XStack, Text, Button, Input } from 'tamagui'
import { ArrowLeft, ArrowRight } from '@tamagui/lucide-icons'
import { apiGetAdminOrders } from 'app/services/OrderService'
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

interface AdminOrderItemProduct {
  name: string
  quantity: number
  price: number
}

interface AdminOrderDayItem {
  day: string
  deliveryDate: string
  products: AdminOrderItemProduct[]
  dayTotal: number
}

interface AdminOrderItem {
  id: string
  _id: string
  createdAt: string
  user: { id: string; name: string; email: string } | null
  items: AdminOrderDayItem[]
  totalPaid: number
  status: string
  paymentMethod: string
  platformFee: number
  deliveryFee: number
  discount: { amount: number; code: string }
  taxes: number
  reviews: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<IListResponse<AdminOrderItem>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 10,
  })
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [status] = useState('all')
  const [loading, setLoading] = useState(false)

  const getOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiGetAdminOrders<{
        data: IListResponse<AdminOrderItem> & {
          totalPages: number
          hasNextPage: boolean
          hasPrevPage: boolean
        }
        message: string
        success: boolean
      }>({ page, limit, status })

      setOrders({
        items: response.data.items,
        total: response.data.total,
        page: response.data.page,
        pageSize: response.data.pageSize,
      })
    } finally {
      setLoading(false)
    }
  }, [page, limit, status])

  useEffect(() => {
    getOrders()
  }, [getOrders])

  const totalPages = useMemo(() => {
    const pages = Math.ceil((orders?.total ?? 0) / Number(limit))
    return pages > 0 ? pages : 1
  }, [orders?.total, limit])

  return (
    <YStack space="$5" p="$4">
      <Text fontWeight="bold" fontSize={20}>
        Orders
      </Text>

      <YStack
        minW={1490}
        bg="#fff"
        height={'64vh'}
        style={{ overflow: 'auto', borderRadius: '12px' }}
        shadowColor="#4F8CFF22"
        shadowOpacity={0.08}
      >
        <XStack
          bg="#E6F0FF"
          p={12}
          justify={'space-between'}
          borderTopLeftRadius={12}
          borderTopRightRadius={12}
        >
          <Text width={200} fontWeight="700" color="#4F8CFF">
            Order ID
          </Text>
          <Text width={220} fontWeight="700" color="#4F8CFF">
            Customer
          </Text>
          <Text width={220} fontWeight="700" color="#4F8CFF">
            Email
          </Text>
          <Text width={180} fontWeight="700" color="#4F8CFF">
            Created At
          </Text>
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Status
          </Text>
          <Text width={140} fontWeight="700" color="#4F8CFF">
            Total ($)
          </Text>
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Reviews
          </Text>
        </XStack>

        {loading
          ? Array.from({ length: Number(limit) }).map((_, idx) => (
              <XStack
                key={`loader-${idx}`}
                justify={'space-between'}
                p={12}
                bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'}
                items="center"
                borderBottomWidth={1}
                borderColor="#F0F0F0"
              >
                <Shimmer style={{ width: 160, height: 14, borderRadius: 8 }} />
                <Shimmer style={{ width: 160, height: 14, borderRadius: 8 }} />
                <Shimmer style={{ width: 200, height: 14, borderRadius: 8 }} />
                <Shimmer style={{ width: 160, height: 14, borderRadius: 8 }} />
                <Shimmer style={{ width: 100, height: 20, borderRadius: 20 }} />
                <Shimmer style={{ width: 80, height: 14, borderRadius: 8 }} />
                <Shimmer style={{ width: 60, height: 14, borderRadius: 8 }} />
              </XStack>
            ))
          : orders.items.map((order, idx) => (
              <XStack
                key={order._id}
                justify={'space-between'}
                p={12}
                bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'}
                items="center"
                borderBottomWidth={1}
                borderColor="#F0F0F0"
              >
                <Text width={200} fontWeight="600">
                  {order.id}
                </Text>
                <Text width={220}>{order.user?.name || '-'}</Text>
                <Text width={220} color="#555">
                  {order.user?.email || '-'}
                </Text>
                <Text width={180}>{new Date(order.createdAt).toLocaleString()}</Text>
                <Text
                  width={120}
                  fontWeight="700"
                  color={order.status === 'cancelled' ? '#FF7675' : '#00B894'}
                >
                  {order.status}
                </Text>
                <Text width={140}>{order.totalPaid.toFixed(2)}</Text>
                <Text width={120}>{order.reviews}</Text>
              </XStack>
            ))}
      </YStack>

      <XStack justify="flex-end" items={'center'} mt="$4" gap="$3">
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowLeft}
          disabled={page === 1 || loading}
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
        />
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
        />
      </XStack>
    </YStack>
  )
}
