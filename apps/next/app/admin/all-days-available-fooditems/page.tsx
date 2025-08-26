'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  YStack,
  XStack,
  Text,
  Input,
  Button,
  Card,
  ScrollView,
  Separator,
  SizableText,
  Image,
  Accordion,
  Circle,
  Spinner,
  Select,
} from 'tamagui'
import { Plus, ChevronDown, Search, Calendar, Save, X, Trash2 } from '@tamagui/lucide-icons'
import {
  apiGetCategory,
  apiGetFoodItems,
} from 'app/services/FoodService'
import {
  apiGetAllDaysAvailable,
  apiUpdateAllDaysAvailable,
} from 'app/services/AllDaysAvailableService'
import { useToast } from '@my/ui/src/useToast'
import type { IResponse, IListResponse } from 'app/types/common'
import type { IFoodCategory } from 'app/types/category'
import type { IFoodItem } from 'app/types/foodItem'

// Custom Badge component
function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <XStack bg={bg as any} px="$2" py="$1" style={{ borderRadius: 8 }} items="center">
      <Text fontSize={12} fontWeight="600" color={color as any}>
        {children}
      </Text>
    </XStack>
  )
}

interface FoodCategory {
  _id: string
  name: string
  url?: string
}

interface FoodItemCategoryRef {
  _id: string
  name: string
}

interface FoodItem {
  _id: string
  name: string
  veg: boolean
  available: boolean
  category: FoodItemCategoryRef[] | string[]
  url?: string
  price?: number
  description?: string
}

interface AllDaysAvailableData {
  _id?: string
  foodItems: Array<{
    category: {
      _id: string
      name: string
      url?: string
    }
    foodItems: Array<{
      _id: string
      name: string
      price: number
      description: string
      url?: string
      veg: boolean
      available: boolean
    }>
  }>
}

