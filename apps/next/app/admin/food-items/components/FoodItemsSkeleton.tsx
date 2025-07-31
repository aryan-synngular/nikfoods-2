import { XStack, YStack, Text } from 'tamagui'

// Individual table row skeleton
const FoodItemRowSkeleton = ({ index }: { index: number }) => {
  return (
    <XStack
      justify={'space-between'}
      p={12}
      bg={index % 2 === 0 ? '#F6FAFF' : '#FFF'}
      items="center"
      borderBottomWidth={1}
      borderColor="#F0F0F0"
      position="relative"
      overflow="hidden"
    >
      {/* Shimmer overlay effect */}
      <YStack
        position="absolute"
        top={0}
        left={-100}
        right={0}
        bottom={0}
        bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
        animation="lazy"
        animateOnly={['left']}
        style={{
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
          animationDelay: `${index * 0.1}s`,
        }}
      />

      {/* Image skeleton */}
      <YStack
        style={{
          borderRadius: '40px',
          overflow: 'hidden',
          width: 80,
          height: 80,
        }}
      >
        <YStack
          bg="#F0F0F0"
          width={'100%'}
          height={'100%'}
          borderRadius={40}
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Name skeleton */}
      <YStack width={180}>
        <YStack
          bg="#F0F0F0"
          borderRadius={6}
          height={18}
          width="75%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.2s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Description skeleton */}
      <YStack width={250} gap="$1">
        <YStack
          bg="#F0F0F0"
          borderRadius={4}
          height={14}
          width="90%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.3s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <YStack
          bg="#F0F0F0"
          borderRadius={4}
          height={14}
          width="60%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.4s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Price skeleton */}
      <YStack width={60}>
        <YStack
          bg="#F0F0F0"
          borderRadius={4}
          height={16}
          width="80%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.5s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Category skeleton */}
      <YStack width={150} gap="$1">
        <XStack
          style={{ borderRadius: '100px' }}
          bg={'#F0F0F0'}
          p={'$1'}
          items={'center'}
          justify={'flex-start'}
          width="85%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.6s',
            animationTimingFunction: 'ease-in-out',
          }}
        >
          <YStack bg="#E0E0E0" borderRadius={50} width={12} height={12} ml="$1" />
          <YStack bg="#E0E0E0" borderRadius={4} height={12} width={60} ml="$1" />
        </XStack>
      </YStack>

      {/* Veg/Non-Veg skeleton */}
      <YStack width={120}>
        <YStack
          bg="#F0F0F0"
          borderRadius={4}
          height={16}
          width="70%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.7s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Available skeleton */}
      <YStack width={120}>
        <YStack
          bg="#F0F0F0"
          borderRadius={4}
          height={16}
          width="80%"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.8s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Actions skeleton */}
      <XStack width={180} items="center" gap={4}>
        <YStack
          bg="#F0F0F0"
          borderRadius={6}
          width={60}
          height={32}
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '0.9s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <YStack
          bg="#F0F0F0"
          borderRadius={6}
          width={70}
          height={32}
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationDelay: '1s',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </XStack>
    </XStack>
  )
}

// Main table skeleton
const FoodItemsTableSkeleton = () => {
  return (
    <YStack
      minW={1490}
      bg="#fff"
      height={'64vh'}
      style={{
        overflow: 'auto',
        borderRadius: '12px',
      }}
      shadowColor="#4F8CFF22"
      shadowOpacity={0.08}
    >
      {/* Table Header - Keep original header */}
      <XStack
        bg="#E6F0FF"
        p={12}
        justify={'space-between'}
        borderTopLeftRadius={12}
        borderTopRightRadius={12}
      >
        <Text width={80} fontWeight="700" color="#4F8CFF">
          Image
        </Text>
        <Text width={180} fontWeight="700" color="#4F8CFF">
          Name
        </Text>
        <Text width={250} fontWeight="700" color="#4F8CFF">
          Description
        </Text>
        <Text width={90} fontWeight="700" color="#4F8CFF">
          Price (₹)
        </Text>
        <Text width={120} fontWeight="700" color="#4F8CFF">
          Category
        </Text>
        <Text width={120} fontWeight="700" color="#4F8CFF">
          Veg/Non-Veg
        </Text>
        <Text width={120} fontWeight="700" color="#4F8CFF">
          Available
        </Text>
        <Text width={180} fontWeight="700" color="#4F8CFF">
          Actions
        </Text>
      </XStack>

      {/* Skeleton rows */}
      {Array.from({ length: 7 }).map((_, index) => (
        <FoodItemRowSkeleton key={index} index={index} />
      ))}
    </YStack>
  )
}

