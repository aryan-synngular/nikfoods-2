import { Text, YStack, XStack, Input, Button } from 'tamagui'
import { useState } from 'react'

export function SubscriptionBanner() {
  const [email, setEmail] = useState('')
  
  const handleSubscribe = () => {
    if (email && email.includes('@')) {
      console.log('Subscribing with email:', email)
      // Here you would typically send the email to your subscription service
      setEmail('')
      // You could also show a success message
    }
  }

  return (
    <YStack 
      style={{
        backgroundColor: '#2A1A0C',
        padding: 24,
        margin: 20,
        marginTop: 0,
        marginBottom: 40,
        borderRadius: 12,
        alignItems: 'center',
      }}
    >
      <Text 
        color="white" 
        fontWeight="700" 
        fontSize={22} 
        textAlign="center"
        marginBottom={8}
      >
        Subscribe to us for all the updates!
      </Text>
      
      <Text 
        color="#E0E0E0" 
        fontSize={14} 
        textAlign="center"
        marginBottom={20}
      >
        Discover cooking tips, regional specialties, and the best way to enjoy Indian Cuisine at home in America.
      </Text>
      
      <XStack 
        width="100%" 
        maxWidth={450} 
        alignItems="center"
        gap={8}
      >
        <Input
          flex={1}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          backgroundColor="rgba(255,255,255,0.1)"
          borderWidth={0}
          color="white"
          borderRadius={8}
          height={44}
          paddingHorizontal={16}
        />
        
        <Button
          backgroundColor="white"
          color="#2A1A0C"
          fontWeight="600"
          borderRadius={8}
          height={44}
          paddingHorizontal={20}
          onPress={handleSubscribe}
          pressStyle={{ opacity: 0.8 }}
          style={{ cursor: 'pointer' }}
        >
          Subscribe
        </Button>
      </XStack>
    </YStack>
  )
}
