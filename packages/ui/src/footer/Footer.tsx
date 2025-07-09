"use client"

import { Text, YStack, XStack, Image, Stack } from 'tamagui'
import { useState, useEffect } from 'react'
import { Twitter, Facebook, Instagram, Youtube } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

type FooterLinkProps = {
  title: string
  href: string
}

function FooterLink({ title, href }: FooterLinkProps) {
  const linkProps = useLink({
    href: href,
  })

  return (
    <Text
      color="#E0E0E0"
      fontSize={14}
      mb={8}
      opacity={0.9}
      hoverStyle={{ opacity: 1, color: 'white' }}
      style={{ cursor: 'pointer' }}
      {...linkProps}
    >
      {title}
    </Text>
  )
}

function SocialIcon({ children, href }: { children: React.ReactNode, href: string }) {
  return (
    <XStack
      width={32}
      height={32}
      alignItems="center"
      justifyContent="center"
      bg="rgba(255,255,255,0.1)"
      mr={12}
      hoverStyle={{ bg: 'rgba(255,255,255,0.2)' }}
      pressStyle={{ opacity: 0.8 }}
      onPress={() => window.open(href, '_blank')}
      style={{ 
        cursor: 'pointer',
        borderRadius: 16 
      }}
    >
      {children}
    </XStack>
  )
}

export function AppFooter() {
  const [currentYear, setCurrentYear] = useState(2025)
  const [isMobile, setIsMobile] = useState(false)

  // Set current year and check screen size on mount
  useEffect(() => {
    setCurrentYear(new Date().getFullYear())
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  return (
    <YStack 
      bg="#2A1A0C" 
      py={40}
      px={20}
      width="100%"
    >
      <XStack 
        flexWrap="wrap"
        justifyContent="space-between"
        maxWidth={1200}
        marginHorizontal="auto"
        width="100%"
      >
        {/* Logo and About Section */}
        <YStack flex={1} minWidth={isMobile ? '100%' : 250} marginBottom={isMobile ? 32 : 0}>
          <Text color="white" fontSize={20} fontWeight="700" marginBottom={8}>
            Nikfoods
          </Text>
          <Text color="#E0E0E0" fontSize={14} marginBottom={16} maxWidth={300}>
            Your American source of tasty Indian Food
          </Text>
          
          <XStack marginBottom={16}>
            <SocialIcon href="https://twitter.com/nikfoods">
              <Twitter size={16} color="white" />
            </SocialIcon>
            <SocialIcon href="https://facebook.com/nikfoods">
              <Facebook size={16} color="white" />
            </SocialIcon>
            <SocialIcon href="https://instagram.com/nikfoods">
              <Instagram size={16} color="white" />
            </SocialIcon>
            <SocialIcon href="https://youtube.com/nikfoods">
              <Youtube size={16} color="white" />
            </SocialIcon>
          </XStack>
        </YStack>
        
        {/* Quick Links */}
        <YStack 
          minWidth={isMobile ? '50%' : 150} 
          marginBottom={isMobile ? 32 : 0}
          paddingRight={16}
        >
          <Text color="white" fontSize={16} fontWeight="600" marginBottom={16}>
            Quick Links
          </Text>
          <FooterLink title="Home" href="/" />
          <FooterLink title="Menu" href="/menu" />
          <FooterLink title="About" href="/about" />
          <FooterLink title="Help" href="/help" />
          <FooterLink title="FAQ's" href="/faqs" />
        </YStack>
        
        {/* Contact Us */}
        <YStack 
          minWidth={isMobile ? '50%' : 200} 
          marginBottom={isMobile ? 32 : 0}
        >
          <Text color="white" fontSize={16} fontWeight="600" marginBottom={16}>
            Contact Us
          </Text>
          <Text color="#E0E0E0" fontSize={14} marginBottom={8}>
            www.nikfoods.com
          </Text>
          <Text color="#E0E0E0" fontSize={14} marginBottom={8}>
            +12 9876543210
          </Text>
          <XStack alignItems="center">
            <Text color="#E0E0E0" fontSize={14}>
              Made with love in 
            </Text>
            <Text color="#E0E0E0" fontSize={14} marginLeft={4}>
              ❤️
            </Text>
          </XStack>
        </YStack>
        
        {/* My Account */}
        <YStack minWidth={isMobile ? '50%' : 150}>
          <Text color="white" fontSize={16} fontWeight="600" marginBottom={16}>
            My Account
          </Text>
          <FooterLink title="All Credit Cards" href="/payment" />
        </YStack>
      </XStack>
      
      {/* Bottom Bar */}
      <XStack 
        justifyContent="space-between" 
        marginTop={40}
        borderTopWidth={1}
        borderTopColor="rgba(255,255,255,0.1)"
        paddingTop={16}
        maxWidth={1200}
        marginHorizontal="auto"
        width="100%"
        flexDirection={isMobile ? 'column' : 'row'}
      >
        <Text color="#E0E0E0" fontSize={12} marginBottom={isMobile ? 8 : 0}>
          © {currentYear} Nikfoods LLC. All Rights Reserved.
        </Text>
        
        <XStack gap={16} flexWrap="wrap">
          <Text 
            color="#E0E0E0" 
            fontSize={12} 
            style={{ cursor: 'pointer' }}
            hoverStyle={{ color: 'white' }}
          >
            Terms of Service
          </Text>
          <Text 
            color="#E0E0E0" 
            fontSize={12} 
            style={{ cursor: 'pointer' }}
            hoverStyle={{ color: 'white' }}
          >
            Privacy Policy
          </Text>
          <Text 
            color="#E0E0E0" 
            fontSize={12} 
            style={{ cursor: 'pointer' }}
            hoverStyle={{ color: 'white' }}
          >
            Manage Cookies
          </Text>
        </XStack>
      </XStack>
    </YStack>
  )
}
