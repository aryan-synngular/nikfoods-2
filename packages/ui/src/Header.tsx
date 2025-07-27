import { XStack, Text, Button, YStack, View, Image } from 'tamagui'
import { useLink } from 'solito/navigation'
import { Platform } from 'react-native'
import { ArrowRight, Bell, ShoppingCart, User2 } from '@tamagui/lucide-icons'
import { primary, shadow, background, border } from './colors'
import { useAuth } from 'app/provider/auth-context'
import { ProfilePopUp } from '@my/ui/src/profile/ProfilePopUp'
import { useSession } from 'next-auth/react'

// Add shimmer loader for profile tab
function ProfileTabShimmer() {
  return (
    <YStack
      width={150}
      height={40}
      bg="#ececec"
      style={{ borderRadius: 10, opacity: 0.7, overflow: 'hidden', marginLeft: 8, marginRight: 8 }}
      className="shimmer-effect"
    />
  )
}

export const AppHeader = () => {
  const { user, signOut, loading } = useAuth()
  console.log(user)
  console.log(user)
  const loginLink = useLink({
    href: '/login',
  })

  const cartLink = useLink({
    href: '/cart',
  })

  const adminLink = useLink({
    href: '/admin',
  })

  // Use inline styles for web-specific sticky positioning
  const headerStyle = {
    height: 60,
    width: '100%',
    backgroundColor: background,
    borderBottomWidth: 0.5, // Thinner border
    borderBottomColor: border,
    paddingHorizontal: 16, // Using pixel value instead of token
    justifyContent: 'space-between',
    alignItems: 'center',
    position: Platform.OS === 'web' ? 'sticky' : 'absolute',
    top: 0,
    zIndex: 100,
    boxShadow: `0px 2px 4px ${shadow}`, // Subtle shadow
    fontFamily: 'Nunito', // Apply Nunito font to the header
  } as any

  const handleSignOut = async () => {
    // console.log("Hello")
    // update({isCompleted:true, abc:"sdkjf"
    // })
    await signOut()
    loginLink.onPress()
  }

  return (
    <XStack style={headerStyle}>
      {/* Logo */}
      <XStack style={{ alignItems: 'center', paddingLeft: 0 }}>
        {Platform.OS === 'web' ? (
          // Web version uses absolute URL from public directory
          <Image
            source={{ uri: '/images/logo.png' }}
            alt="nikfoods logo"
            width={120}
            height={40}
            resizeMode="contain"
          />
        ) : (
          // Native version uses require statement for bundled assets
          <Image
            source={require('./assets/logo.png')}
            alt="nikfoods logo"
            width={120}
            height={40}
            resizeMode="contain"
          />
        )}
      </XStack>

      {/* Action Buttons */}
      <XStack style={{ gap: 8, alignItems: 'center', paddingRight: 12 }}>
        {Platform.OS == 'web' && user && user.role === 'ADMIN' && (
          <Button
            size="$3"
            theme="dark"
            mr={20}
            bg={'black'}
            color={'white'}
            hoverStyle={{ background: 'black' }}
            icon={User2}
            {...adminLink}
          >
            Admin Panel
          </Button>
        )}
        <Button
          size="$3"
          circular
          icon={<Bell size="$1" />}
          style={{ backgroundColor: 'transparent' }}
        />
        <Button
          size="$3"
          circular
          icon={<ShoppingCart size="$1" />}
          style={{ backgroundColor: 'transparent' }}
          {...cartLink}
        />

        {/* Profile/Login Tab */}
        {loading ? (
          <ProfileTabShimmer />
        ) : !user ? (
          <Button
            size="$3"
            style={{
              backgroundColor: primary,
              color: background,
              fontFamily: 'Nunito',
              fontWeight: '600',
            }}
            {...loginLink}
          >
            Login
          </Button>
        ) : (
          <ProfilePopUp handleSignOut={handleSignOut} Name={user?.email}></ProfilePopUp>
        )}
      </XStack>
    </XStack>
  )
}

// Using inline styles instead of styled components to avoid TypeScript issues
