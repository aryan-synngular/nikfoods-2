import { Text, YStack, XStack, ScrollView } from "tamagui";
import { useState } from "react";
import { FoodCard } from "../cards/FoodCard";

// Sample food data
const foodItems = [
  {
    id: 1,
    name: "Aloo Chaat",
    price: 72.29,
    imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    name: "Dahi Bhalla",
    price: 7.29,
    imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?q=80&w=2074&auto=format&fit=crop"
  },
  {
    id: 3,
    name: "Paneer Tikka",
    price: 12.99,
    imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=2017&auto=format&fit=crop"
  },
  {
    id: 4,
    name: "Butter Chicken",
    price: 15.49,
    imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 5,
    name: "Masala Dosa",
    price: 9.99,
    imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=2070&auto=format&fit=crop"
  },
];

export function FoodListingRail({displayLabel}: {displayLabel: string}) {
  const [quantities, setQuantities] = useState<{[key: number]: number}>({}); 
  
  const handleAdd = (id: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: 1
    }));
  };
  
  const handleIncrement = (id: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };
  
  const handleDecrement = (id: number) => {
    setQuantities(prev => {
      const newQuantities = { ...prev };
      if (newQuantities[id] <= 1) {
        delete newQuantities[id];
      } else {
        newQuantities[id] -= 1;
      }
      return newQuantities;
    });
  };
  
  return (
    <YStack style={{paddingTop: 20, paddingBottom: 20}}>
      <Text fontSize={28} fontWeight="600" style={{paddingLeft: 20, marginBottom: 16}}>
        {displayLabel}
      </Text>
      
      <YStack style={{paddingHorizontal: 20, paddingBottom: 20}}>
        <XStack flexWrap="wrap" gap="$4" style={{justifyContent: 'flex-start'}}>
          {foodItems.map((item) => (
            <YStack key={item.id} style={{marginBottom: 16}}>
              <FoodCard
                imageUrl={item.imageUrl}
                name={item.name}
                price={item.price}
                quantity={quantities[item.id] || 0}
                onAdd={() => handleAdd(item.id)}
                onIncrement={() => handleIncrement(item.id)}
                onDecrement={() => handleDecrement(item.id)}
              />
            </YStack>
          ))}
        </XStack>
      </YStack>
    </YStack>
  );
}