import { useState } from 'react'
import { Text, YStack, XStack, Input, Button, Image } from 'tamagui'
import { Lock, Eye, EyeOff, ArrowRight } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

interface SetNewPasswordPageProps {
  onSubmit?: (password: string) => void
  isSubmitting?: boolean
}

export function SetNewPasswordPage({ onSubmit, isSubmitting = false }: SetNewPasswordPageProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  
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
    // Reset error
    setError('')
    
    // Validate password
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    // Submit the form
    if (onSubmit) {
      onSubmit(password)
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
      
      {/* Set New Password Form */}
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
          Set New Password
        </Text>
        
        <Text 
          fontSize={14} 
          color="#666"
          textAlign="center"
          marginBottom={24}
        >
          Your identity has been verified!<br />
          Set new password
        </Text>
        
        {/* Password Input */}
        <YStack marginBottom={16} position="relative">
          <XStack 
            position="absolute"
            left={12}
            top={12}
            zIndex={1}
            opacity={0.5}
          >
            <Lock size={20} color="#666" />
          </XStack>
          <Input
            value={password}
            onChangeText={setPassword}
            placeholder="Enter new password"
            paddingLeft={40}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            borderRadius={8}
            fontSize={14}
            secureTextEntry={!showPassword}
          />
          <XStack 
            position="absolute"
            right={12}
            top={12}
            zIndex={1}
            opacity={0.5}
            onPress={() => setShowPassword(!showPassword)}
            style={{ cursor: 'pointer' }}
          >
            {showPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
          </XStack>
        </YStack>
        
        {/* Confirm Password Input */}
        <YStack marginBottom={16} position="relative">
          <XStack 
            position="absolute"
            left={12}
            top={12}
            zIndex={1}
            opacity={0.5}
          >
            <Lock size={20} color="#666" />
          </XStack>
          <Input
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter new password"
            paddingLeft={40}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            borderRadius={8}
            fontSize={14}
            secureTextEntry={!showConfirmPassword}
          />
          <XStack 
            position="absolute"
            right={12}
            top={12}
            zIndex={1}
            opacity={0.5}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={{ cursor: 'pointer' }}
          >
            {showConfirmPassword ? <EyeOff size={20} color="#666" /> : <Eye size={20} color="#666" />}
          </XStack>
        </YStack>
        
        {/* Error message */}
        {error ? (
          <Text 
            fontSize={14} 
            color="red"
            textAlign="center"
            marginBottom={16}
          >
            {error}
          </Text>
        ) : null}
        
        {/* Update Button */}
        <Button 
          style={{
            backgroundColor: "#FF9F0D",
            height: 48,
            borderRadius: 8
          }}
          color="white"
          onPress={handleSubmit}
          pressStyle={{ opacity: 0.8 }}
          disabled={isSubmitting}
          opacity={isSubmitting ? 0.7 : 1}
          icon={isSubmitting ? undefined : <ArrowRight size={18} color="white" />}
        >
          {isSubmitting ? 'Updating...' : 'Update'}
        </Button>
      </YStack>
      
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
