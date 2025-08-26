'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  YStack,
  XStack,
  Input,
  Text,
  Button,
  Dialog,
  AlertDialog,
  PortalProvider,
} from 'tamagui'
import { ArrowLeft, ArrowRight, Pencil, Plus, Trash } from '@tamagui/lucide-icons'
import EditZincodeForm from './EditZincodeForm'
import { IZincode } from 'app/types/zincode'
import { IListResponse, IResponse } from 'app/types/common'
import { ZincodesSkeleton } from './ZincodesSkeleton'
import { useToast } from '@my/ui/src/useToast'

function Shimmer({ style }: { style?: any }) {
  return (
    <YStack
      bg="#ececec"
      style={{ ...style, opacity: 0.7, overflow: 'hidden', position: 'relative' }}
      className="shimmer-effect"
    />
  )
}

export default function Zincodes() {
  const { showMessage } = useToast()
  const [search, setSearch] = useState('')
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<IZincode | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

  const [items, setItems] = useState<IListResponse<IZincode>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 7,
  })
  const [loading, setLoading] = useState(false)
  const [loadingTable, setLoadingTable] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  const limit = 7

  const getZincodes = useCallback(async () => {
    try {
      setLoading(true)
      setLoadingTable(true)
      const response = await fetch(`/api/min-cart-value?search=${search}&page=${page}&limit=${limit}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch zincodes')
      }

      setItems(data.data)
    } catch (error) {
      setError('Failed to fetch zincodes')
      showMessage('Failed to load zincodes', 'error')
    } finally {
      setLoading(false)
      setLoadingTable(false)
    }
  }, [search, page])

  useEffect(() => {
    getZincodes()
  }, [getZincodes])

  const totalPages = useMemo(() => {
    const pages = Math.ceil((items?.total ?? 0) / Number(limit))
    return pages > 0 ? pages : 1
  }, [items?.total, limit])

  const deleteZincode = useCallback(async () => {
    try {
      if (!deleteItemId) return
      setLoading(true)
      const response = await fetch(`/api/min-cart-value?id=${deleteItemId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete zincode')
      }
      
      await getZincodes()
      showMessage('Zipcode deleted successfully', 'success')
    } catch (error) {
      setError('Failed to delete zincode')
      showMessage('Failed to delete zipcode', 'error')
    } finally {
      setLoading(false)
    }
  }, [deleteItemId, getZincodes])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <YStack space="$5" p="$4">
      <Text fontWeight="bold" fontSize={20}>
        Minimum Cart Value by Zipcode
      </Text>

      <XStack justify="space-between" mb="$3" gap={16}>
        <XStack gap={32}>
          <Input
            placeholder="Search zipcodes..."
            value={search}
            onChangeText={(v) => {
              setSearch(v)
              setPage(1) // Reset to first page when searching
            }}
            borderColor="#4F8CFF"
            bg="#F6FAFF"
            width={300}
          />
        </XStack>
        <Button
          size="$3"
          color="white"
          hoverStyle={{ bg: '#4F8CFF' }}
          bg={'#4F8CFF'}
          p={12}
          icon={Plus}
          onPress={() => {
            setEditDialogOpen(true)
            setEditItem(null)
          }}
        >
          Add Zipcode
        </Button>
      </XStack>

      <YStack
        minW={800}
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
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Zipcode
          </Text>
          <Text width={150} fontWeight="700" color="#4F8CFF">
            Min Cart Value ($)
          </Text>
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Created Date
          </Text>
          <Text width={180} fontWeight="700" color="#4F8CFF">
            Actions
          </Text>
        </XStack>

        {/* Table Body */}
        {loadingTable ? (
          <ZincodesSkeleton count={limit} />
        ) : (
          items?.items?.map((item, idx) => (
            <XStack
              justify={'space-between'}
              key={idx}
              p={12}
              bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'}
              items="center"
              borderBottomWidth={1}
              borderColor="#F0F0F0"
            >
              <Text width={120} fontWeight="600">
                {item.zipcode}
              </Text>
              <Text width={150} color="#222" fontWeight="600">
                ${item.minCartValue.toFixed(2)}
              </Text>
              <Text width={120} color="#666" fontSize="$3">
                {formatDate(item.createdAt)}
              </Text>
              <XStack width={180} items="center" gap={4}>
                <Button
                  size="$2"
                  chromeless
                  icon={Pencil}
                  onPress={() => {
                    setEditItem(item)
                    setEditDialogOpen(true)
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="$2"
                  chromeless
                  icon={Trash}
                  onPress={() => {
                    setDeleteItemId(item._id)
                    setDeleteDialogOpen(true)
                  }}
                >
                  Delete
                </Button>
              </XStack>
            </XStack>
          ))
        )}
      </YStack>

      {/* Page Navigation */}
      <XStack justify="flex-end" items={'center'} mt="$4" gap="$3">
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowLeft}
          disabled={page === 1 || loadingTable}
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
          disabled={page >= totalPages || loadingTable}
          onPress={() => setPage((prev) => prev + 1)}
        />
      </XStack>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: 540,
              maxWidth: '90vw',
            }}
          >
            <PortalProvider>
              <EditZincodeForm
                initialData={editItem}
                onSuccess={() => {
                  setEditDialogOpen(false)
                  getZincodes()
                  showMessage(
                    editItem ? 'Zipcode updated successfully' : 'Zipcode created successfully',
                    'success'
                  )
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            </PortalProvider>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ y: 10, opacity: 0, scale: 0.95 }}
            style={{
              background: '#FFF4E4',
              borderRadius: 12,
              borderColor: '#FF9F0D33',
              borderWidth: 1,
              padding: 24,
              width: 440,
              maxWidth: '90vw',
              shadowColor: '#FF9F0D44',
              shadowRadius: 10,
              shadowOpacity: 0.2,
            }}
          >
            <AlertDialog.Title fontSize="$6" fontWeight="700" color="#FF9F0D" mb="$2">
              Confirm Deletion
            </AlertDialog.Title>

            <AlertDialog.Description mb="$4" color="#333" fontSize="$4">
              Are you sure you want to delete this zipcode? This action cannot be undone.
            </AlertDialog.Description>

            <XStack gap="$3" justify="flex-end">
              <AlertDialog.Cancel asChild>
                <Button
                  size="$3"
                  bg="#FFF4E4"
                  borderColor="#FF9F0D"
                  borderWidth={1}
                  color="#FF9F0D"
                  hoverStyle={{
                    bg: '#FF9F0D11',
                    borderColor: '#FF9F0D',
                  }}
                  pressStyle={{
                    bg: '#FF9F0D22',
                  }}
                >
                  Cancel
                </Button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <Button
                  size="$3"
                  bg="#FF9F0D"
                  color="white"
                  hoverStyle={{
                    bg: '#E68F0C',
                  }}
                  pressStyle={{
                    bg: '#D17F0B',
                  }}
                  onPress={() => {
                    setDeleteDialogOpen(false)
                    deleteZincode()
                  }}
                >
                  Delete
                </Button>
              </AlertDialog.Action>
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  )
}
