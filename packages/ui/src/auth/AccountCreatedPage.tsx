"use client"

import { useState } from 'react'
import { Text, YStack, XStack, Button, Image } from 'tamagui'
import { Check } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

export function AccountCreatedPage() {
  const homeLink = useLink({
    href: '/',
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

  return (
    <YStack 
      flex={1} 
      style={{
        backgroundColor: "#FFF9F2",
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 20,
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
      
      {/* Success Content */}
      <YStack 
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%',
          maxWidth: 500,
          alignSelf: 'center'
        }}
      >
        {/* Success Icon */}
        <YStack 
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#E8F5F0',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24
          }}
        >
          <YStack 
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: '#26B980',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Check color="white" size={32} />
          </YStack>
        </YStack>
        
        {/* Success Message */}
        <Text 
          style={{
            fontSize: 24,
            fontWeight: '600',
            color: '#333',
            marginBottom: 8,
            textAlign: 'center'
          }}
        >
          Account Created
        </Text>
        
        <Text 
          style={{
            fontSize: 16,
            color: '#666',
            marginBottom: 40,
            textAlign: 'center'
          }}
        >
          Your account has been created successfully!
        </Text>
        
        {/* Continue to Home Button */}
        <Button 
          color="white"
          height={48}
          fontSize={16}
          fontWeight="600"
          pressStyle={{ opacity: 0.8 }}
          {...homeLink}
          style={{
            backgroundColor: '#FF9F0D',
            paddingHorizontal: 40,
            borderRadius: 8,
            width: 200
          }}
        >
          Continue
        </Button>
      </YStack>
      
      {/* Footer Links */}
      <XStack style={{gap: 16, marginTop: 40, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 20}}>
        <Text 
          fontSize={12} 
          color="#666"
          {...termsLink}
          hoverStyle={{ color: "#FF9F0D" }}
          style={{ cursor: 'pointer' }}
        >
          Terms & Conditions
        </Text>
        
        <Text 
          fontSize={12} 
          color="#666"
          {...privacyLink}
          hoverStyle={{ color: "#FF9F0D" }}
          style={{ cursor: 'pointer' }}
        >
          Privacy Policy
        </Text>
        
        <Text 
          fontSize={12} 
          color="#666"
          {...refundLink}
          hoverStyle={{ color: "#FF9F0D" }}
          style={{ cursor: 'pointer' }}
        >
          Refund Policy
        </Text>
      </XStack>
    </YStack>
  )
}
