import { useState } from 'react'
import { Text, YStack, XStack, Input, Button, Image } from 'tamagui'
import { Mail, ArrowRight } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

interface ForgotPasswordPageProps {
  onSubmit?: (email: string) => void
  isSubmitting?: boolean
}

export function ForgotPasswordPage({ onSubmit, isSubmitting = false }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
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
  
  const handleSubmit = () => {
    if (email && email.includes('@')) {
      console.log('Password reset requested for:', email)
      // Here you would typically call your authentication service
      if (onSubmit) {
        // Call the provided onSubmit function with the email
        onSubmit(email)
      } else {
        // If no onSubmit provided, just show the success message
        setIsSubmitted(true)
      }
    }
  }

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
      
      {isSubmitted ? (
        // Success message after submission
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
          alignItems="center"
          gap={16}
        >
          <Text 
            fontSize={28} 
            fontWeight="700" 
            textAlign="center"
            marginBottom={8}
            color="#2A1A0C"
          >
            Check Your Email
          </Text>
          
          <Text 
            fontSize={14} 
            color="#666"
            textAlign="center"
            marginBottom={16}
          >
            We've sent a password reset link to {email}.
            Please check your inbox and follow the instructions.
          </Text>
          
          <Button 
            style={{
              backgroundColor: "#FF9F0D",
              height: 48,
              borderRadius: 8,
              paddingHorizontal: 40
            }}
            color="white"
            onPress={() => setIsSubmitted(false)}
            pressStyle={{ opacity: 0.8 }}
          >
            Try Again
          </Button>
        </YStack>
      ) : (
        // Forgot password form
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
            Forgot Password
          </Text>
          
          <Text 
            fontSize={14} 
            color="#666"
            textAlign="center"
            marginBottom={24}
          >
            Provide your account's email for which you want to reset password!
          </Text>
          
          {/* Email Input */}
          <YStack marginBottom={24} position="relative">
            <XStack 
              position="absolute"
              left={12}
              top={12}
              zIndex={1}
              opacity={0.5}
            >
              <Mail size={20} color="#666" />
            </XStack>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Enter registered e-mail"
              paddingLeft={40}
              height={48}
              borderWidth={1}
              borderColor="#E0E0E0"
              borderRadius={8}
              fontSize={14}
            />
          </YStack>
          
          {/* Next Button */}
          <Button 
            style={{
              backgroundColor: "#FF9F0D",
              height: 48,
              borderRadius: 8,
              marginBottom: 16
            }}
            color="white"
            onPress={handleSubmit}
            pressStyle={{ opacity: 0.8 }}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.7 : 1}
            icon={isSubmitting ? undefined : <ArrowRight size={18} color="white" />}
          >
            {isSubmitting ? 'Sending...' : 'Next'}
          </Button>
        </YStack>
      )}
      
      {/* Back to Login */}
      <YStack alignItems="center" marginTop={20}>
        <Button 
          style={{
            backgroundColor: "#FF9F0D",
            height: 48,
            borderRadius: 8,
            paddingHorizontal: 40
          }}
          color="white"
          {...loginLink}
          pressStyle={{ opacity: 0.8 }}
        >
          Back to login
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
