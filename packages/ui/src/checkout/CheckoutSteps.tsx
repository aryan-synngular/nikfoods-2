'use client'

import { XStack, YStack, Text, Button, Paragraph, styled, View } from 'tamagui'
import { User, MapPin, CreditCard } from '@tamagui/lucide-icons'

const StepCard = styled(View, {
  style: {
    borderRadius: 8,
    backgroundColor: 'white',
    padding: 16,
    borderWidth: 1,
    borderColor: '#EDEDED',
    marginBottom: 16,
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    width:"100%"
  },
})

export const CheckoutStep = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}) => (
  <StepCard>
    <XStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <XStack style={{ alignItems: 'center', gap: 12 }}>
        <YStack
          width={32}
          height={32}
          style={{
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'white',
          }}
        >
          {icon}
        </YStack>
        <Text fontWeight="600" fontSize={16} color="#1A1A1A">
          {title}
        </Text>
      </XStack>
      {action}
    </XStack>
    <Paragraph fontSize={14} color="#666666" style={{ marginLeft: 44 }}>
      {description}
    </Paragraph>
  </StepCard>
)

export default function CheckoutSteps() {
  return (
    <YStack>
      <CheckoutStep
        icon={<User size={16} color="#FF6B00" />}
        title="Login your Account"
        description="To place your order now, log in to your existing account or sign up."
        action={
          <Button
            style={{
              backgroundColor: '#FF6B00',
              color: 'white',
              fontWeight: '600',
              fontSize: 14,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 4,
            }}
            onPress={() => {}}
          >
            Login
          </Button>
        }
      />
      <CheckoutStep
        icon={<MapPin size={16} color="#FF6B00" />}
        title="Delivery Address"
        description="We'll only use your address to deliver your order safely and on time."
      />
      <CheckoutStep
        icon={<CreditCard size={16} color="#FF6B00" />}
        title="Payment"
        description="Choose your preferred payment method. Your information is safe and secure."
      />
    </YStack>
  )
}