// Header controls skeleton
const FoodItemsHeaderSkeleton = ({
  showCategorySelect = true,
}: {
  showCategorySelect?: boolean
}) => {
  return (
    <XStack justify="space-between" mb="$3" gap={16} position="relative" overflow="hidden">
      {/* Shimmer overlay effect */}
      <YStack
        position="absolute"
        top={0}
        left={-100}
        right={0}
        bottom={0}
        bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
        animation="lazy"
        animateOnly={['left']}
        style={{
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      />

      <XStack gap={32}>
        {/* Search input skeleton */}
        <YStack
          bg="#F6FAFF"
          borderColor="#E6F0FF"
          borderWidth={1}
          borderRadius={8}
          height={44}
          width={300}
          p={12}
          justify="center"
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}
        >
          <YStack bg="#E0E0E0" borderRadius={4} height={16} width="60%" />
        </YStack>

        {/* Category select skeleton */}
        {showCategorySelect && (
          <YStack
            bg="#F6FAFF"
            borderColor="#E6F0FF"
            borderWidth={1}
            borderRadius={8}
            height={44}
            width={300}
            p={12}
            justify="center"
            animation="lazy"
            animateOnly={['backgroundColor']}
            style={{
              animationDuration: '1.5s',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              animationDelay: '0.2s',
              animationTimingFunction: 'ease-in-out',
            }}
          >
            <YStack bg="#E0E0E0" borderRadius={4} height={16} width="70%" />
          </YStack>
        )}
      </XStack>

      {/* Add button skeleton */}
      <YStack
        bg="#E8F2FF"
        borderRadius={8}
        height={44}
        width={180}
        p={12}
        justify="center"
        items="center"
        animation="lazy"
        animateOnly={['backgroundColor']}
        style={{
          animationDuration: '1.5s',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationDelay: '0.4s',
          animationTimingFunction: 'ease-in-out',
        }}
      >
        <YStack bg="#C0C0C0" borderRadius={4} height={16} width={120} />
      </YStack>
    </XStack>
  )
}

// Pagination skeleton
const PaginationSkeleton = () => {
  return (
    <XStack
      justify="flex-end"
      items={'center'}
      mt="$4"
      gap="$3"
      position="relative"
      overflow="hidden"
    >
      {/* Shimmer overlay effect */}
      <YStack
        position="absolute"
        top={0}
        left={-100}
        right={0}
        bottom={0}
        bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
        animation="lazy"
        animateOnly={['left']}
        style={{
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      />

      {/* Previous button skeleton */}
      <YStack
        bg="#E8F2FF"
        borderRadius={6}
        width={44}
        height={44}
        animation="lazy"
        animateOnly={['backgroundColor']}
        style={{
          animationDuration: '1.5s',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationTimingFunction: 'ease-in-out',
        }}
      />

      {/* Page text skeleton */}
      <YStack
        bg="#F0F0F0"
        borderRadius={4}
        height={18}
        width={120}
        animation="lazy"
        animateOnly={['backgroundColor']}
        style={{
          animationDuration: '1.5s',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationDelay: '0.2s',
          animationTimingFunction: 'ease-in-out',
        }}
      />

      {/* Next button skeleton */}
      <YStack
        bg="#E8F2FF"
        borderRadius={6}
        width={44}
        height={44}
        animation="lazy"
        animateOnly={['backgroundColor']}
        style={{
          animationDuration: '1.5s',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
          animationDelay: '0.4s',
          animationTimingFunction: 'ease-in-out',
        }}
      />
    </XStack>
  )
}

// Main food items skeleton component
export const FoodItemsSkeleton = ({
  showCategorySelect = true,
}: {
  showCategorySelect?: boolean
}) => {
  return (
    <YStack space="$5" p="$4">
      {/* Title skeleton */}
      <YStack position="relative" overflow="hidden">
        <YStack
          position="absolute"
          top={0}
          left={-100}
          right={0}
          bottom={0}
          bg="linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
          animation="lazy"
          animateOnly={['left']}
          style={{
            animationDuration: '2s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out',
          }}
        />
        <YStack
          bg="#F0F0F0"
          borderRadius={8}
          height={28}
          width={200}
          animation="lazy"
          animateOnly={['backgroundColor']}
          style={{
            animationDuration: '1.5s',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            animationTimingFunction: 'ease-in-out',
          }}
        />
      </YStack>

      {/* Header controls skeleton */}
      <FoodItemsHeaderSkeleton showCategorySelect={showCategorySelect} />

      {/* Table skeleton */}
      <FoodItemsTableSkeleton />

      {/* Pagination skeleton */}
      <PaginationSkeleton />
    </YStack>
  )
}
