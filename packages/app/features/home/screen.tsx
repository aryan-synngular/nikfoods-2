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
} from '@my/ui'
import { useEffect, useState } from 'react'
import { Platform, ScrollView } from 'react-native'
import { useLink } from 'solito/navigation'
import { CategoryShimmerLoader, FoodListShimmerLoader } from '@my/ui'
import { apiGetCategory, apiGetFoodItems } from 'app/services/FoodService'
import { IListResponse, IResponse } from 'app/types/common'
import { IFoodCategory } from 'app/types/category'
import { IFoodItem } from 'app/types/foodItem'

export function HomeScreen({ pagesMode = false }: { pagesMode?: boolean }) {
  const linkTarget = pagesMode ? '/pages-example-user' : '/user'
  const linkProps = useLink({
    href: `${linkTarget}/nate`,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [categories, setCategories] = useState<IListResponse<IFoodCategory> | null>(null)
  const [foodItems, setFoodItems] = useState<IListResponse<IFoodItem> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiGetCategory<IResponse<IListResponse<IFoodCategory>>>(),
      apiGetFoodItems<IResponse<IListResponse<IFoodItem>>>({}),
    ])
      .then(([catRes, foodRes]) => {
        setCategories(catRes.data)
        setFoodItems(foodRes.data)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => setLoading(false))
  }, [])

  // Handle search and filter actions
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log('Searching for:', query)
    // Here you would typically fetch or filter data based on the query
  }

  const handleVegToggle = (isVegOnly: boolean) => {
    setVegOnly(isVegOnly)
    console.log('Veg only:', isVegOnly)
    // Here you would typically filter data to show only vegetarian items
  }

  return (
    <YStack flex={1} bg="$background">
      {/* Fixed AppHeader */}
      <AppHeader />

      {/* Scrollable content */}
      <ScrollView bounces={false} showsVerticalScrollIndicator={Platform.OS === 'web'}>
        {Platform.OS === 'web' && <HeroBanner />}
        <SearchFood
          onSearch={handleSearch}
          onVegToggle={handleVegToggle}
          initialQuery={searchQuery}
          initialVegOnly={vegOnly}
        />

        {/* Category List */}
        {loading ? <CategoryShimmerLoader /> : <CategoryRail categories={categories} />}
        {/* Food List */}
        {loading ? (
          <FoodListShimmerLoader />
        ) : (
          <FoodListingRail displayLabel="Food" foodItems={foodItems} />
        )}
        <AppDownloadBanner />
        <SubscriptionBanner />
        <WhyChooseUs />
        <FAQSection />
      </ScrollView>

      {/* Footer - outside of ScrollView to be edge-to-edge */}
      <AppFooter />
    </YStack>
  )
}
