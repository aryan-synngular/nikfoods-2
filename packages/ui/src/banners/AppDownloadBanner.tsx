"use client"

import { Image, Text, YStack, XStack, Button } from 'tamagui'
import { useState } from 'react'
import { useScreen } from 'app/hook/useScreen'

export function AppDownloadBanner() {
  const {isMobile}=useScreen()
  return (
    <YStack 
      style={{
        minWidth: isMobile?"90%":'60%',
        backgroundColor: '#FFF9F2',
        borderRadius: 16,
        padding: 16,
        margin: 20,
        marginTop: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#FF9F0D',
        overflow: 'hidden',
        justifyContent: 'center',
        
      }}
    >
      <XStack alignItems="center" >
        <YStack space="$2" flex={1} mr="$4">
          <Text fontWeight="600" fontSize={16} color="#2A1A0C">
            For better experience,
          </Text>
          <Text fontWeight="700" fontSize={18} color="#2A1A0C">
            download the Nikfoods app now
          </Text>
          
          <XStack space="$2" mt="$2">
            <Button
              backgroundColor="#000"
              borderRadius={8}
              paddingHorizontal={12}
              height={36}
              onPress={() => console.log('App Store')}
              pressStyle={{ opacity: 0.8 }}
              style={{ cursor: 'pointer' }}
            >
              <XStack alignItems="center" space="$1">
                <Image 
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/App_Store_%28iOS%29.svg/2048px-App_Store_%28iOS%29.svg.png' }} 
                  width={20} 
                  height={20} 
                  resizeMode="contain" 
                />
                <Text color="white" fontSize={12} fontWeight="600">
                  App Store
                </Text>
              </XStack>
            </Button>
            
            <Button
              backgroundColor="#000"
              borderRadius={8}
              paddingHorizontal={12}
              height={36}
              onPress={() => console.log('Google Play')}
              pressStyle={{ opacity: 0.8 }}
              style={{ cursor: 'pointer' }}
            >
              <XStack alignItems="center" space="$1">
                <Image 
                  source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png' }} 
                  width={20} 
                  height={20} 
                  resizeMode="contain" 
                />
                <Text color="white" fontSize={12} fontWeight="600">
                  Google Play
                </Text>
              </XStack>
            </Button>
          </XStack>
        </YStack>
        
        <XStack position="relative" width={120} height={120} justifyContent="center">
          {/* Food images in a circular arrangement */}
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0' }}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              position: 'absolute',
              top: 10,
              left: 35,
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0' }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              position: 'absolute',
              top: 5,
              right: 15,
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0' }}
            style={{
              width: 45,
              height: 45,
              borderRadius: 25,
              position: 'absolute',
              bottom: 15,
              right: 25,
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0' }}
            style={{
              width: 35,
              height: 35,
              borderRadius: 20,
              position: 'absolute',
              bottom: 25,
              left: 15,
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0' }}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              position: 'absolute',
              top: 40,
              left: 60,
              borderWidth: 2,
              borderColor: 'white',
            }}
          />
        </XStack>
      </XStack>
    </YStack>
  )
}
