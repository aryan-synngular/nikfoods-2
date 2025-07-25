import React, { useCallback, useEffect, useState } from 'react'
import { IAddress, IAddressResponse } from 'app/types/user'
import { apiGetAllAddress } from 'app/services/UserService'
import { IListResponse, IResponse } from 'app/types/common'
import {
  YStack,
  XStack,
  Input,
  Select,
  Text,
  Switch,
  ScrollView,
  Button,
  Dialog,
  AlertDialog,
  Image,
  Circle,
  Square,
  PortalProvider,
} from 'tamagui'
import { AddressCard } from '../cards/AddressCard'
import { Plus } from '@tamagui/lucide-icons'
import { AddAddressForm } from './AddAddressForm'
export default function AddressTab() {
  const [address, setAddress] = useState<IListResponse<IAddress> | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [editItem, setEditItem] = useState<IAddress | null>(null)
  const [deleteItemId, setDeleteItemId] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const getAllAddress = useCallback(async () => {
    try {
      const data = await apiGetAllAddress<IResponse<IListResponse<IAddress>>>()
      setAddress(data?.data)
    } catch (error) {
      console.log('Error:', error)
    }
  }, [])

  useEffect(() => {
    getAllAddress()
  }, [getAllAddress])
  return (
    <YStack>
      <XStack justify={'flex-end'}>
        <Button
          bg={'#FF9F0D'}
          color={'white'}
          mt={'$-10'}
          hoverStyle={{ background: '#FF9F0D' }}
          icon={Plus}
          onPress={() => setEditDialogOpen(true)}
        >
          Add Address
        </Button>
      </XStack>
      <YStack style={{ borderRadius: '20px' }} bg={'#F9F9F9'} p={'$4'}>
        {address?.items?.map((addr) => (
          <AddressCard
            address={addr}
            handleDelete={() => {}}
            handleEdit={() => {
              setEditDialogOpen(true)
              setEditItem(addr)
            }}
            key={addr._id}
          />
        ))}{' '}
      </YStack>
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
              <AddAddressForm
                initialData={editItem}
                onSuccess={() => {
                  setEditDialogOpen(false)
                  getAllAddress()
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            </PortalProvider>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <AlertDialog.Content
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: 440,
              maxWidth: '90vw',
            }}
          >
            <AlertDialog.Description mb={'$4'}>
              Are you sure you want to delete this food item?
            </AlertDialog.Description>
            <XStack gap="$3" justify="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  onPress={() => {
                    setDeleteDialogOpen(false)
                    // deleteFoodItem()
                  }}
                  theme="accent"
                >
                  Accept
                </Button>
              </AlertDialog.Action>
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  )
}