export default function AllDaysAvailableFoodItemsPage() {
  const { showMessage } = useToast()
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [allItems, setAllItems] = useState<FoodItem[]>([])
  const [allDaysAvailable, setAllDaysAvailable] = useState<AllDaysAvailableData>({
    foodItems: []
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  const totalSelectedItems = useMemo(() => {
    return allDaysAvailable.foodItems.reduce((total, categoryData) => 
      total + categoryData.foodItems.length, 0
    )
  }, [allDaysAvailable])

  useEffect(() => {
    async function init() {
      setLoading(true)
      setError('')
      try {
        const [catRes, itemsRes, allDaysRes] = await Promise.all([
          apiGetCategory<IResponse<IListResponse<IFoodCategory>>>(),
          apiGetFoodItems<IResponse<IListResponse<IFoodItem>>>({
            search: '',
            category: 'all',
            page: 1,
            limit: 10000,
          }),
          apiGetAllDaysAvailable<IResponse<AllDaysAvailableData>>(),
        ])

        const fetchedCategories = (catRes?.data?.items ?? []).filter(
          (cat: any) => cat.name != 'Plan Weekly Meal' && cat.name != 'Day Special'
        )
        setCategories(fetchedCategories)
        const fetchedItems = itemsRes?.data?.items ?? []
        setAllItems(fetchedItems)

        const allDaysData = allDaysRes?.data
        if (allDaysData) {
          setAllDaysAvailable(allDaysData)
        }
      } catch (err) {
        setError('Failed to load all days available food items data')
        showMessage('Failed to load all days available food items data', 'error')
        console.error('Error loading all days available food items:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  async function handleSave() {
    try {
      setSaving(true)
      setError('')

      await apiUpdateAllDaysAvailable<IResponse<AllDaysAvailableData>,unknown>({
        foodItems: allDaysAvailable.foodItems
      })

      setSaveSuccess(true)
      showMessage('All days available food items saved successfully', 'success')
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      setError('Failed to save all days available food items')
      showMessage('Failed to save all days available food items', 'error')
      console.error('Error saving all days available food items:', err)
    } finally {
      setSaving(false)
    }
  }

  function addItemToCategory(categoryId: string, item: FoodItem) {
    setAllDaysAvailable(prev => {
      const existingCategoryIndex = prev.foodItems.findIndex(
        cat => cat.category._id === categoryId
      )

      if (existingCategoryIndex >= 0) {
        // Category exists, add item if not already present
        const category = prev.foodItems[existingCategoryIndex]
        const itemExists = category.foodItems.some(fi => fi._id === item._id)
        
        if (!itemExists) {
          const updatedCategory = {
            ...category,
            foodItems: [...category.foodItems, {
              _id: item._id,
              name: item.name,
              price: item.price || 0,
              description: item.description || '',
              url: item.url || '',
              veg: item.veg,
              available: item.available
            }]
          }
          
          const updatedFoodItems = [...prev.foodItems]
          updatedFoodItems[existingCategoryIndex] = updatedCategory
          
          return {
            ...prev,
            foodItems: updatedFoodItems
          }
        }
      } else {
        // Category doesn't exist, create new category with item
        const category = categories.find(cat => cat._id === categoryId)
        if (category) {
          const newCategoryData = {
            category: {
              _id: category._id,
              name: category.name,
              url: category.url || ''
            },
            foodItems: [{
              _id: item._id,
              name: item.name,
              price: item.price || 0,
              description: item.description || '',
              url: item.url || '',
              veg: item.veg,
              available: item.available
            }]
          }
          
          return {
            ...prev,
            foodItems: [...prev.foodItems, newCategoryData]
          }
        }
      }
      
      return prev
    })
  }

  function removeItemFromCategory(categoryId: string, itemId: string) {
    setAllDaysAvailable(prev => {
      const categoryIndex = prev.foodItems.findIndex(
        cat => cat.category._id === categoryId
      )
      
      if (categoryIndex >= 0) {
        const category = prev.foodItems[categoryIndex]
        const updatedFoodItems = category.foodItems.filter(fi => fi._id !== itemId)
        
        if (updatedFoodItems.length === 0) {
          // Remove entire category if no items left
          return {
            ...prev,
            foodItems: prev.foodItems.filter((_, index) => index !== categoryIndex)
          }
        } else {
          // Update category with remaining items
          const updatedCategory = {
            ...category,
            foodItems: updatedFoodItems
          }
          
          const updatedFoodItemsArray = [...prev.foodItems]
          updatedFoodItemsArray[categoryIndex] = updatedCategory
          
          return {
            ...prev,
            foodItems: updatedFoodItemsArray
          }
        }
      }
      
      return prev
    })
  }

  if (loading) {
    return (
      <YStack items="center" justify="center" flex={1} gap="$4">
        <Spinner size="large" color="#3B82F6" />
        <Text color="#6B7280">Loading all days available food items...</Text>
      </YStack>
    )
  }

  if (error && !categories.length) {
    return (
      <YStack items="center" justify="center" flex={1} gap="$4">
        <Text color="#EF4444" fontSize={18} fontWeight="600">
          Error Loading Data
        </Text>
        <Text color="#6B7280" style={{ textAlign: 'center' }}>
          {error}
        </Text>
        <Button onPress={() => window.location.reload()} bg="#3B82F6" color="white">
          Retry
        </Button>
      </YStack>
    )
  }

  return (
    <YStack p="$4" gap="$4">
        {/* Colorful Header */}
        <Card
          bg="#667eea"
          p="$4"
          bordered
          style={{ borderRadius: 12, border: 'none' }}
          shadowColor="#667eea"
          shadowRadius={8}
          shadowOpacity={0.25}
        >
          <XStack justify="space-between" items="center">
            <YStack gap="$1">
              <XStack items="center" gap="$3">
                <Calendar size={24} color="white" />
                <Text fontSize={24} fontWeight="700" color="white">
                  All Days Available Food Items
                </Text>
              </XStack>
              <Text fontSize={14} color="rgba(255,255,255,0.8)">
                Manage food items available for all days
              </Text>
            </YStack>
            <Button
              size="$3"
              color="white"
              bg={saveSuccess ? '#10B981' : ('rgba(255,255,255,0.2)' as any)}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.3)"
              hoverStyle={{ bg: saveSuccess ? '#059669' : 'rgba(255,255,255,0.3)' }}
              onPress={handleSave}
              disabled={saving}
              icon={saving ? Spinner : Save}
              style={{ borderRadius: 8 }}
            >
              {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Changes'}
            </Button>
          </XStack>
        </Card>

        {/* Error Message */}
        {error && (
          <Card
            bg="#FEF2F2"
            p="$3"
            borderColor="#EF4444"
            borderWidth={1}
            style={{ borderRadius: 8 }}
          >
            <Text color="#EF4444" fontSize={14}>
              {error}
            </Text>
          </Card>
        )}

        {/* Summary Card */}
        <Card
          bg="#F8FAFC"
          p="$4"
          borderColor="#E2E8F0"
          borderWidth={1}
          style={{ borderRadius: 8 }}
        >
          <XStack justify="space-between" items="center">
            <YStack>
              <Text fontSize={16} fontWeight="600" color="#1E293B">
                Summary
              </Text>
              <Text fontSize={14} color="#64748B">
                {allDaysAvailable.foodItems.length} categories, {totalSelectedItems} items
              </Text>
            </YStack>
            <Badge bg="#3B82F6" color="white">
              {totalSelectedItems} Total Items
            </Badge>
          </XStack>
        </Card>

        {/* Categories Accordion */}
        <Accordion type="multiple" gap="$3">
          {categories.map((category) => {
            const categoryData = allDaysAvailable.foodItems.find(
              cat => cat.category._id === category._id
            )
            const itemCount = categoryData?.foodItems.length || 0
            
            return (
              <Accordion.Item value={category._id} key={category._id}>
                <Accordion.Trigger
                  bg="#F8FAFC"
                  px="$4"
                  py="$3"
                  justify="space-between"
                  items="center"
                  style={{ borderRadius: 8, borderColor: '#E2E8F0', borderWidth: 1 }}
                  hoverStyle={{ bg: '#F1F5F9' }}
                >
                  <XStack items="center" justify="space-between" flex={1}>
                    <XStack items="center" gap="$3">
                      <Image
                        source={{ uri: category.url || 'https://via.placeholder.com/40' }}
                        width={32}
                        height={32}
                        style={{ borderRadius: 6, objectFit: 'cover' }}
                      />
                      <YStack>
                        <Text fontSize={16} fontWeight="600" color="#1E293B">
                          {category.name}
                        </Text>
                        <Text fontSize={12} color="#64748B">
                          {itemCount} item{itemCount !== 1 ? 's' : ''} selected
                        </Text>
                      </YStack>
                    </XStack>
                    <ChevronDown size={20} color="#64748B" />
                  </XStack>
                </Accordion.Trigger>
                <Accordion.Content>
                  <Card
                    p="$4"
                    bg="white"
                    style={{ borderRadius: '0 0 8px 8px', borderColor: '#E2E8F0' }}
                    borderWidth={1}
                    borderTopWidth={0}
                  >
                    <CategoryFoodItemsManager
                      category={category}
                      categoryData={categoryData}
                      allItems={allItems}
                      onAddItem={(item) => addItemToCategory(category._id, item)}
                      onRemoveItem={(itemId) => removeItemFromCategory(category._id, itemId)}
                    />
                  </Card>
                </Accordion.Content>
              </Accordion.Item>
            )
          })}
        </Accordion>
      </YStack>
  )
}

function CategoryFoodItemsManager({
  category,
  categoryData,
  allItems,
  onAddItem,
  onRemoveItem,
}: {
  category: FoodCategory
  categoryData?: AllDaysAvailableData['foodItems'][0]
  allItems: FoodItem[]
  onAddItem: (item: FoodItem) => void
  onRemoveItem: (itemId: string) => void
}) {
  const [selectedItemId, setSelectedItemId] = useState('')

  // Filter items for this category
  const categoryItems = useMemo(() => {
    return allItems.filter((item) => {
      const categories = (item.category as any[]).map((c: any) =>
        typeof c === 'string' ? c : c?._id
      )
      return categories.includes(category._id) && item.available
    })
  }, [allItems, category._id])

  // Get selected items for this category
  const selectedItems = categoryData?.foodItems || []

  // Get available items (not yet selected)
  const availableItems = categoryItems.filter(
    item => !selectedItems.some(selected => selected._id === item._id)
  )

  const handleAddItem = () => {
    if (selectedItemId) {
      const item = categoryItems.find(item => item._id === selectedItemId)
      if (item) {
        onAddItem(item)
        setSelectedItemId('')
      }
    }
  }

  return (
    <YStack gap="$4">
      {/* Add Item Section */}
      <YStack gap="$3" p="$3" bg="#F8FAFC" style={{ borderRadius: 8 }}>
        <Text fontSize={14} fontWeight="600" color="#1E293B">
          Add Food Item
        </Text>
                 <XStack gap="$2" items="center" flex={1}>
           <Select
             value={selectedItemId}
             onValueChange={setSelectedItemId}
           >
             <Select.Trigger bg="white" borderColor="#E2E8F0" borderWidth={1} flex={1}>
               <Select.Value placeholder={`Select ${category.name.toLowerCase()}...`} />
             </Select.Trigger>
             <Select.Content>
               <Select.ScrollUpButton />
               <Select.Viewport>
                 <Select.Group>
                   {availableItems.map((item, index) => (
                     <Select.Item key={item._id} value={item._id} index={index}>
                       <Select.ItemText>{item.name}</Select.ItemText>
                     </Select.Item>
                   ))}
                 </Select.Group>
               </Select.Viewport>
               <Select.ScrollDownButton />
             </Select.Content>
           </Select>
          <Button
            size="$3"
            icon={Plus}
            bg="#3B82F6"
            color="white"
            onPress={handleAddItem}
            disabled={!selectedItemId}
            style={{ borderRadius: 6 }}
          >
            Add
          </Button>
        </XStack>
      </YStack>

      {/* Selected Items */}
      {selectedItems.length > 0 ? (
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color="#1E293B">
            Selected Items ({selectedItems.length})
          </Text>
          {selectedItems.map((item) => (
            <XStack
              key={item._id}
              items="center"
              justify="space-between"
              p="$3"
              bg="white"
              style={{ borderRadius: 8, borderColor: '#E2E8F0', borderWidth: 1 }}
            >
              <XStack items="center" gap="$3" flex={1}>
                <Image
                  source={{
                    uri: item.url || 'https://via.placeholder.com/40',
                  }}
                  width={40}
                  height={40}
                  style={{ borderRadius: 6, objectFit: 'cover' }}
                />
                <YStack flex={1}>
                  <Text fontSize={14} fontWeight="500" color="#1E293B">
                    {item.name}
                  </Text>
                  <XStack items="center" gap="$2">
                    <Circle size={6} bg={item.veg ? '#10B981' : '#EF4444'} />
                    <Text fontSize={12} color="#64748B">
                      {item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                    </Text>
                    <Text fontSize={12} color="#64748B">
                      • ${item.price}
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
              <Button
                size="$2"
                icon={Trash2}
                bg="#FEE2E2"
                color="#DC2626"
                onPress={() => onRemoveItem(item._id)}
                style={{ borderRadius: 4 }}
                hoverStyle={{ bg: '#FECACA' }}
              >
                Remove
              </Button>
            </XStack>
          ))}
        </YStack>
      ) : (
        <YStack
          p="$4"
          bg="white"
          style={{ borderRadius: 8, borderColor: '#E2E8F0', borderWidth: 1, borderStyle: 'dashed' }}
          items="center"
        >
          <Text color="#9CA3AF" fontSize={14} style={{ textAlign: 'center' }}>
            No items selected for this category
          </Text>
        </YStack>
      )}
    </YStack>
  )
}
