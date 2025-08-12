import { Button, Dialog, Spinner, Text, View, XStack, YStack } from "tamagui";
import { colors } from "../colors";
import { Check, AlertCircle } from '@tamagui/lucide-icons'
import { useLink } from 'solito/navigation'


export default function PaymentStatusPopup({ paymentStatus, completedOrderId ,setPaymentStatus}) {
   const ordersPage = useLink({
    href: '/account',
  })
  return (
   <Dialog modal open={paymentStatus !== null}>
        <Dialog.Portal>
          <Dialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
            backgroundColor="rgba(0, 0, 0, 0.5)"
          />
          <Dialog.Content
            key="content"
            animation="quick"
            enterStyle={{ opacity: 0, scale: 0.9 }}
            exitStyle={{ opacity: 0, scale: 0.95 }}
            backgroundColor="white"
            borderRadius={20}
            padding="$6"
            maxWidth={500}
            width="90%"
          >
            <YStack alignItems="center" space="$4">
              {/* Status Icon */}
              {paymentStatus === 'processing' && (
                <XStack p={36}>
                  <Spinner size="large" color={colors.primary}></Spinner>
                </XStack>
              )}

              {paymentStatus === 'success' && (
                <View
                  width={120}
                  height={120}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="#F0FDF4"
                  borderRadius={60}
                  marginBottom="$4"
                >
                  <View
                    width={80}
                    height={80}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="#22C55E"
                    borderRadius={40}
                  >
                    <Check size={40} color="white" />
                  </View>
                </View>
              )}

              {paymentStatus === 'failed' && (
                <View
                  width={120}
                  height={120}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor="#FEF2F2"
                  borderRadius={60}
                  marginBottom="$4"
                >
                  <View
                    width={80}
                    height={80}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="#EF4444"
                    borderRadius={40}
                  >
                    <AlertCircle size={40} color="white" />
                  </View>
                </View>
              )}

              {/* Status Text */}
              <YStack alignItems="center" space="$3">
                <Text fontSize="$6" fontWeight="700" color="#1F2937" textAlign="center">
                  {paymentStatus === 'processing' && 'Payment Processing!'}
                  {paymentStatus === 'success' && 'Payment Successful!'}
                  {paymentStatus === 'failed' && 'Oops! Payment Failed'}
                </Text>

                {completedOrderId && paymentStatus !== 'processing' && (
                  <Text fontSize="$4" color="#6B7280" textAlign="center">
                    Order ID #{completedOrderId}
                  </Text>
                )}

                <Text
                  fontSize="$4"
                  color="#6B7280"
                  textAlign="center"
                  lineHeight="$5"
                  maxWidth={320}
                >
                  {paymentStatus === 'processing' &&
                    'Your transaction is in progress. This may take a couple of minutes to complete'}
                  {paymentStatus === 'success' &&
                    'Your order has been placed and is on its way. A confirmation and tracking details have been sent to your inbox. Thanks for choosing us!'}
                  {paymentStatus === 'failed' &&
                    'Your card payment has failed, any amount deducted will be refunded in 5-7 working days. Please use an alternative card or payment mode to proceed.'}
                </Text>
              </YStack>

              {/* Action Buttons */}
              {paymentStatus === 'success' && (
                <XStack space="$3" width="100%">
                  <Button
                    flex={1}
                    height={50}
                    fontSize="$4"
                    fontWeight="600"
                    backgroundColor="transparent"
                    borderWidth={2}
                    borderColor="#FF6B00"
                    color="#FF6B00"
                    borderRadius={25}
                    onPress={() => {
                      setPaymentStatus(null)
                      // Navigate to home or products page
                    }}
                  >
                    Place another order
                  </Button>
                  <Button
                    flex={1}
                    height={50}
                    fontSize="$4"
                    fontWeight="600"
                    backgroundColor="#FF6B00"
                    color="white"
                    borderRadius={25}
                    onPress={() => {
                      setPaymentStatus(null)
                      ordersPage.onPress()
                    }}
                  >
                    Track Your Order
                  </Button>
                </XStack>
              )}

              {paymentStatus === 'failed' && (
                <XStack space="$3" width="100%">
                  <Button
                    flex={1}
                    height={50}
                    fontSize="$4"
                    fontWeight="600"
                    backgroundColor="transparent"
                    borderWidth={2}
                    borderColor="#FF6B00"
                    color="#FF6B00"
                    borderRadius={25}
                    onPress={() => {
                      setPaymentStatus(null)
                      // Show different payment methods
                    }}
                  >
                    Choose Different mode
                  </Button>
                  <Button
                    flex={1}
                    height={50}
                    fontSize="$4"
                    fontWeight="600"
                    backgroundColor="#FF6B00"
                    color="white"
                    borderRadius={25}
                    onPress={() => {
                      setPaymentStatus(null)
                      // Retry payment
                    }}
                  >
                    Try Again
                  </Button>
                </XStack>
              )}

              {/* Close button for success and failed states */}
              {/* {paymentStatus !== 'processing' && (
                <Button
                  position="absolute"
                  top="$3"
                  right="$3"
                  width={40}
                  height={40}
                  backgroundColor="transparent"
                  borderWidth={0}
                  onPress={() => setPaymentStatus(null)}
                >
                  <Text fontSize="$5" color="#666">
                    ×
                  </Text>
                </Button>
              )} */}
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
  );
}