import { Toast, useToastState } from '@tamagui/toast'
import { YStack, XStack, Text, Button } from 'tamagui'
import { CheckCircle, AlertTriangle, Info, XCircle, X, Check } from '@tamagui/lucide-icons'

export const NativeToast = () => {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) {
    return null
  }

  const customData = currentToast.customData || {}
  const { type = 'info', message: customMessage } = customData

  const displayMessage = customMessage || currentToast.message || currentToast.title

  const getToastConfig = (type: string) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#FFFFFF' as const,
          borderColor: '#10B981' as const,
          textColor: '#1F2937' as const,
          iconBg: '#10B981' as const,
          icon: <Check size={16} color="white" />,
        }
      case 'error':
        return {
          backgroundColor: '#FFFFFF' as const,
          borderColor: '#EF4444' as const,
          textColor: '#1F2937' as const,
          iconBg: '#EF4444' as const,
          icon: <XCircle size={16} color="white" />,
        }
      case 'warning':
        return {
          backgroundColor: '#FFFFFF' as const,
          borderColor: '#F59E0B' as const,
          textColor: '#1F2937' as const,
          iconBg: '#F59E0B' as const,
          icon: <AlertTriangle size={16} color="white" />,
        }
      case 'info':
      default:
        return {
          backgroundColor: '#FFFFFF' as const,
          borderColor: '#3B82F6' as const,
          textColor: '#1F2937' as const,
          iconBg: '#3B82F6' as const,
          icon: <Info size={16} color="white" />,
        }
    }
  }

  const config = getToastConfig(type)

  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      viewportName={currentToast.viewportName}
      enterStyle={{ opacity: 0, scale: 0.95, y: -10 }}
      exitStyle={{ opacity: 0, scale: 0.95, y: -10 }}
      y={0}
      opacity={1}
      scale={1}
      animation="quick"
      bg={config.backgroundColor}
      borderColor={config.borderColor}
      borderWidth={1.5}
      borderRadius="$3"
      shadowColor="rgba(0,0,0,0.1)"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.1}
      shadowRadius={4}
      elevation={3}
      minW={280}
      maxW={480}
      minH={60}
    >
      <XStack justify="space-evenly" items={'center'} flex={1}>
        {/* Left colored section with icon */}
        <XStack bg={config.iconBg} width={24} height={24} borderRadius="$3">
          <Text
            width="100%"
            height="100%"
            style={{ textAlign: 'center' }}
            fontSize={16}
            display="flex"
            items="center"
            justify="center"
          >
            {config.icon}
          </Text>
        </XStack>

        {/* Content section */}
        <XStack flex={1} ai="center" pl="$3" pr="$3">
          <YStack flex={1}>
            {currentToast.title && !customMessage && (
              <Toast.Title color={config.textColor} fontWeight="600" fontSize="$4" lineHeight="$1">
                {currentToast.title}
              </Toast.Title>
            )}
            {displayMessage && (
              <Text color={config.textColor} fontSize="$3" fontWeight="500" lineHeight="$2">
                {displayMessage}
              </Text>
            )}
          </YStack>
        </XStack>

        <XStack width={24} height={24}>
          {/* Close button */}
          <Button
            size="$2"
            circular
            chromeless
            disabled={true}
            ml="$2"
            p="$1"
            hoverStyle={{
              backgroundColor: 'rgba(0,0,0,0.05)',
            }}
            pressStyle={{
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}
          >
            <X size={14} color="#6B7280" />
          </Button>
        </XStack>
      </XStack>
    </Toast>
  )
}
