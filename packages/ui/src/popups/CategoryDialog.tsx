'use client'
import {
  SearchFood,
  YStack,
  CategoryRail,
  FoodListingRail,
  XStack,
  Text,
  useMedia,
  Dialog,
  Button,
  Sheet,
} from '@my/ui'
import { X } from '@tamagui/lucide-icons'

import { useEffect, useState, useCallback, use } from 'react'
import { Platform, ScrollView, StatusBar } from 'react-native'
import {  FoodListShimmerLoader } from '@my/ui'
import { IFoodCategory } from 'app/types/category'
import { useStore } from 'app/src/store/useStore'
import { set } from 'date-fns'
import { colors } from '@my/ui/src/colors'

interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: IFoodCategory | null
  popupCategory: IFoodCategory | null
}

export function CategoryDialog({ popupCategory, open, onOpenChange, category }: CategoryDialogProps) {
  const media = useMedia()
  const [selectedCategory, setSelectedCategory] = useState<IFoodCategory | null>(null)
  console.log("CategoryDialog rendered with category:", popupCategory)
const {
    categories,
   foodItems,
   fetchFoodItems,
    fetchCategories
  } = useStore()

 
console.log(foodItems)
  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(true)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    setSelectedCategory(popupCategory)
  }, [popupCategory])
  // Fetch food items for the selected categoryId from URL
  useEffect(() => {
    if(!selectedCategory?._id) return
    setLoading(true)
    Promise.all([
      fetchCategories(),
      fetchFoodItems({
        category: selectedCategory?._id ?? "",
        search: searchQuery,
        vegOnly,
      }),
    ])
      .then(([catRes, foodRes]) => {
        // setCategories(catRes?.data)
        // You can set food items to state if you want, or use foodItemsByCategory from store
      })
      .catch((err) => {
        // setCategories(null)
      })
      .finally(() => setLoading(false))
  }, [selectedCategory?._id, searchQuery])

  // For search/filter:
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      setSearchLoading(true)
      fetchFoodItems({search:query, category: selectedCategory?._id??"", vegOnly}).finally(() => setSearchLoading(false))
    },
    [fetchFoodItems, vegOnly]
  )

  const handleVegToggle = useCallback(
    (isVegOnly: boolean) => {
      setVegOnly(isVegOnly)
      setSearchLoading(true)
      fetchFoodItems({search:searchQuery, category: selectedCategory?._id??"", vegOnly: isVegOnly}).finally(() => setSearchLoading(false))
    },
    [fetchFoodItems, searchQuery,vegOnly]
  )

  // Calculate header height based on platform
  const getHeaderHeight = () => {
    if (Platform.OS === 'web') return 60
    // For mobile, account for status bar height
    const statusBarHeight = StatusBar.currentHeight || 24
    return 60 + statusBarHeight
  }

  const headerHeight = getHeaderHeight()


  if(Platform.OS === 'web') {
  return (
     <Dialog modal open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            backgroundColor="rgba(0,0,0,0.5)"
            animation="quick"
            // opacity={1}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <Dialog.Content
            background="white"
            borderRadius={16}
            maxWidth={1000}
            width={media.sm ? '90%' : 1000}
            elevate
            maxHeight={media.sm ? '80vh' : '90vh'}
            padding={28}
            animation="medium"
          >
        <MainContent></MainContent>
          
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}

 return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      dismissOnSnapToBottom
      zIndex={100_000}
    >
      <Sheet.Overlay
        animation="lazy"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
      />
      <Sheet.Handle backgroundColor="#E0E0E0" />
      <Sheet.Frame
        backgroundColor="white"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
        flex={1}
      >
        <ScrollView
          flex={1}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
        <MainContent></MainContent>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
 )
 
 function MainContent(){
   return (
      <XStack flex={1}>
 
             {/* Main Content Area */}
             <YStack flex={ 1}>
                <XStack justify="flex-end" items="center">
                  
                   <Button
                     size="$2"
                     circular
                     icon={<X size={18} />}
                     background="transparent"
                     pressStyle={{ opacity: 0.7 }}
                     onPress={() => onOpenChange(false)}
                   />
                 </XStack>
               {/* Header with category name from URL */}
             
               {/* <ScrollView
                 showsHorizontalScrollIndicator={false}
                 bounces={false}
                 showsVerticalScrollIndicator={Platform.OS === 'web'}
                 style={{
                   flex: 1,
                   marginTop: Platform.OS === 'web' ? 0 : 0,
                 }}
                 contentContainerStyle={{
                   paddingTop: 0,
                 }}
               > */}
 
                 <XStack justify='center' >
                   {/* <Text fontSize={24} borderWidth={1} color={colors.primary as any}  p={4} px={18} style={{borderRadius:8, borderColor:colors.primary}} fontWeight={600} text='center' >
                     {selectedCategory?.name ?? 'Select a Category'}
                   </Text> */}
                 </XStack>
                 <SearchFood
                   isTitleVisible={false}
                   onSearch={handleSearch}
                   onVegToggle={handleVegToggle}
                   initialQuery={searchQuery}
                   initialVegOnly={vegOnly}
                 />
 <CategoryRail handleCardPress={(category: IFoodCategory) => {setSelectedCategory(category)}} selectedId={selectedCategory?._id ?? ""} categories={categories} />
                 {/* Food List by Category */}
                 {loading || searchLoading ? (
                   <FoodListShimmerLoader />
                 ) : (
                   <YStack >
                     
                         <FoodListingRail
                           displayLabel={selectedCategory?.name??"Category"}
                           foodItems={{
                             items: foodItems,
                             page: 0,
                             total: foodItems.length,
                             pageSize: foodItems.length,
                           }}
                         />
                   </YStack>
                 )}
               {/* </ScrollView> */}
             </YStack>
           </XStack>
   )
 }
}