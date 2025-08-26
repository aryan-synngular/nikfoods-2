'use client'
import { YStack, XStack } from 'tamagui'

function Shimmer({ style }: { style?: any }) {
  return (
    <YStack
      bg="#ececec"
      style={{ ...style, opacity: 0.7, overflow: 'hidden', position: 'relative' }}
      className="shimmer-effect"
    />
  )
}

export function ZincodesSkeleton({ count = 7 }: { count?: number }) {
  return (
    <YStack
      minW={800}
      bg="#fff"
      height={'64vh'}
      style={{
        overflow: 'auto',
        borderRadius: '12px',
      }}
      shadowColor="#4F8CFF22"
      shadowOpacity={0.08}
    >
      {/* Table Header */}
      <XStack
        bg="#E6F0FF"
        p={12}
        justify={'space-between'}
        borderTopLeftRadius={12}
        borderTopRightRadius={12}
      >
        <Shimmer style={{ width: 120, height: 16, borderRadius: 8 }} />
        <Shimmer style={{ width: 150, height: 16, borderRadius: 8 }} />
        <Shimmer style={{ width: 180, height: 16, borderRadius: 8 }} />
      </XStack>

      {/* Table Body */}
      {Array.from({ length: count }).map((_, idx) => (
        <XStack
          justify={'space-between'}
          key={`loader-${idx}`}
          p={12}
          bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'}
          items="center"
          borderBottomWidth={1}
          borderColor="#F0F0F0"
        >
          <Shimmer style={{ width: 120, height: 16, borderRadius: 8 }} />
          <Shimmer style={{ width: 150, height: 16, borderRadius: 8 }} />
          <Shimmer style={{ width: 120, height: 16, borderRadius: 8 }} />
          <XStack width={180} items="center" gap={8}>
            <Shimmer style={{ width: 60, height: 28, borderRadius: 6 }} />
            <Shimmer style={{ width: 60, height: 28, borderRadius: 6 }} />
          </XStack>
        </XStack>
      ))}
    </YStack>
  )
}
