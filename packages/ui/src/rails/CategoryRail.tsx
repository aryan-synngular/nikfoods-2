import { XStack } from 'tamagui'
import { CategoryCard } from '../cards/CategoryCard'
import { useState } from 'react'

export function CategoryRail() {
  const [selected, setSelected] = useState(false)
  const handleCardPress = () => {
    setSelected(!selected)
    console.log('Card pressed')
  }

  return (
    <XStack
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 16,
        overflowX: 'scroll',
        padding: 16,
      }}
    >
      <CategoryCard
        imageUrl="https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwZXRpemVyc3xlbnwwfHwwfHx8MA%3D%3D"
        name="Appetizers"
        selected={selected}
        onPress={() => handleCardPress()}
      />
    </XStack>
  )
}
