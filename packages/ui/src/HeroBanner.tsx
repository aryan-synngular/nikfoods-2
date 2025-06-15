import { XStack, YStack, Text, Button, Stack } from 'tamagui'
import { Platform, Image } from 'react-native'
import { ArrowRight } from '@tamagui/lucide-icons'
import { primary, background } from './colors'

export const HeroBanner = () => {
  // Only render on web (not on mobile)
  if (Platform.OS !== 'web') {
    return null
  }

  return (
    <XStack
      style={{
        position: 'relative',
        width: '100%',
        height: 400,
        overflow: 'hidden',

        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 0,
        marginTop: 0,
      }}
    >
      {/* Background pattern overlay */}
      <Stack
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.8,
          backgroundImage: 'url(/images/pattern-bg.png)',
          backgroundSize: 'cover',
          zIndex: 1,
        }}
      />

      {/* Left section with text and button */}
      <YStack
        style={{
          paddingLeft: 80,
          paddingRight: 0,
          maxWidth: 650,
          zIndex: 2,
        }}
      >
        <Image
          source={{ uri: '/images/banner-text.png' }}
          style={{
            width: 400,
            height: 100,
            resizeMode: 'contain',
          }}
        />

        <Text
          style={{
            fontSize: 18,
            color: '#666',
            marginBottom: 20,
            lineHeight: 28,
            fontFamily: 'Nunito',
          }}
        >
          Order your favorite curries, biryanis, and more for convenient delivery across United
          States and{' '}
          <Text style={{ color: primary, fontFamily: 'Nunito' }}>we do free deliveries too!</Text>
        </Text>
        <Button
          style={{
            backgroundColor: primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            // Use individual border radius properties instead of the shorthand
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            alignSelf: 'flex-start',
            marginTop: 10,
          }}
        >
          <Text
            style={{ color: 'white', fontWeight: 'bold', marginRight: 8, fontFamily: 'Nunito' }}
          >
            Schedule your weekly meal
          </Text>
          <ArrowRight color="white" size={18} />
        </Button>
      </YStack>

      {/* Right section with food image */}
      <XStack
        style={{
          height: '100%',
          justifyContent: 'flex-end',
          zIndex: 2,
        }}
      >
        <Image
          source={{ uri: '/images/thali-plate.png' }}
          style={{
            width: 500,
            height: 500,
            resizeMode: 'cover',
          }}
        />
      </XStack>

      {/* Decorative elements */}
      <Stack
        style={{
          position: 'absolute',
          bottom: 50,
          left: 50,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: '#FFE4C4',
          opacity: 0.6,
          zIndex: 1,
        }}
      />
      <Stack
        style={{
          position: 'absolute',
          top: 80,
          right: 400,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: '#FFA500',
          opacity: 0.3,
          zIndex: 1,
        }}
      />
    </XStack>
  )
}
