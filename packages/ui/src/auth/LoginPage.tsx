import { useState } from 'react'
import { Text, YStack, XStack, Input, Button, Checkbox, Image } from 'tamagui'
import { Eye, EyeOff, Mail, Lock, User } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'

export function LoginPage() {
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
  
  const handleLogin = () => {
    console.log('Login with:', { email, password, rememberMe })
    // Here you would typically call your authentication service
  }
  
  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`)
    // Here you would typically redirect to OAuth provider
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
      
      {/* Login Form */}
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
          Login
        </Text>
        
        <Text 
          fontSize={14} 
          color="#666"
          textAlign="center"
          marginBottom={24}
        >
          No more typing your address every time. Pinky promise.
        </Text>
        
        {/* Email Input */}
        <YStack marginBottom={16} position="relative">
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
            placeholder="Enter e-mail"
            paddingLeft={40}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            borderRadius={8}
            fontSize={14}
          />
        </YStack>
        
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
            placeholder="********"
            secureTextEntry={!showPassword}
            paddingLeft={40}
            paddingRight={40}
            height={48}
            borderWidth={1}
            borderColor="#E0E0E0"
            borderRadius={8}
            fontSize={14}
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
            {showPassword ? (
              <EyeOff size={20} color="#666" />
            ) : (
              <Eye size={20} color="#666" />
            )}
          </XStack>
        </YStack>
        
        {/* Remember Me and Forgot Password */}
        <XStack 
          justifyContent="space-between" 
          alignItems="center"
          marginBottom={24}
        >
          <XStack alignItems="center" gap={8}>
            <Checkbox 
              checked={rememberMe} 
              onCheckedChange={(checked) => setRememberMe(!!checked)}
              backgroundColor={rememberMe ? "#FF9F0D" : undefined}
              borderColor={rememberMe ? "#FF9F0D" : "#E0E0E0"}
            />
            <Text fontSize={14} color="#666">
              Remember me
            </Text>
          </XStack>
          
          <Text 
            fontSize={14} 
            color="#666"
            {...forgotPasswordLink}
            hoverStyle={{ color: "#FF9F0D" }}
            style={{ cursor: 'pointer' }}
          >
            Forgot password?
          </Text>
        </XStack>
        
        {/* Login Button */}
        <Button 
          backgroundColor="#FF9F0D"
          color="white"
          height={48}
          borderRadius={8}
          fontSize={16}
          fontWeight="600"
          marginBottom={24}
          onPress={handleLogin}
          pressStyle={{ opacity: 0.8 }}
          icon={<XStack marginRight={8}><Lock size={18} color="white" /></XStack>}
        >
          Login
        </Button>
        
        {/* Social Login */}
        <YStack alignItems="center" gap={16}>
          <Text fontSize={14} color="#666">
            or login with
          </Text>
          
          <XStack gap={16}>
            <XStack 
              width={40} 
              height={40} 
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              backgroundColor="white"
              borderWidth={1}
              borderColor="#E0E0E0"
              onPress={() => handleSocialLogin('Google')}
              pressStyle={{ opacity: 0.8 }}
              style={{ cursor: 'pointer' }}
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                width={20}
                height={20}
                alt="Google"
              />
            </XStack>
            
            <XStack 
              width={40} 
              height={40} 
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              backgroundColor="white"
              borderWidth={1}
              borderColor="#E0E0E0"
              onPress={() => handleSocialLogin('Facebook')}
              pressStyle={{ opacity: 0.8 }}
              style={{ cursor: 'pointer' }}
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/600px-Facebook_Logo_%282019%29.png' }}
                width={20}
                height={20}
                alt="Facebook"
              />
            </XStack>
            
            <XStack 
              width={40} 
              height={40} 
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              backgroundColor="white"
              borderWidth={1}
              borderColor="#E0E0E0"
              onPress={() => handleSocialLogin('Apple')}
              pressStyle={{ opacity: 0.8 }}
              style={{ cursor: 'pointer' }}
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png' }}
                width={20}
                height={20}
                alt="Apple"
              />
            </XStack>
            
            <XStack 
              width={40} 
              height={40} 
              borderRadius={20}
              alignItems="center"
              justifyContent="center"
              backgroundColor="white"
              borderWidth={1}
              borderColor="#E0E0E0"
              onPress={() => handleSocialLogin('Google')}
              pressStyle={{ opacity: 0.8 }}
              style={{ cursor: 'pointer' }}
            >
              <Image 
                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Google_Chrome_icon_%28February_2022%29.svg/2048px-Google_Chrome_icon_%28February_2022%29.svg.png' }}
                width={20}
                height={20}
                alt="Chrome"
              />
            </XStack>
          </XStack>
        </YStack>
      </YStack>
      
      {/* Sign Up */}
      <YStack alignItems="center" gap={16} marginTop={20}>
        <Text fontSize={14} color="#666">
          Don't have an account
        </Text>
        
        <Button 
          backgroundColor="#FF9F0D"
          color="white"
          height={48}
          borderRadius={8}
          fontSize={16}
          fontWeight="600"
          paddingHorizontal={40}
          onPress={() => console.log('Navigate to signup')}
          pressStyle={{ opacity: 0.8 }}
          {...signupLink}
          icon={<XStack marginRight={8}><User size={18} color="white" /></XStack>}
        >
          Signup
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
