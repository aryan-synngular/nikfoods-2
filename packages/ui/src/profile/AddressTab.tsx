import React, { useCallback, useEffect, useState } from 'react'
import { IAddress, IAddressResponse } from 'app/types/user'
import { apiDeleteUserAddress, apiGetAllAddress } from 'app/services/UserService'
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
import { useScreen } from 'app/hook/useScreen'
import AddressPopup from '../popups/AddressPopup'
export default function AddressTab() {
  const [address, setAddress] = useState<IListResponse<IAddress> | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
const {isMobile,isMobileWeb}=useScreen()
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
  const handleDeleteAddress=async()=>{
try {
  
  await apiDeleteUserAddress(deleteItemId)
  getAllAddress()
} catch (error) {
  console.log(error)
}
  }
  return (
    <YStack>
      <XStack justify={'flex-end'}>
        <Button
          bg={'#FF9F0D'}
          color={'white'}
          mt={(isMobile||isMobileWeb)?'$4':"$-10"}
          hoverStyle={{ background: '#FF9F0D' }}
          icon={Plus}
          size={(isMobile||isMobileWeb)?'$3':"$4"}
          onPress={() => {
            setEditItem(null)
            setEditDialogOpen(true)}}
          mr={(isMobile||isMobileWeb)?'$3':0}
        >
          Add Address
        </Button>
      </XStack>
      <YStack style={{ borderRadius: '20px' }} gap={16} bg={'#F9F9F9'} p={(isMobile||isMobileWeb)?'$3':'$4'}>
        {address?.items?.map((addr) => (
          <AddressCard
            address={addr}
            handleDelete={() => {setDeleteDialogOpen(true)

              setDeleteItemId(addr._id)
            }}
            handleEdit={() => {
              setEditDialogOpen(true)
              setEditItem(addr)
            }}
            key={addr._id}
          />
        ))}{' '}
      </YStack>
      
      <AddressPopup editDialogOpen={editDialogOpen}
      editItem={editItem}
      onSuccess={() => {
                    setEditDialogOpen(false)
                    getAllAddress()
                  }}
                  setEditDialogOpen={setEditDialogOpen}

      ></AddressPopup>

      <AlertDialog open={deleteDialogOpen} onOpenChange={()=>setDeleteDialogOpen(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <AlertDialog.Content
            style={{
              background: '#fffff',
              borderRadius: 12,
              padding: 24,
              width:(isMobile||isMobileWeb)?300: 440,
              maxWidth: '90vw',
            }}
          >
            <AlertDialog.Description mb={'$4'}>
              Are you sure you want to delete this Address?
            </AlertDialog.Description>
            <XStack gap="$3" justify="flex-end">
              <AlertDialog.Cancel asChild>
                <Button>Cancel</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button
                  onPress={() => {
                    setDeleteDialogOpen(false)
                 handleDeleteAddress()
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
