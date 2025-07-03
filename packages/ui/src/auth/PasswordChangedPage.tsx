import { Text, YStack, XStack, Button, Image, Circle } from 'tamagui'
import { Check } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

interface PasswordChangedPageProps {
  onContinue?: () => void
}

export function PasswordChangedPage({ onContinue }: PasswordChangedPageProps) {
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
  
  const handleContinue = () => {
    if (onContinue) {
      onContinue()
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
      
      {/* Success Message */}
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
        {/* Success Icon */}
        <Circle size={120} backgroundColor="#E9F7F0">
          <Circle size={80} backgroundColor="#27AE60">
            <Check size={40} color="white" />
          </Circle>
        </Circle>
        
        <Text 
          fontSize={28} 
          fontWeight="700" 
          textAlign="center"
          marginTop={16}
          color="#2A1A0C"
        >
          Password Changed
        </Text>
        
        <Text 
          fontSize={14} 
          color="#666"
          textAlign="center"
          marginBottom={16}
        >
          Your password has been changed successfully!
        </Text>
        
        {/* Continue to Login Button */}
        <Button 
          style={{
            backgroundColor: "#FF9F0D",
            height: 48,
            borderRadius: 8,
            paddingHorizontal: 40
          }}
          color="white"
          onPress={handleContinue || loginLink.onPress}
          pressStyle={{ opacity: 0.8 }}
        >
          Continue to Login
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
