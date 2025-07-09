"use client"

import { useState, useRef, useEffect } from 'react'
import { Text, YStack, XStack, Input, Button, Image, Spinner } from 'tamagui'
import { ArrowRight, RefreshCw } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

interface VerifyEmailPageProps {
  email?: string
}

export function VerifyEmailPage({ email = 'your email' }: VerifyEmailPageProps) {
  const [otp, setOtp] = useState<string[]>(['', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null])
  
  const changeEmailLink = useLink({
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
  
  // Handle OTP input change
  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp]
    
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return
    
    // Update the current input
    newOtp[index] = value
    setOtp(newOtp)
    
    // If value is entered and not the last input, focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }
  
  // Handle backspace key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // If current input is empty and backspace is pressed, focus previous input
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  // Handle verify button click
  const handleVerify = () => {
    const otpValue = otp.join('')
    if (otpValue.length === 4) {
      console.log('Verifying OTP:', otpValue)
      // Here you would call your verification API
      setIsLoading(true)
      setTimeout(() => {
        setIsLoading(false)
        // Navigate to set new password page after successful verification
        window.location.href = '/set-new-password'
      }, 1500)
    }
  }
  
  // Handle resend OTP
  const handleResendOtp = () => {
    if (canResend) {
      console.log('Resending OTP')
      setCanResend(false)
      setTimer(60)
      // Here you would call your API to resend OTP
    }
  }
  
  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (timer === 0) {
      setCanResend(true)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer, canResend])

  return (
    <YStack 
      flex={1} 
      bg="#FFF9F2"
      paddingTop={40}
      paddingBottom={20}
      paddingHorizontal={20}
      alignItems="center"
      justifyContent="space-between"
    >
      {/* Logo */}
      <YStack alignItems="center" width="100%">
        <Image 
          source={{ uri: 'https://raw.githubusercontent.com/vinodmaurya/nikfoods/main/apps/next/public/logo.png' }}
          width={150}
          height={50}
          resizeMode="contain"
          alt="Nikfoods Logo"
        />
      </YStack>
      
      {/* Verify Email Form */}
      <YStack 
        width="100%" 
        maxWidth={450} 
        padding={24}
        backgroundColor="white"
        borderRadius={16}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={10}
        elevation={5}
        marginVertical={40}
        alignSelf="center"
      >
        <Text 
          fontSize={28} 
          fontWeight="700" 
          textAlign="center"
          marginBottom={8}
          color="#2A1A0C"
        >
          Verify Email
        </Text>
        
        <Text 
          fontSize={14} 
          color="#666"
          textAlign="center"
          marginBottom={24}
        >
          Enter 4-digit OTP sent to your {email}{' '}
          <Text 
            color="#FF9F0D"
            {...changeEmailLink}
            style={{ cursor: 'pointer' }}
          >
            change email
          </Text>
        </Text>
        
        {/* OTP Input Fields */}
        <XStack 
          justifyContent="space-between" 
          marginBottom={24}
          paddingHorizontal={16}
        >
          {[0, 1, 2, 3].map((index) => (
            <Input
              key={index}
              ref={(el) => {
                if (el) {
                  inputRefs.current[index] = el
                }
              }}
              value={otp[index]}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyDown={(e) => handleKeyDown(e as any, index)}
              maxLength={1}
              textAlign="center"
              fontSize={24}
              fontWeight="600"
              width={60}
              height={60}
              borderWidth={1}
              borderColor="#E0E0E0"
              borderRadius={8}
              keyboardType="numeric"
              autoComplete="one-time-code"
            />
          ))}
        </XStack>
        
        {/* Resend OTP */}
        <XStack 
          justifyContent="center" 
          alignItems="center"
          marginBottom={24}
          gap={8}
        >
          <RefreshCw size={16} color="#FF9F0D" />
          {canResend ? (
            <Text 
              fontSize={14} 
              color="#FF9F0D"
              fontWeight="600"
              onPress={handleResendOtp}
              style={{ cursor: 'pointer' }}
            >
              Re-send otp
            </Text>
          ) : (
            <Text fontSize={14} color="#666">
              {`${timer}s`} Re-send otp
            </Text>
          )}
        </XStack>
        
        {/* Verify Button */}
        <Button 
          backgroundColor="#FF9F0D"
          color="white"
          height={48}
          borderRadius={8}
          fontSize={16}
          fontWeight="600"
          marginBottom={16}
          onPress={handleVerify}
          disabled={otp.join('').length !== 4 || isLoading}
          opacity={otp.join('').length !== 4 || isLoading ? 0.7 : 1}
          pressStyle={{ opacity: 0.8 }}
          icon={isLoading ? 
            <XStack marginRight={8}><Spinner size="small" color="white" /></XStack> : 
            <XStack marginRight={8}><ArrowRight size={18} color="white" /></XStack>
          }
        >
          Verify
        </Button>
      </YStack>
      
      {/* Footer Links */}
      <XStack gap={16} marginTop={40} flexWrap="wrap" justifyContent="center">
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
