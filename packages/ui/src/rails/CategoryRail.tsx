import { XStack, ScrollView } from 'tamagui'
import { CategoryCard } from '../cards/CategoryCard'
import { useState } from 'react'

// Sample categories data
const categories = [
  {
    id: 1,
    name: 'Appetizers',
    imageUrl: 'https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwZXRpemVyc3xlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    id: 2,
    name: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFpbiUyMGNvdXJzZXxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    id: 3,
    name: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGVzc2VydHN8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: 4,
    name: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmV2ZXJhZ2VzfGVufDB8fDB8fHww'
  },
  {
    id: 5,
    name: 'Salads',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2FsYWRzfGVufDB8fDB8fHww'
  },
  {
    id: 6,
    name: 'Soups',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c291cHN8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: 7,
    name: 'Pasta',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8cGFzdGF8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: 8,
    name: 'Seafood',
    imageUrl: 'https://images.unsplash.com/photo-1579631542720-3a87824fff86?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8c2VhZm9vZHxlbnwwfHwwfHx8MA%3D%3D'
  },
  {
    id: 9,
    name: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGl6emF8ZW58MHx8MHx8fDA%3D'
  },
  {
    id: 10,
    name: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YnJlYWtmYXN0fGVufDB8fDB8fHww'
  }
];

export function CategoryRail() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const handleCardPress = (id: number) => {
    setSelectedId(selectedId === id ? null : id);
    console.log('Card pressed:', id);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      bounces={false}
      style={{ height:250, minHeight:250 }}
    >
      <XStack gap="$3" style={{paddingLeft: 20, paddingTop: 20, paddingBottom: 20}}>
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            imageUrl={category.imageUrl}
            name={category.name}
            selected={selectedId === category.id}
            onPress={() => handleCardPress(category.id)}
          />
        ))}
      </XStack>
    </ScrollView>
  )
}
