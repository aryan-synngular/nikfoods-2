"use client"
import { XStack, Text, Button, YStack, View, Image, Switch } from 'tamagui'
import { useLink } from 'solito/navigation'
import { Platform, StatusBar, Dimensions } from 'react-native'
import { ArrowRight, Bell, ShoppingCart, User, User2 } from '@tamagui/lucide-icons'
import { primary, shadow, background, border } from './colors'
import { useAuth } from 'app/provider/auth-context'
import { ProfilePopUp } from '@my/ui/src/profile/ProfilePopUp'
import { useSession } from 'next-auth/react'
import { useNotificationStore } from 'app/src/store/useNotificationStore'
import { CartBadge, NotificationBellBadge } from './components/NotificationBadge'
import { NotificationPanel } from './components/NotificationPanel'
import { useStore } from 'app/src/store/useStore'
import { useEffect, useState } from 'react'
import { useScreen } from 'app/hook/useScreen'

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
  const {isMobile,isMobileWeb}=useScreen()
  const { user, signOut, loading } = useAuth()
  const { width } = Dimensions.get('window')
  // const isSmallScreen = width < 768

  // Notification store
  const { badges, unreadCount, updateCartBadge } = useNotificationStore()

  // Cart store
  const { cart,vegOnly,handleVegOnlyToggle } = useStore()

  // Notification panel state
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)

  // Update cart badge when cart changes
  useEffect(() => {
    const totalItems =
      cart?.days?.reduce(
        (total, day) => total + day.items.reduce((dayTotal, item) => dayTotal + item.quantity, 0),
        0
      ) || 0
    updateCartBadge(totalItems)
  }, [cart, updateCartBadge])

  const loginLink = useLink({
    href: '/login',
  })

  const cartLink = useLink({
    href: '/cart',
  })

  const adminLink = useLink({
    href: '/admin',
  })

  const accountLink = useLink({
    href: '/account',
  })

  const notificationLink = useLink({
    href: '/notification',
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
    borderTopWidth: 0,
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
    // elevation: Platform.OS === 'android' ? 4 : undefined,
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
            width={isMobileWeb ? 110 : 160}
            height={isMobileWeb ? 32 : 60}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('./assets/logo.png')}
            alt="nikfoods logo"
            width={ 120}
            height={ 40}
            resizeMode="contain"
          />
        )}
      </XStack>

      {/* Action Buttons */}
      <XStack gap={Platform.OS === 'web' ? 16 : 8} items="center" flexShrink={0}>
       
        {/* Admin Panel - Only show on web for admins */}
        {Platform.OS === 'web' && user && user.role === 'ADMIN'  &&!isMobileWeb && (
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
              opacity: 0.9,
            }}
            icon={User2}
            {...adminLink}
          >
            Admin Panel
          </Button>
        )}
 <XStack style={{ alignItems: 'center', gap: 8 }}>
          <Text fontSize={isMobile||isMobileWeb?12:16} color={vegOnly ? '#4caf50' : "#a19e9eff"} >
            Veg Only
          </Text>
          <Switch
            size={isMobile||isMobileWeb?"$2":"$3"}
            checked={vegOnly}
            onCheckedChange={()=>handleVegOnlyToggle(!vegOnly)}
            bg={vegOnly ? '#4caf50' : undefined}
          >
            <Switch.Thumb animation="bouncy" bg={vegOnly ? 'white' : '#f5f5f5'} />
          </Switch>
        </XStack>
        {/* Notification Bell */}
        <NotificationBellBadge count={unreadCount}>
          <Button
            size={Platform.OS === 'web' ? '$3' : '$2'}
            circular
            backgroundColor="transparent"
            borderWidth={0}
            hoverStyle={{
              backgroundColor: '#f5f5f5',
            }}
            pressStyle={{
              backgroundColor: '#e8e8e8',
            }}
            icon={<Bell size={Platform.OS === 'web' ? 20 : 18} color="#666" />}
            onPress={() => setNotificationPanelOpen(true)}
          />
        </NotificationBellBadge>

        {/* Shopping Cart */}
        <CartBadge count={badges.cart}>
          <Button
            size={Platform.OS === 'web' ? '$3' : '$2'}
            circular
            backgroundColor="transparent"
            borderWidth={0}
            hoverStyle={{
              backgroundColor: '#f5f5f5',
            }}
            pressStyle={{
              backgroundColor: '#e8e8e8',
            }}
            icon={<ShoppingCart size={Platform.OS === 'web' ? 20 : 18} color="#666" />}
            {...cartLink}
          />
        </CartBadge>

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
              opacity: 0.9,
            }}
            {...loginLink}
          >
            Login
          </Button>
        ) : 

       (isMobile||isMobileWeb)?  <Button
                 size={ '$3'}
                 background="#f5f2f2ff"
                 borderWidth={1}
                 borderColor="#c7c3c3ff"
                 borderRadius={12}
                 paddingHorizontal={ 10}
                 paddingVertical={ 8}
                 minHeight={ 36}
                 onPress={()=>accountLink.onPress()}
                 pressStyle={{
                   background: '#f0f0f0',
                 }}
               >
                
                   <User size={ 16} color="#666" />
                  
               </Button>:   <ProfilePopUp
            handleSignOut={handleSignOut}
            Name={getDisplayName()}
            accountLink="/account"
          />
        }
      </XStack>

      {/* Notification Panel */}
      <NotificationPanel open={notificationPanelOpen} onOpenChange={setNotificationPanelOpen} />
    </XStack>
  )
}
