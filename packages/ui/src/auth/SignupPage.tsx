'use client'

import { useState } from 'react'
import { Text, YStack, XStack, Input, Button, Image, useMedia, Spinner } from 'tamagui'
import { Eye, EyeOff, Mail, Lock, User } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'
import { useAuth } from 'app/provider/auth-context'
import { useToast } from '@my/ui/src/useToast'
import { AxiosError } from 'axios'

export function SignupPage() {
  const { register, signingIn, socialSignIn } = useAuth()
  const { showToast } = useToast()
  const media = useMedia()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loginLink = useLink({
    href: '/login',
  })

  const termsLink = useLink({
    href: '/terms',
  })

  const privacyLink = useLink({
    href: '/privacy',
  })

  const refundLink = useLink({
    href: '/refund',
  })

  const signupStep2Link = useLink({
    href: `/add-address`,
  })

  const validateInputs = () => {
    if (!email) {
      showToast('Please enter your email address', 'error')
      return false
    }

    if (!email.includes('@')) {
      showToast('Please enter a valid email address', 'error')
      return false
    }

    if (!password) {
      showToast('Please enter a password', 'error')
      return false
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters long', 'error')
      return false
    }

    if (!confirmPassword) {
      showToast('Please confirm your password', 'error')
      return false
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return false
    }

    return true
  }

  const handleSignup = async () => {
    if (!validateInputs()) {
      return
    }

    setIsLoading(true)

    try {
      const data = await register({ email, password })
      console.log(data)

      showToast('Please add your delivery address.', 'success')

      // Navigate to step 2
      if (signupStep2Link.onPress) {
        signupStep2Link.onPress()
      }
    } catch (error) {
      console.log(error)

      // Handle the specific error messages
      if (error instanceof AxiosError) {
        showToast(error.response.data.error||  error.message, 'error')
      } else {
        showToast('Registration failed. Please try again.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await socialSignIn(provider)
      showToast(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in successful`,
        'success'
      )
    } catch (e) {
      if (e instanceof Error) {
        showToast(e.message, 'error')
      } else {
        showToast('Social signup failed', 'error')
      }
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

      {/* Signup Form */}
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
        <Text
          fontSize={media.sm ? 24 : 28}
          fontWeight="700"
          color="#2A1A0C"
          style={{ textAlign: 'center', marginBottom: 8 }}
        >
          Create Account
        </Text>

        <Text fontSize={14} color="#666" style={{ textAlign: 'center', marginBottom: 24 }}>
          No more typing your address every time. Pinky promise.
        </Text>

<YStack mb={16} style={{ alignItems: 'center', gap: 16 }}>

          <XStack style={{ gap: 16 }}>
            <XStack
              width={50}
              height={50}
              style={{
                borderRadius: 40,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              onPress={() => handleSocialAuth('google')}
              pressStyle={{ opacity: 0.8 }}
            >
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png',
                }}
                width={40}
                height={40}
                alt="Google"
              />
            </XStack>

            <XStack
              width={50}
              height={50}
              style={{
                borderRadius: 40,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              onPress={() => handleSocialAuth('facebook')}
              pressStyle={{ opacity: 0.8 }}
            >
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png',
                }}
                width={30}
                height={30}
                alt="Facebook"
              />
            </XStack>

            <XStack
              width={50}
              height={50}
              style={{
                borderRadius: 40,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              onPress={() => handleSocialAuth('apple')}
              pressStyle={{ opacity: 0.8 }}
            >
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png',
                }}
                width={30}
                height={30}
                alt="Apple"
              />
            </XStack>
          </XStack>
                <Text fontSize={14} color="#666">
                  or login with
                </Text>
        </YStack>

        {/* Email Input */}
        <YStack style={{ marginBottom: 16, position: 'relative' }}>
          <XStack position="absolute" style={{ left: 12, top: 12, zIndex: 1, opacity: 0.5 }}>
            <Mail size={20} color="#666" />
          </XStack>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            fontSize={14}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </YStack>

        {/* Password Input */}
        <YStack style={{ marginBottom: 16, position: 'relative' }}>
          <XStack position="absolute" style={{ left: 12, top: 12, zIndex: 1, opacity: 0.5 }}>
            <Lock size={20} color="#666" />
          </XStack>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            style={{ paddingLeft: 40, paddingRight: 40, borderRadius: 8 }}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            fontSize={14}
          />
          <XStack
            position="absolute"
            style={{ right: 12, top: 12, zIndex: 1, opacity: 0.5, cursor: 'pointer' }}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
          </XStack>
        </YStack>

        {/* Confirm Password Input */}
        <YStack style={{ marginBottom: 24, position: 'relative' }}>
          <XStack position="absolute" style={{ left: 12, top: 12, zIndex: 1, opacity: 0.5 }}>
            <Lock size={20} color="#666" />
          </XStack>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            secureTextEntry={!showConfirmPassword}
            style={{
              paddingLeft: 40,
              paddingRight: 40,
              paddingHorizontal: 40,
              height: 48,
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <XStack
            position="absolute"
            style={{ right: 12, top: 12, zIndex: 1, opacity: 0.5, cursor: 'pointer' }}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <EyeOff size={20} color="#666" />
            ) : (
              <Eye size={20} color="#666" />
            )}
          </XStack>
        </YStack>

        {/* Signup Button */}
        <Button
          color="white"
          onPress={handleSignup}
          disabled={isLoading || signingIn}
          pressStyle={{ opacity: 0.8 }}
          style={{
            backgroundColor: isLoading || signingIn ? '#FFB84D' : '#FF9F0D',
            height: 48,
            borderRadius: 8,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 24,
          }}
          icon={
            isLoading || signingIn ? (
              <XStack style={{ marginRight: 8 }}>
                <Spinner size="small" color="white" />
              </XStack>
            ) : (
              <XStack style={{ marginRight: 8 }}>
                <User size={18} color="white" />
              </XStack>
            )
          }
        >
          {isLoading || signingIn ? 'Creating Account...' : 'Next'}
        </Button>

       
      </YStack>

      {/* Login */}
      <YStack style={{ alignItems: 'center', gap: 16, marginTop: 20 }}>
        <Text fontSize={14} color="#666">
          Have an account
        </Text>

        <Button
          background="#FF9F0D"
          color="white"
          style={{
            height: 48,
            borderRadius: 8,
            fontSize: 16,
            fontWeight: '600',
            paddingHorizontal: 40,
          }}
          pressStyle={{ opacity: 0.8 }}
          {...loginLink}
          icon={
            <XStack style={{ marginRight: 8 }}>
              <Lock size={18} color="white" />
            </XStack>
          }
        >
          Login
        </Button>
      </YStack>

      {/* Footer Links */}
      <XStack
        style={{
          gap: media.sm ? 8 : 16,
          marginTop: media.sm ? 20 : 40,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <Text
          fontSize={12}
          color="#666"
          {...termsLink}
          hoverStyle={{ color: '#FF9F0D' }}
          cursor="pointer"
        >
          Terms & Conditions
        </Text>

        <Text
          fontSize={12}
          color="#666"
          {...privacyLink}
          hoverStyle={{ color: '#FF9F0D' }}
          cursor="pointer"
        >
          Privacy Policy
        </Text>

        <Text
          fontSize={12}
          color="#666"
          {...refundLink}
          hoverStyle={{ color: '#FF9F0D' }}
          cursor="pointer"
        >
          Refund Policy
        </Text>
      </XStack>
    </YStack>
  )
}
