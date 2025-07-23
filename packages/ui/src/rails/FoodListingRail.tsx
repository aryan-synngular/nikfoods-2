"use client"

import { Text, YStack, XStack, ScrollView } from "tamagui";
import { useCallback, useEffect, useState } from "react";
import { FoodCard } from "../cards/FoodCard";
import { apiGetCategory, apiGetFoodItems } from "app/services/FoodService";
import {apiAddFoodItemToCart} from "app/services/CartService";
import { DeliveryDatePopup } from '../popups/DeliveryDatePopup'

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
  const [foodItems, setFoodItems] = useState<any[]>([]); 
  const [selectedFoodItem, setSelectedFoodItem] = useState({}); 
  
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
  
  const allFoodItems=useCallback(async()=>{
    try {
      const data =await apiGetFoodItems({})
      console.log(data)
      setFoodItems(data?.items)
      
    } catch (error) {
      console.log(error)
    }
      },[])
    
    
      useEffect(()=>{
        allFoodItems()
      },[allFoodItems])


      const [isDatePopupOpen, setIsDatePopupOpen] = useState(false)
  
      const handleAddButtonClick = (item:any) => {
        setSelectedFoodItem(item)
        setIsDatePopupOpen(true)
      }
      const handleDateSelection = (selectedDates: any) => {
        console.log(selectedDates)
        handleAdd(selectedFoodItem?._id)
        try {
          
          const data=  apiAddFoodItemToCart({foodItemId:selectedFoodItem?._id, days:selectedDates,quantity:1})
          console.log(data)
        } catch (error) {
          console.log(error)
        }

      }
  return (
    <YStack style={{paddingTop: 20, paddingBottom: 20}}>
      <Text fontSize={28} fontWeight="600" style={{paddingLeft: 20, marginBottom: 16}}>
        {displayLabel}
      </Text>
      
      <YStack style={{paddingHorizontal: 20, paddingBottom: 20}}>
        <XStack flexWrap="wrap" gap="$4" style={{justifyContent: 'flex-start'}}>
          {foodItems?.map((item) => (
            <YStack key={item._id} style={{marginBottom: 16}}>
              <FoodCard
                imageUrl={item.url}
                name={item.name}
                price={item.price}
                quantity={quantities[item._id] || 0}
                onAdd={() => handleAdd(item._id)}
                onIncrement={() => handleIncrement(item._id)}
                onDecrement={() => handleDecrement(item._id)}
                handleAddButtonClick={()=>handleAddButtonClick(item)}
              />
            </YStack>
          ))}
        </XStack>
      </YStack>
      <DeliveryDatePopup

       item={selectedFoodItem}
        open={isDatePopupOpen}
        onOpenChange={setIsDatePopupOpen}
        onSelect={handleDateSelection}
      />
    </YStack>
  );
}