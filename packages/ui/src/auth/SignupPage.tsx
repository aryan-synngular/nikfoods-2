"use client"

import { useState } from 'react'
import { Text, YStack, XStack, Input, Button, Image, useMedia } from 'tamagui'
import { Eye, EyeOff, Mail, Lock, User } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

export function SignupPage() {
  const media = useMedia()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
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
    href: '/signup/step2',
  })

  const handleSignup = () => {
    console.log('Signup with:', { email, password })
    // Validate inputs before proceeding
    if (email && password && password === confirmPassword) {
      // Navigate to step 2 using the link
      if (signupStep2Link.onPress) {
        signupStep2Link.onPress()
      }
    } else {
      // Show validation error
      console.log('Please fill all fields correctly')
    }
  }
  
  const handleSocialSignup = (provider: string) => {
    console.log(`Signup with ${provider}`)
    // Here you would typically redirect to OAuth provider
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
        justifyContent: 'space-between'
      }}
    >
      {/* Logo */}
      <YStack style={{alignItems: 'center', width: '100%'}}>
        <Image 
          source={{ uri: 'https://raw.githubusercontent.com/vinodmaurya/nikfoods/main/apps/next/public/logo.png' }}
          style={{width: 150, height: 50}}
          resizeMode="contain"
          alt="Nikfoods Logo"
        />
      </YStack>
      
      {/* Signup Form */}
      <YStack 
        style={{width: '100%', 
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
          alignSelf: 'center'
        }}
       >
      
        <Text 
          fontSize={media.sm ? 24 : 28} 
          fontWeight="700" 
          color="#2A1A0C"
          style={{textAlign: 'center', marginBottom: 8}}
        >
          Create Account
        </Text>
        
        <Text 
          fontSize={14} 
          color="#666"
          style={{textAlign: 'center', marginBottom: 24}}
        >
          No more typing your address every time. Pinky promise.
        </Text>
        
        {/* Email Input */}
        <YStack style={{marginBottom: 16, position: 'relative'}}>
          <XStack 
            position="absolute"
            style={{left: 12, top: 12, zIndex: 1, opacity: 0.5}}
          >
            <Mail size={20} color="#666" />
          </XStack>
          <Input
            value={email}
            onChangeText={setEmail}
            placeholder="E-mail"
            style={{paddingLeft: 40, paddingRight: 40, borderRadius: 8}}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            fontSize={14}
          />
        </YStack>
        
        {/* Password Input */}
        <YStack style={{marginBottom: 16, position: 'relative'}}>
          <XStack 
            position="absolute"
            style={{left: 12, top: 12, zIndex: 1, opacity: 0.5}}
          >
            <Lock size={20} color="#666" />
          </XStack>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry={!showPassword}
            style={{paddingLeft: 40, paddingRight: 40, borderRadius: 8}}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            fontSize={14}
          />
          <XStack 
            position="absolute"
            style={{right: 12, top: 12, zIndex: 1, opacity: 0.5}}
            onPress={() => setShowPassword(!showPassword)}
            cursor="pointer"
          >
            {showPassword ? (
              <EyeOff size={20} color="#666" />
            ) : (
              <Eye size={20} color="#666" />
            )}
          </XStack>
        </YStack>
        
        {/* Confirm Password Input */}
        <YStack style={{marginBottom: 24, position: 'relative'}}>
          <XStack 
            position="absolute"
            style={{left: 12, top: 12, zIndex: 1, opacity: 0.5}}
          >
            <Lock size={20} color="#666" />
          </XStack>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter password"
            secureTextEntry={!showConfirmPassword}
            style={{paddingLeft: 40, paddingRight: 40, paddingHorizontal: 40, height: 48, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 8, fontSize: 14}}
          />
          <XStack 
            position="absolute"
            style={{right: 12, top: 12, zIndex: 1, opacity: 0.5}}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            cursor="pointer"
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
          bg="#FF9F0D"
          color="white"
          style={{height: 48, borderRadius: 8, fontSize: 16, fontWeight: '600', marginBottom: 24}}
          onPress={handleSignup}
          pressStyle={{ opacity: 0.8 }}
          icon={<XStack mr={8}><User size={18} color="white" /></XStack>}
        >
          Next
        </Button>
        
        {/* Social Signup */}
        <YStack style={{alignItems: 'center', gap: 16}}>
          <Text fontSize={14} color="#666">
            or signup with
          </Text>
          
          <XStack gap={16}>
            <XStack 
              style={{width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1}}
              onPress={() => handleSocialSignup('Google')}
              pressStyle={{ opacity: 0.8 }}
              cursor="pointer"
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                style={{width: 20, height: 20}}
                alt="Google"
              />
            </XStack>
            
            <XStack 
              style={{width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1}}
              onPress={() => handleSocialSignup('Facebook')}
              pressStyle={{ opacity: 0.8 }}
              cursor="pointer"
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png' }}
                style={{width: 20, height: 20}}
                alt="Facebook"
              />
            </XStack>
            
            <XStack 
              style={{width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1}}
              onPress={() => handleSocialSignup('Apple')}
              pressStyle={{ opacity: 0.8 }}
              cursor="pointer"
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png' }}
                style={{width: 20, height: 20}}
                alt="Apple"
              />
            </XStack>
            
            <XStack 
              style={{width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', borderWidth: 1}}
              onPress={() => handleSocialSignup('Google')}
              pressStyle={{ opacity: 0.8 }}
              cursor="pointer"
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/2048px-Google_Chrome_icon_%28February_2022%29.svg.png' }}
                style={{width: 20, height: 20}}
                alt="Chrome"
              />
            </XStack>
          </XStack>
        </YStack>
      </YStack>
      
      {/* Login */}
      <YStack style={{alignItems: 'center', gap: 16, marginTop: 20}}>
        <Text fontSize={14} color="#666">
          Have an account
        </Text>
        
        <Button 
        
          background="#FF9F0D"
          color="white"
          style={{height: 48, borderRadius: 8, fontSize: 16, fontWeight: '600', paddingHorizontal: 40}}
          pressStyle={{ opacity: 0.8 }}
          {...loginLink}
          icon={<XStack style={{marginRight: 8}}><Lock size={18} color="white" /></XStack>}
        >
          Login
        </Button>
      </YStack>
      
      {/* Footer Links */}
      <XStack style={{gap: media.sm ? 8 : 16, marginTop: media.sm ? 20 : 40, flexWrap: 'wrap', justifyContent: 'center'}}>
        <Text 
          fontSize={12} 
          color="#666"
          {...termsLink}
          hoverStyle={{ color: "#FF9F0D" }}
          cursor="pointer"
        >
          Terms & Conditions
        </Text>
        
        <Text 
          fontSize={12} 
          color="#666"
          {...privacyLink}
          hoverStyle={{ color: "#FF9F0D" }}
          cursor="pointer"
        >
          Privacy Policy
        </Text>
        
        <Text 
          fontSize={12} 
          color="#666"
          {...refundLink}
          hoverStyle={{ color: "#FF9F0D" }}
          cursor="pointer"
        >
          Refund Policy
        </Text>
      </XStack>
    </YStack>
  )
}
