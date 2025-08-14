'use client'

import {
  AppHeader,
  HeroBanner,
  SearchFood,
  YStack,
  CategoryRail,
  FoodListingRail,
  AppDownloadBanner,
  SubscriptionBanner,
  WhyChooseUs,
  FAQSection,
  AppFooter,
  DateSelectionRail,
  XStack,
  Text,
  useMedia,
  CategoryDialog,
} from '@my/ui'

import { useEffect, useState, useCallback, use } from 'react'
import { Platform, ScrollView, StatusBar } from 'react-native'
import { CategoryShimmerLoader, FoodListShimmerLoader,CartSidebarShimmer } from '@my/ui'
import { IListResponse } from 'app/types/common'
import { IFoodCategory } from 'app/types/category'
import { useAuth } from 'app/provider/auth-context'
import { useToast } from '@my/ui/src/useToast'
import CartSidebar from '@my/ui/src/cart/CartSidebar'
import { useStore } from 'app/src/store/useStore'


export function HomeScreen({ pagesMode = false }: { pagesMode?: boolean }) {
  const media=useMedia()
  const { showMessage } = useToast()
  const { loginSuccess, clearLoginSuccess } = useAuth()
  const {vegOnly}=useStore()
  const [popupOpen, setPopupOpen] = useState(false)
  const [popupCategory, setPopupCategory] = useState<IFoodCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // const [vegOnly, setVegOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchLoading, setSearchLoading] = useState(false)
 const isSmallScreen = Platform.OS !== 'web' || media.maxXs || media.maxSm
  const {
    categories,
    foodItemsByCategory,
    fetchFoodItemsByCategory,
    fetchCategories,
    fetchCart,
    cartTotalAmount,
    selectedWeekDay
  } = useStore()

  console.log(foodItemsByCategory)

  // Toast after Successful login
  useEffect(() => {
    if (loginSuccess) {
      showMessage('Welcome back! Login Successful.', 'success')
      clearLoginSuccess()
    }
  }, [loginSuccess, clearLoginSuccess, showMessage])

  // Initial data load
  useEffect(() => {
    setLoading(true)
 
    Promise.all([
     fetchCategories(), 
      fetchFoodItemsByCategory(),
      fetchCart()
    ])
      .then(([catRes]) => {
        
      })
      .catch((err) => {
        console.log('API fetch error, using fallback data:', err)

   
        // setCategories(dummyCategories)
      })
      .finally(() => setLoading(false))
  }, [fetchFoodItemsByCategory])

  // For search/filter:
  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      setSearchLoading(true)
       fetchFoodItemsByCategory(query, vegOnly).finally(() => setSearchLoading(false))
    },
    [fetchFoodItemsByCategory, vegOnly]
  )


  useEffect(() => {
      setSearchLoading(true)

      fetchFoodItemsByCategory(searchQuery, vegOnly).finally(() => setSearchLoading(false))
    
    },[vegOnly])

  // Calculate header height based on platform
  const getHeaderHeight = () => {
    if (Platform.OS === 'web') return 60
    // For mobile, account for status bar height
    const statusBarHeight = StatusBar.currentHeight || 24
    return 60 + statusBarHeight
  }

  const headerHeight = getHeaderHeight()
const handleCardPress = (category: IFoodCategory) => {
      setPopupCategory(category)
      setPopupOpen(true)
  }
  return (
    <YStack flex={1} bg="$background">
      {/* Fixed AppHeader */}
      <AppHeader />
      
      <XStack flex={1}> 
        {/* Main Content Area */}
        <YStack flex={Platform.OS === 'web' ? 3 : 1}>
          {/* Scrollable content with proper top margin for mobile */}
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={Platform.OS === 'web'}
            style={{
              flex: 1,
              marginTop: Platform.OS === 'web' ? 0 : headerHeight,
            }}
        contentContainerStyle={{
          paddingTop: Platform.OS === 'web' ? 0 : 0, // No additional padding needed since we use marginTop
        }}
        >
        {Platform.OS === 'web' && <HeroBanner />}
        <SearchFood
          onSearch={handleSearch}
          initialQuery={searchQuery}
          />

        {/* Category List */}
        <YStack px={isSmallScreen ? 0 : 60} gap={isSmallScreen?4:10} mt={isSmallScreen?8:20}>
          {loading ? <CategoryShimmerLoader /> : <CategoryRail handleCardPress={handleCardPress} categories={categories} />}
          <XStack width={'100%'}  justify="center" items="center">
            <DateSelectionRail></DateSelectionRail>
          </XStack>
          {/* Food List by Category */}
          {loading || searchLoading ? (
            <FoodListShimmerLoader />
          ) : (
            <YStack>
              <Text
                style={{
                  textTransform: 'uppercase',
                  color: 'grey',
                }}
                fontSize={20}
                fontWeight="600"
                color="black"
                >
                {searchQuery ? `Search Results for "${searchQuery}"` : `${selectedWeekDay}'s Menu`}
              </Text>
              {foodItemsByCategory.map((category) => (
                <FoodListingRail
                listType={"weeklyMenu"}
                key={category._id}
                displayLabel={category.name}
                foodItems={{
                  items: category.foodItems,
                  page: 0,
                  total: category.foodItems.length,
                  pageSize: category.foodItems.length,
                }}
                />
              ))}
            </YStack>
          )}

          <YStack justify="center" items="center">
            <AppDownloadBanner />
          </YStack>
        </YStack>
        <SubscriptionBanner />
        <YStack gap={20} px={60} py={20}>
          <WhyChooseUs />
          <FAQSection />
        </YStack>
            <AppFooter />
          </ScrollView>
        </YStack>
        
        {/* Cart Sidebar - Only show on web */}
        {cartTotalAmount>0&&Platform.OS === 'web'&&media.sm && (
          <YStack  style={{ maxWidth: '250px', minWidth: '150px' }}>
            {loading ? (
              <CartSidebarShimmer />
            ) : (
              <CartSidebar />
            )}
          </YStack>
        )}
      </XStack>
       <CategoryDialog
       popupCategory={popupCategory}
        open={popupOpen}
        onOpenChange={setPopupOpen}
        category={popupCategory}
      />
    </YStack>
  )
}
