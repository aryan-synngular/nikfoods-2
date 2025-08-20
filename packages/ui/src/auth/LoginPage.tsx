'use client'

import { useState } from 'react'
import { Text, YStack, XStack, Input, Button, Checkbox, Image, useMedia, Spinner } from 'tamagui'
import { Eye, EyeOff, Mail, Lock, User } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'
import { useAuth } from 'app/provider/auth-context'
import { useToast } from '@my/ui/src/useToast'

export function LoginPage() {
  const { user, loading, signIn, signingIn, signOut, socialSignIn } = useAuth()
  const { showMessage } = useToast() // Add this line
  const media = useMedia()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const signupLink = useLink({
    href: '/signup',
  })

  const forgotPasswordLink = useLink({
    href: '/forgot-password',
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
  const homeLink = useLink({
    href: '/',
  })
  const addAddressLink = useLink({
    href: '/add-address',
  })

  const handleLogin = async () => {
    console.log('Login with:', { email, password, rememberMe })

    if (email && password) {
      try {
        const signInRes = await signIn({
          redirect: false,
          email,
          password,
        })

        console.log(signInRes)
        if (!signInRes.isCompleted) {
          addAddressLink.onPress()
        } else {
          homeLink.onPress()
        }
      } catch (error) {
        console.log(error)

        // Handle the specific error messages from your NextAuth API
        if (error instanceof Error) {
          showMessage(error.message, 'error')
        } else {
          showMessage('Login failed. Please try again.', 'error')
        }
      }
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      await socialSignIn(provider)
      showMessage(
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} sign-in successful`,
        'success'
      )
    } catch (e) {
      if (e instanceof Error) {
        showMessage(e.message, 'error')
      } else {
        showMessage('Social login failed', 'error')
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

      {/* Login Form */}
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
          style={{
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Login
        </Text>

        <Text
          fontSize={14}
          color="#666"
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          No more typing your address every time. Pinky promise.
        </Text>

        {/* Email Input */}
        <YStack style={{ marginBottom: 16, position: 'relative' }}>
          <XStack position="absolute" style={{ left: 12, top: 12, zIndex: 1, opacity: 0.5 }}>
            <Mail size={20} color="#666" />
          </XStack>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="Enter e-mail"
            style={{ paddingLeft: 40, borderRadius: 8 }}
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
          <XStack position="absolute" style={{ left: 12, top: 12, zIndex: 1 }} opacity={0.5}>
            <Lock size={20} color="#666" />
          </XStack>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="********"
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

        {/* Remember Me and Forgot Password */}
        <XStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <XStack style={{ alignItems: 'center', gap: 8 }}>
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              backgroundColor={rememberMe ? '#FF9F0D' : undefined}
              borderColor={rememberMe ? '#FF9F0D' : '#E0E0E0'}
            />
            <Text fontSize={14} color="#666">
              Remember me
            </Text>
          </XStack>

          <Text
            fontSize={14}
            color="#666"
            {...forgotPasswordLink}
            hoverStyle={{ color: '#FF9F0D' }}
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Text>
        </XStack>

        {/* Login Button */}
        <Button
          color="white"
          pressStyle={{ opacity: 0.8 }}
          onPress={handleLogin}
          disabled={signingIn}
          style={{
            backgroundColor: signingIn ? '#FFB84D' : '#FF9F0D',
            height: 48,
            borderRadius: 8,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 24,
          }}
          icon={
            signingIn ? (
              <XStack style={{ marginRight: 8 }}>
                <Spinner size="small" color="white" />
              </XStack>
            ) : (
              <XStack style={{ marginRight: 8 }}>
                <Lock size={18} color="white" />
              </XStack>
            )
          }
        >
          {signingIn ? 'Logging in...' : 'Login'}
        </Button>

        {/* Social Login */}
        <YStack style={{ alignItems: 'center', gap: 16 }}>
          <Text fontSize={14} color="#666">
            or login with
          </Text>

          <XStack style={{ gap: 16 }}>
            <XStack
              width={40}
              height={40}
              style={{
                borderRadius: 20,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              onPress={() => handleSocialLogin('google')}
              pressStyle={{ opacity: 0.8 }}
            >
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/0/09/IOS_Google_icon.png',
                }}
                width={30}
                height={30}
                alt="Google"
              />
            </XStack>

            <XStack
              width={40}
              height={40}
              style={{
                borderRadius: 20,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              onPress={() => handleSocialLogin('facebook')}
              pressStyle={{ opacity: 0.8 }}
            >
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png',
                }}
                width={20}
                height={20}
                alt="Facebook"
              />
            </XStack>

            <XStack
              width={40}
              height={40}
              style={{
                borderRadius: 20,
                cursor: 'pointer',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderWidth: 1,
                borderColor: '#E0E0E0',
              }}
              onPress={() => handleSocialLogin('apple')}
              pressStyle={{ opacity: 0.8 }}
            >
              <Image
                source={{
                  uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png',
                }}
                width={20}
                height={20}
                alt="Apple"
              />
            </XStack>
          </XStack>
        </YStack>
      </YStack>

      {/* Sign Up */}
      <YStack style={{ alignItems: 'center', gap: 16, marginTop: 20 }}>
        <Text fontSize={14} color="#666">
          Don't have an account
        </Text>

        <Button
          color="white"
          pressStyle={{ opacity: 0.8 }}
          {...signupLink}
          style={{
            backgroundColor: '#FF9F0D',
            height: 48,
            borderRadius: 8,
            fontSize: 16,
            fontWeight: '600',
            paddingHorizontal: 40,
          }}
          icon={
            <XStack style={{ marginRight: 8 }}>
              <User size={18} color="white" />
            </XStack>
          }
        >
          Signup
        </Button>
      </YStack>

      {/* Footer Links */}
      <XStack
        gap={media.sm ? 8 : 16}
        style={{ marginTop: media.sm ? 20 : 40, flexWrap: 'wrap', justifyContent: 'center' }}
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
