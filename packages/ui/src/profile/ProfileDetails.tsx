"use client"
import { Button, Text, XStack } from "tamagui";
import { useAuth } from 'app/provider/auth-context'
import { Home, LogOut, ShoppingCart, User } from '@tamagui/lucide-icons'
import { useLink } from "solito/navigation";
export default function ProfileDetails(){
  const { signOut } = useAuth()
   const loginLink = useLink({
      href: '/login',
    })
  const handleSignOut = async () => {

    try {
      await signOut()
      loginLink.onPress()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }
                return (
                  <Button
                    size="$4"
                    backgroundColor="transparent"
                    borderWidth={0}
                    borderRadius={8}
                    paddingVertical={14}
                    paddingHorizontal={16}
                    minHeight={48}
                    justifyContent="flex-start"
                    hoverStyle={{
                      backgroundColor: '#fef2f2',
                    }}
                    pressStyle={{
                      backgroundColor: '#fee2e2',
                    }}
                    onPress={handleSignOut}
                  >
                    <XStack alignItems="center" gap={12} flex={1}>
                      <LogOut size={18} color="#dc2626" />
                      <Text fontSize={15} fontWeight="500" color="#dc2626" lineHeight={20}>
                        Log out
                      </Text>
                    </XStack>
                  </Button>
                )
}