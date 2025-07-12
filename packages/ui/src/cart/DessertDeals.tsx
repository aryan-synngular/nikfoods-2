"use client"

import { Button, Text, XStack, YStack, Image } from 'tamagui'

interface DessertItem {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
}

interface DessertDealsProps {
  items: DessertItem[]
  onAddItem?: (id: string) => void
  onViewAll?: () => void
}

export function DessertDeals({ items, onAddItem, onViewAll }: DessertDealsProps) {
  return (
    <YStack style={{ padding: 20 }}>
      <XStack style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#2A1A0C' }}>
          Dessert deals- to Grab now!
        </Text>

        {/* <Text 
          onPress={onViewAll}
          style={{ 
            fontSize: 14, 
            color: '#FF9F0D', 
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          View all wednesday dessert items
        </Text> */}
      </XStack>

      <YStack style={{ gap: 12 }}>
        {items.map((item) => (
          <XStack
            key={item.id}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: '#F0F0F0',
              borderRadius: 8,
              backgroundColor: 'white'
            }}
          >
            <YStack
              style={{
                width: 70,
                height: 70,
                borderRadius: 8,
                marginRight: 12,
                backgroundColor: '#F5F5F5',
                overflow: 'hidden'
              }}
            >
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={70}
                height={70}
                resizeMode="cover"
              />
            </YStack>

            <YStack style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#2A1A0C', marginBottom: 4 }}>
                {item.name}
              </Text>

              <Text style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                {item.description}
              </Text>

              <XStack style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#2A1A0C' }}>
                  ${item.price.toFixed(2)}
                </Text>

                <Button
                  onPress={() => onAddItem?.(item.id)}
                  style={{
                    backgroundColor: '#FFB648',
                    borderRadius: 4,
                    height: 32,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '600' }}>
                    Add
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </XStack>
        ))}
      </YStack>
    </YStack>
  )
}
