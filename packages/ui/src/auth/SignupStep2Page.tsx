'use client'

import { useEffect, useState } from 'react'
import {
  Text,
  YStack,
  XStack,
  Input,
  Button,
  Image,
  useMedia,
  Checkbox,
  TextArea,
  Spinner,
} from 'tamagui'
import { ArrowRight, X } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'
import { useAuth } from 'app/provider/auth-context'
import { useToast } from '@my/ui/src/useToast'
import { colors } from '@my/ui'

export function SignupStep2Page() {
  const { user, registerStep2 } = useAuth()
  const { showMessage } = useToast()
  console.log('user--------------')
  console.log(user)
  const media = useMedia()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [locationRemark, setLocationRemark] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [postcode, setPostcode] = useState('')
  const [notes, setNotes] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [agreedToMarketing, setAgreedToMarketing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const termsLink = useLink({
    href: '/terms',
  })

  const privacyLink = useLink({
    href: '/privacy',
  })

  const refundLink = useLink({
    href: '/refund',
  })

  const loginLink = useLink({
    href: '/login',
  })

  const homeLink = useLink({
    href: '/',
  })

  const accountCreatedLink = useLink({
    href: '/account-created',
  })

  const validateInputs = () => {
    if (!name.trim() || name.trim().length < 2) {
      showMessage('Name is required', 'error')
      return false
    }

    if (!email.trim()) {
      showMessage('Please enter your email address', 'error')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showMessage('Invalid email', 'error')
      return false
    }

    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      showMessage('Street Address is too short', 'error')
      return false
    }

    if (!city.trim() || city.trim().length < 2) {
      showMessage('City is required', 'error')
      return false
    }

    // if (!province.trim() || province.trim().length < 2) {
    //   showMessage('Province is required', 'error')
    //   return false
    // }

    if (!postcode.trim() || postcode.trim().length < 4) {
      showMessage('Postcode is required', 'error')
      return false
    }

    if (!agreedToTerms) {
      showMessage('You must agree to terms', 'error')
      return false
    }

    return true
  }

  useEffect(() => {
    setEmail(user?.email ?? '')
  }, [user])

  const handleSignup = async () => {
    if (!validateInputs()) {
      return
    }

    setIsLoading(true)

    const addressData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      // locationRemark: locationRemark.trim(),
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      // province: province.trim(),
      postcode: postcode.trim(),
      // notes: notes.trim(),
      agreedToTerms,
      agreedToMarketing,
    }

    console.log('Complete signup with address:', addressData)

    try {
      const data = await registerStep2(addressData)

      showMessage('Address added successfully! Welcome to Nikfoods!', 'success')

      // Navigate to home page
      if (homeLink.onPress) {
        homeLink.onPress()
      }
    } catch (error) {
      console.log(error)

      // Handle the specific error messages
      if (error instanceof Error) {
        showMessage(error.message, 'error')
      } else {
        showMessage('Failed to add address. Please try again.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
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

          <Button
            size="$2"
            circular
            icon={<X size={18} />}
            style={{
              backgroundColor: 'transparent',
            }}
            pressStyle={{ opacity: 0.7 }}
            {...loginLink}
          />
        </XStack>

        {/* Name and Location Remark */}
        <XStack style={{ gap: 16, marginBottom: 16 }}>
          <YStack style={{ flex: 1 }}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Name*"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
          {/* <YStack style={{flex: 1}}>
            <Input
              value={locationRemark}
              onChangeText={setLocationRemark}
              placeholder="Location remark e.g. home, office"
              style={{borderRadius: 8}}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack> */}
        </XStack>

        {/* Phone and Email */}
        <XStack style={{ gap: 16, marginBottom: 16 }}>
          <YStack style={{ flex: 1 }}>
            <Input
              value={phone}
              onChangeText={setPhone}
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
              value={email}
              onChangeText={setEmail}
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
            value={streetAddress}
            onChangeText={setStreetAddress}
            placeholder="Address: House number and street name*"
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
              value={city}
              onChangeText={setCity}
              placeholder="Town City*"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
          {/* <YStack style={{flex: 1, minWidth: media.sm ? '100%' : '30%', marginBottom: media.sm ? 16 : 0}}>
            <Input
              value={province}
              onChangeText={setProvince}
              placeholder="Province"
              style={{borderRadius: 8}}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack> */}
          <YStack style={{ flex: 1, minWidth: media.sm ? '100%' : '30%' }}>
            <Input
              value={postcode}
              onChangeText={setPostcode}
              placeholder="Postcode/Zip*"
              style={{ borderRadius: 8 }}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              fontSize={14}
            />
          </YStack>
        </XStack>

        {/* Notes */}
        {/* <YStack style={{marginBottom: 24}}>
          <TextArea
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes about your order, e.g. special notes for delivery"
            style={{borderRadius: 8}}
            height={80}
            borderWidth={1}
            borderColor="#E0E0E0"
            fontSize={14}
          />
        </YStack> */}

        {/* Terms Checkbox */}
        <XStack style={{ marginBottom: 16, alignItems: 'flex-start', gap: 8 }}>
          <Checkbox
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
            backgroundColor={agreedToTerms ? '#FF9F0D' : undefined}
            borderColor={agreedToTerms ? '#FF9F0D' : '#E0E0E0'}
            style={{ marginTop: 3 }}
          />
          <YStack style={{ flex: 1 }}>
            <Text fontSize={14} color="#666" style={{ flexWrap: 'wrap' }}>
              By creating an account, I agree to our{' '}
              <Text
                fontSize={14}
                color="#FF9F0D"
                {...termsLink}
                hoverStyle={{ textDecorationLine: 'underline' }}
                style={{ cursor: 'pointer' }}
              >
                Terms and Conditions
              </Text>{' '}
              also for receiving{' '}
              <Text
                fontSize={14}
                color="#FF9F0D"
                hoverStyle={{ textDecorationLine: 'underline' }}
                style={{ cursor: 'pointer' }}
              >
                Notification Emails
              </Text>
            </Text>
          </YStack>
        </XStack>

        {/* Add Delivery Address Button */}
        <Button
          onPress={handleSignup}
          color="white"
          height={48}
          fontSize={16}
          fontWeight="600"
          disabled={isLoading}
          pressStyle={{ opacity: 0.8 }}
          style={{
            backgroundColor: isLoading ? '#FFB84D' : '#FF9F0D',
            borderRadius: 8,
            marginTop: 8,
            marginBottom: 16,
          }}
          icon={
            isLoading ? (
              <XStack style={{ marginRight: 8 }}>
                <Spinner size="small" color="white" />
              </XStack>
            ) : undefined
          }
        >
          {isLoading ? 'Adding Address...' : 'Add delivery address'}
        </Button>
      {/* Skip Button */}
      <XStack style={{ justifyContent: 'center', marginTop: 16, marginBottom: 16 }}>
        <Button size="$3" chromeless {...homeLink} pressStyle={{ opacity: 0.7 }}>
          <Text fontSize={15} color={colors.primary}>
            Skip for now
          </Text>
        </Button>
      </XStack>
      </YStack>


      {/* No login section needed for address form */}

      {/* Footer Links */}
      <XStack
        style={{
          gap: media.sm ? 8 : 16,
          marginTop: media.sm ? 20 : 40,
          flexWrap: 'wrap',
          justifyContent: 'center',
          paddingHorizontal: media.sm ? 10 : 20,
        }}
      >
        <Text
          fontSize={12}
          color="#666"
          {...termsLink}
          hoverStyle={{ color: '#FF9F0D' }}
          style={{ cursor: 'pointer' }}
        >
          Terms & Conditions
        </Text>

        <Text
          fontSize={12}
          color="#666"
          {...privacyLink}
          hoverStyle={{ color: '#FF9F0D' }}
          style={{ cursor: 'pointer' }}
        >
          Privacy Policy
        </Text>

        <Text
          fontSize={12}
          color="#666"
          {...refundLink}
          hoverStyle={{ color: '#FF9F0D' }}
          style={{ cursor: 'pointer' }}
        >
          Refund Policy
        </Text>
      </XStack>
    </YStack>
  )
}
