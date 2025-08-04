import { XStack, Text, Button, YStack, View, Image } from 'tamagui'
import { useLink } from 'solito/navigation'
import { Platform, StatusBar, Dimensions } from 'react-native'
import { ArrowRight, Bell, ShoppingCart, User2 } from '@tamagui/lucide-icons'
import { primary, shadow, background, border } from './colors'
import { useAuth } from 'app/provider/auth-context'
import { ProfilePopUp } from '@my/ui/src/profile/ProfilePopUp'
import { useSession } from 'next-auth/react'

// Add shimmer loader for profile tab
function ProfileTabShimmer() {
  return (
    <YStack
      width={Platform.OS === 'web' ? 120 : 80}
      height={Platform.OS === 'web' ? 40 : 36}
      bg="#f0f0f0"
      borderRadius={8}
      opacity={0.7}
      marginLeft={Platform.OS === 'web' ? 8 : 4}
      marginRight={Platform.OS === 'web' ? 8 : 4}
      className="shimmer-effect"
    />
  )
}

export const AppHeader = () => {
  const { user, signOut, loading } = useAuth()
  const { width } = Dimensions.get('window')
  const isSmallScreen = width < 768
  
  const loginLink = useLink({
    href: '/login',
  })

  const cartLink = useLink({
    href: '/account',
  })

  const adminLink = useLink({
    href: '/account',
  })

  const notificationLink = useLink({
    href: '/account',
  })

  // Calculate proper top position for mobile
  const getTopPosition = () => {
    if (Platform.OS === 'web') return 0
    return StatusBar.currentHeight || 24
  }

  // Use inline styles for web-specific sticky positioning
  const headerStyle = {
    height: 60,
    width: '100%',
    backgroundColor: background,
    borderBottomWidth: 0.5,
    borderBottomColor: border,
    paddingHorizontal: Platform.OS === 'web' ? 20 : 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: Platform.OS === 'web' ? 'sticky' : 'absolute',
    top: getTopPosition(),
    zIndex: 100,
    boxShadow: Platform.OS === 'web' ? `0px 2px 8px ${shadow}20` : undefined,
    shadowColor: Platform.OS !== 'web' ? shadow : undefined,
    shadowOffset: Platform.OS !== 'web' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS !== 'web' ? 0.1 : undefined,
    shadowRadius: Platform.OS !== 'web' ? 4 : undefined,
    elevation: Platform.OS === 'android' ? 4 : undefined,
    fontFamily: 'Nunito',
  } as any

  const handleSignOut = async () => {
    try {
      await signOut()
      loginLink.onPress()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  // Get display name - avoid showing full email on mobile
  const getDisplayName = () => {
    if (!user) return ''
    
    if (Platform.OS === 'web') {
      return user.name || user.email?.split('@')[0] || 'User'
    }
    
    // On mobile, prefer name or show just username part of email
    return user.name || user.email?.split('@')[0] || 'Profile'
  }


  return (
    <XStack style={headerStyle}>
      {/* Logo */}
      <XStack alignItems="center" flex={1}>
        {Platform.OS === 'web' ? (
          <Image
            source={{ uri: '/images/logo.png' }}
            alt="nikfoods logo"
            width={isSmallScreen ? 100 : 120}
            height={isSmallScreen ? 32 : 40}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('./assets/logo.png')}
            alt="nikfoods logo"
            width={isSmallScreen ? 100 : 120}
            height={isSmallScreen ? 32 : 40}
            resizeMode="contain"
          />
        )}
      </XStack>

      {/* Action Buttons */}
      <XStack 
        gap={Platform.OS === 'web' ? 12 : 8}
        alignItems="center"
        flexShrink={0}
      >
        {/* Admin Panel - Only show on web for admins */}
        {Platform.OS === 'web' && user && user.role === 'ADMIN' && !isSmallScreen && (
          <Button
            size="$3"
            backgroundColor={primary}
            color="white"
            borderRadius={8}
            fontWeight="600"
            paddingHorizontal={16}
            borderWidth={0}
            hoverStyle={{ 
              backgroundColor: primary,
              opacity: 0.9
            }}
            icon={User2}
            {...adminLink}
          >
            Admin Panel
          </Button>
        )}

        {/* Notification Bell */}
        <Button
          size={Platform.OS === 'web' ? '$3' : '$2'}
          circular
          backgroundColor="transparent"
          borderWidth={0}
          hoverStyle={{ 
            backgroundColor: '#f5f5f5'
          }}
          pressStyle={{
            backgroundColor: '#e8e8e8'
          }}
          icon={<Bell size={Platform.OS === 'web' ? 20 : 18} color="#666" />}
          {...notificationLink}
        />

        {/* Shopping Cart */}
        <Button
          size={Platform.OS === 'web' ? '$3' : '$2'}
          circular
          backgroundColor="transparent"
          borderWidth={0}
          hoverStyle={{ 
            backgroundColor: '#f5f5f5'
          }}
          pressStyle={{
            backgroundColor: '#e8e8e8'
          }}
          icon={<ShoppingCart size={Platform.OS === 'web' ? 20 : 18} color="#666" />}
          {...cartLink}
        />

        {/* Profile/Login Tab */}
        {loading ? (
          <ProfileTabShimmer />
        ) : !user ? (
          <Button
            size={Platform.OS === 'web' ? '$3' : '$2'}
            backgroundColor={primary}
            color="white"
            fontFamily="Nunito"
            fontWeight="600"
            borderRadius={8}
            paddingHorizontal={Platform.OS === 'web' ? 20 : 16}
            borderWidth={0}
            hoverStyle={{ 
              backgroundColor: primary,
              opacity: 0.9
            }}
            {...loginLink}
          >
            Login
          </Button>
        ) : (
          <ProfilePopUp 
            handleSignOut={handleSignOut} 
            Name={getDisplayName()}
            accountLink="/account"
          />
        )}
      </XStack>
    </XStack>
  )
}