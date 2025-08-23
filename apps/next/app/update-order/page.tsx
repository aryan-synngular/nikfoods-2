"use client"

import { Suspense } from "react"
import UpdateOrder from "@my/ui/src/checkout/UpdateOrder"
import { View, Text, Spinner, YStack } from "tamagui"

function LoadingFallback() {
  return (
    <View flex={1} justify="center" items="center" p="$4" background="#F8F9FA">
      <YStack space="$3" items="center">
        <Spinner size="large" color="#FF6B00" />
        <Text fontSize="$4" color="#6B7280">Loading order update...</Text>
      </YStack>
    </View>
  )
}

export default function UpdateOrderPage(){
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UpdateOrder />
    </Suspense>
  )
}