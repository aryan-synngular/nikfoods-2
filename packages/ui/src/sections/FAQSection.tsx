import { Text, YStack, XStack, Accordion } from 'tamagui'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons'

type FAQItemProps = {
  question: string
  answer: string | React.ReactNode
  isOpen: boolean
  onToggle: () => void
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <YStack 
      backgroundColor="#FFF4E4"
      borderRadius={8}
      marginBottom={12}
      overflow="hidden"
    >
      <XStack 
        padding={16}
        justifyContent="space-between"
        alignItems="center"
        onPress={onToggle}
        pressStyle={{ opacity: 0.8 }}
        style={{ cursor: 'pointer' }}
      >
        <Text fontWeight="600" fontSize={16} color="#2A1A0C">
          {question}
        </Text>
        {isOpen ? (
          <ChevronUp size={20} color="#2A1A0C" />
        ) : (
          <ChevronDown size={20} color="#2A1A0C" />
        )}
      </XStack>
      
      {isOpen && (
        <YStack padding={16} paddingTop={0}>
          {typeof answer === 'string' ? (
            <Text fontSize={14} color="#2A1A0C" lineHeight={20}>
              {answer}
            </Text>
          ) : (
            answer
          )}
        </YStack>
      )}
    </YStack>
  )
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(0)
  
  const faqs = [
    {
      id: 1,
      question: "How do I place my orders?",
      answer: (
        <YStack>
          <Text fontSize={14} color="#2A1A0C" marginBottom={8}>
            To place an order, simply follow these steps:
          </Text>
          <YStack paddingLeft={16}>
            <Text fontSize={14} color="#2A1A0C" marginBottom={4}>1. Open the app and browse restaurants or cuisines</Text>
            <Text fontSize={14} color="#2A1A0C" marginBottom={4}>2. Select the items you'd like to order and add them to your cart</Text>
            <Text fontSize={14} color="#2A1A0C" marginBottom={4}>3. Review your cart and proceed to checkout</Text>
            <Text fontSize={14} color="#2A1A0C" marginBottom={4}>4. Choose your delivery address or pickup option</Text>
            <Text fontSize={14} color="#2A1A0C" marginBottom={4}>5. Select a payment method and confirm your order</Text>
          </YStack>
          <Text fontSize={14} color="#2A1A0C" marginTop={8}>
            You'll receive updates and can track your order in real-time through the app
          </Text>
        </YStack>
      )
    },
    {
      id: 2,
      question: "What are your delivery hours?",
      answer: "We deliver from 11:00 AM to 10:00 PM every day. Last orders are accepted 30 minutes before closing time to ensure timely delivery."
    },
    {
      id: 3,
      question: "By what time duration can I get my order?",
      answer: "Delivery times typically range from 30-45 minutes depending on your location and order volume. During peak hours, it might take up to 60 minutes. You can always check the estimated delivery time in the app when placing your order."
    },
    {
      id: 4,
      question: "Can I cancel my order?",
      answer: "Yes, you can cancel your order within 5 minutes of placing it without any charges. After that, cancellation may be subject to a fee depending on the preparation status. For assistance with cancellations, please contact our customer support through the app."
    }
  ]
  
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <YStack padding={20} paddingBottom={40}>
      <Text 
        fontSize={24} 
        fontWeight="700" 
        color="#2A1A0C"
        marginBottom={24}
      >
        FAQ's
      </Text>
      
      <YStack>
        {faqs.map((faq, index) => (
          <FAQItem 
            key={faq.id}
            question={faq.question}
            answer={faq.answer}
            isOpen={openIndex === index}
            onToggle={() => toggleFAQ(index)}
          />
        ))}
      </YStack>
      
      <XStack justifyContent="center" marginTop={24}>
        <XStack 
          backgroundColor="#FFF4E4"
          paddingHorizontal={16}
          paddingVertical={8}
          borderRadius={20}
          borderColor="#FF9F0D"
          borderWidth={1}
          pressStyle={{ opacity: 0.8 }}
          style={{ cursor: 'pointer' }}
        >
          <Text color="#FF9F0D" fontWeight="600">
            View All
          </Text>
        </XStack>
      </XStack>
    </YStack>
  )
}
