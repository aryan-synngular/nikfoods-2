'use client'

import { useState } from 'react'
import { Text, YStack, XStack, Input, Button, Image, useMedia, Checkbox, TextArea } from 'tamagui'
import { ArrowRight, X } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'
import { useAuth } from 'app/provider/auth-context'
import { IAddress } from 'app/types/user'
import { apiAddAddress } from 'app/services/AuthService'
import { apiAddUserAddress, apiEditUserAddress } from 'app/services/UserService'
import { IResponse } from 'app/types/common'
import { AddressSearch } from '../address/AddressSerach'

export function AddAddressForm({
  initialData,
  onSuccess,
  onCancel,
}: {
  initialData: IAddress | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const { user, registerStep2 } = useAuth()
  console.log(user)
  const media = useMedia()
  const [form, setForm] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    location_remark: initialData?.location_remark || '',
    street_address: initialData?.street_address || '',
    city: initialData?.city || '',
    province: initialData?.province || '',
    postal_code: initialData?.postal_code || '',
    notes: initialData?.notes || '',
  })
  const handleAddAdrress = async () => {
    // Required fields validation
    const {
      // userId,
      name,
      email,
      phone,
      location_remark,
      street_address,
      city,
      province,
      postal_code,
      notes,
    } = form
    if (!name || !email || !street_address || !city || !postal_code) {
      // Show error or validation message
      console.log('Please fill all required fields')
      return
    }

    //     const userId=localStorage.getItem("pendingUserId")
    // console.log(userId)
    //     if(!userId)
    //     {
    //       console.log('UserId is required')
    //       return
    //     }

    try {
      console.log('Complete signup with address:', form)
      let res = {}
      if (initialData?._id) {
        res = await apiEditUserAddress<IResponse<IAddress>, any>({ ...form, _id: initialData._id })
      } else {
        res = await apiAddUserAddress<IResponse<IAddress>, any>(form)
      }

      console.log(res)
      // Here you would typically call your authentication service
    } catch (error) {
      console.log(error)
    }

    // Navigate to account created page on success
  }

  return (
    <YStack
      flex={1}
      bg="#FFF9F2"
      style={{
        paddingTop: media.sm ? 20 : 40,
        paddingBottom: media.sm ? 10 : 20,
        paddingHorizontal: media.sm ? 10 : 20,
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* <AddressSearch onSelect={(place) => console.log('Selected place:', place)} /> */}
      {/* Logo */}
      <YStack style={{ alignItems: 'center', width: '100%' }}>
        <Image
          source={{
            uri: 'https://raw.githubusercontent.com/vinodmaurya/nikfoods/main/apps/next/public/logo.png',
          }}
          style={{ width: 150, height: 50 }}
          resizeMode="contain"
          alt="Nikfoods Logo"
        />
      </YStack>

      {/* Signup Form Step 2 */}
      <YStack
        style={{
          width: '100%',
          maxWidth: 450,
          padding: media.sm ? 16 : 24,
          backgroundColor: 'white',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
          marginVertical: media.sm ? 20 : 40,
          alignSelf: 'center',
        }}
      >
        <XStack
          style={{
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text fontSize={media.sm ? 20 : 24} fontWeight="700" color="#2A1A0C">
            Add a delivery address
          </Text>
        </XStack>

        {/* Name and Location Remark */}
        <XStack style={{ gap: 16, marginBottom: 16 }}>
          <YStack style={{ flex: 1 }}>
            <Input
              value={form.name}
              onChangeText={(name) => setForm((f) => ({ ...f, name }))}
              placeholder="Name*"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
          <YStack style={{ flex: 1 }}>
            <Input
              value={form.location_remark}
              onChangeText={(location_remark) => setForm((f) => ({ ...f, location_remark }))}
              placeholder="Location remark e.g. home, office"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
        </XStack>

        {/* Phone and Email */}
        <XStack style={{ gap: 16, marginBottom: 16 }}>
          <YStack style={{ flex: 1 }}>
            <Input
              value={form.phone}
              onChangeText={(phone) => setForm((f) => ({ ...f, phone }))}
              placeholder="Phone (optional)"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
              keyboardType="phone-pad"
            />
          </YStack>
          <YStack style={{ flex: 1 }}>
            <Input
              value={form.email}
              onChangeText={(email) => setForm((f) => ({ ...f, email }))}
              placeholder="Email address*"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </YStack>
        </XStack>

        {/* Street Address */}
        <YStack style={{ marginBottom: 16 }}>
          <Input
            value={form.street_address}
            onChangeText={(street_address) => setForm((f) => ({ ...f, street_address }))}
            placeholder="Address: House number and street name"
            style={{ borderRadius: 8 }}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            fontSize={14}
          />
        </YStack>

        {/* City, Province, Postcode */}
        <XStack style={{ gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <YStack
            style={{
              flex: 1,
              minWidth: media.sm ? '100%' : '30%',
              marginBottom: media.sm ? 16 : 0,
            }}
          >
            <Input
              value={form.city}
              onChangeText={(city) => setForm((f) => ({ ...f, city }))}
              placeholder="Town City"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
          <YStack
            style={{
              flex: 1,
              minWidth: media.sm ? '100%' : '30%',
              marginBottom: media.sm ? 16 : 0,
            }}
          >
            <Input
              value={form.province}
              onChangeText={(province) => setForm((f) => ({ ...f, province }))}
              placeholder="Province"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
          <YStack style={{ flex: 1, minWidth: media.sm ? '100%' : '30%' }}>
            <Input
              value={form.postal_code}
              onChangeText={(postal_code) => setForm((f) => ({ ...f, postal_code }))}
              placeholder="Postcode/Zip"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
        </XStack>

        {/* Notes */}
        <YStack style={{ marginBottom: 24 }}>
          <TextArea
            value={form.notes}
            onChangeText={(notes) => setForm((f) => ({ ...f, notes }))}
            placeholder="Notes about your order, e.g. special notes for delivery"
            style={{ borderRadius: 8 }}
            height={80}
            borderWidth={1}
            borderColor="#E0E0E0"
            fontSize={14}
          />
        </YStack>

        {/* Terms Checkbox */}

        {/* Add Delivery Address Button */}
      </YStack>

      {/* No login section needed for address form */}

      {/* Footer Links */}
    </YStack>
  )
}
