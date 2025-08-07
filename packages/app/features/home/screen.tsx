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
} from '@my/ui'

import { useEffect, useState } from 'react'
import { Platform, ScrollView, StatusBar } from 'react-native'
import { useLink } from 'solito/navigation'
import { CategoryShimmerLoader, FoodListShimmerLoader } from '@my/ui'
import { apiGetCategory, apiGetFoodItemsByCategory } from 'app/services/FoodService'
import { IListResponse, IResponse } from 'app/types/common'
import { IFoodCategory } from 'app/types/category'
import { IFoodItem } from 'app/types/foodItem'
import { useAuth } from 'app/provider/auth-context'
import { useToast } from '@my/ui/src/useToast'

export function HomeScreen({ pagesMode = false }: { pagesMode?: boolean }) {
  const { showMessage } = useToast()
  const { loginSuccess, clearLoginSuccess } = useAuth()
  const linkTarget = pagesMode ? '/pages-example-user' : '/user'
  const linkProps = useLink({
    href: `${linkTarget}/nate`,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [vegOnly, setVegOnly] = useState(false)
  const [categories, setCategories] = useState<IListResponse<IFoodCategory> | null>(null)
  const [foodItemsByCategory, setFoodItemsByCategory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Toast after Successful login
  useEffect(() => {
    if (loginSuccess) {
      showMessage('Welcome back! Login Successful.', 'success')
      clearLoginSuccess()
    }
  }, [loginSuccess, clearLoginSuccess, showMessage])

  useEffect(() => {
    setLoading(true)

    Promise.all([
      apiGetCategory<IResponse<IListResponse<IFoodCategory>>>(),
      apiGetFoodItemsByCategory<IResponse<IListResponse<IFoodItem>>>(),
    ])
      .then(([catRes, foodRes]) => {
        console.log('Cat Items:', catRes.data)
        console.log('Food Items By Category:', foodRes.data)

        // Dummy categories fallback
        const dummyCategories: IListResponse<IFoodCategory> = {
          items: [
            {
              _id: '687df76422289651c03f6697',
              name: 'Category 4 ',
              description: 'fnwef',
              url: 'https://res.cloudinary.com/dz30kdodd/image/upload/v1753085861/nikfoods/xjeuqod1jx1yplarilzf.png',
              createdAt: '2025-07-21T08:16:36.712Z',
              updatedAt: '2025-07-21T08:17:42.417Z',
            },
            {
              _id: '687df71422289651c03f668f',
              name: 'Category 4',
              description: '43',
              url: 'https://res.cloudinary.com/dz30kdodd/image/upload/v1753085742/nikfoods/qxllzs0zorjhug3qy01t.png',
              createdAt: '2025-07-21T08:15:16.201Z',
              updatedAt: '2025-07-21T08:15:45.544Z',
            },
            {
              _id: '687de83622289651c03f6655',
              name: 'categor3',
              description: 'sfsfsdf sd fsd fs dfs df',
              url: 'https://res.cloudinary.com/dz30kdodd/image/upload/v1753085619/nikfoods/hfgy7a5u2n49hnh70ufn.png',
              createdAt: '2025-07-21T07:11:50.021Z',
              updatedAt: '2025-07-30T13:07:41.085Z',
            },
          ],
          page: 0,
          total: 0,
          pageSize: 0,
        }

        // Dummy foodItems by category fallback
        const dummyFoodItemsByCategory: any[] = [
          {
            _id: '687df76422289651c03f6697',
            name: 'Category 4 ',
            description: 'fnwef',
            url: 'https://res.cloudinary.com/dz30kdodd/image/upload/v1753085861/nikfoods/xjeuqod1jx1yplarilzf.png',
            createdAt: '2025-07-21T08:16:36.712Z',
            updatedAt: '2025-07-21T08:17:42.417Z',
            foodItems: [
              {
                _id: '688af6075e39c47f4d258446',
                name: 'Paneer Wrap',
                description: 'Spicy paneer wrap with veggies',
                price: 150,
                veg: true,
                available: true,
                public_id: '',
                url: '',
                category: [dummyCategories.items[0]],
                createdAt: '2025-07-31T04:50:15.513Z',
                updatedAt: '2025-07-31T04:50:15.513Z',
              },
              {
                _id: '688af6075e39c47f4d28446',
                name: 'Paneer Wrap 2',
                description: 'Spicy paneer wrap with veggies',
                price: 150,
                veg: true,
                available: true,
                public_id: '',
                url: '',
                category: [dummyCategories.items[0]],
                createdAt: '2025-07-31T04:50:15.513Z',
                updatedAt: '2025-07-31T04:50:15.513Z',
              },
            ],
          },
          {
            _id: '687de83622289651c03f6655',
            name: 'categor3',
            description: 'sfsfsdf sd fsd fs dfs df',
            url: 'https://res.cloudinary.com/dz30kdodd/image/upload/v1753085619/nikfoods/hfgy7a5u2n49hnh70ufn.png',
            createdAt: '2025-07-21T07:11:50.021Z',
            updatedAt: '2025-07-30T13:07:41.085Z',
            foodItems: [
              {
                _id: '6881dfd3e2950f3c1d186c32',
                name: 'Ice Cream',
                description: 'Classic vanilla scoop with toppings',
                price: 99,
                veg: true,
                available: true,
                public_id: '',
                url: '',
                category: [dummyCategories.items[2]],
                createdAt: '2025-07-24T07:25:07.182Z',
                updatedAt: '2025-07-30T14:42:42.751Z',
              },
            ],
          },
        ]

        setCategories(catRes?.data ?? dummyCategories)
        setFoodItemsByCategory(foodRes?.data?.items ?? dummyFoodItemsByCategory)
      })
      .catch((err) => {
        console.log('API fetch error, using fallback data:', err)

        // Set fallback data even on error
        const dummyCategories: IListResponse<IFoodCategory> = {
          items: [
            {
              _id: '687df76422289651c03f6697',
              name: 'Category 4 ',
              description: 'fnwef',
              url: 'https://res.cloudinary.com/dz30kdodd/image/upload/v1753085861/nikfoods/xjeuqod1jx1yplarilzf.png',
              createdAt: '2025-07-21T08:16:36.712Z',
              updatedAt: '2025-07-21T08:17:42.417Z',
            },
          ],
          page: 0,
          total: 0,
          pageSize: 0,
        }

        const dummyFoodItemsByCategory: any[] = [
          {
            _id: '687df76422289651c03f6697',
            name: 'Category 4 ',
            description: 'fnwef',
            url: 'https://res.cloudinary.com/dz30kdodd/image/upload/v1753085861/nikfoods/xjeuqod1jx1yplarilzf.png',
            createdAt: '2025-07-21T08:16:36.712Z',
            updatedAt: '2025-07-21T08:17:42.417Z',
            foodItems: [
              {
                _id: '6881dfd3e2950f3c1d186c32',
                name: 'Ice Cream',
                description: 'Classic vanilla scoop with toppings',
                price: 99,
                veg: true,
                available: true,
                public_id: '',
                url: '',
                category: [dummyCategories.items[0]],
                createdAt: '2025-07-24T07:25:07.182Z',
                updatedAt: '2025-07-30T14:42:42.751Z',
              },
            ],
          },
        ]

        setCategories(dummyCategories)
        setFoodItemsByCategory(dummyFoodItemsByCategory)
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

  // Calculate header height based on platform
  const getHeaderHeight = () => {
    if (Platform.OS === 'web') return 60
    // For mobile, account for status bar height
    const statusBarHeight = StatusBar.currentHeight || 24
    return 60 + statusBarHeight
  }

  const headerHeight = getHeaderHeight()

  return (
    <YStack flex={1} bg="$background">
      {/* Fixed AppHeader */}
      <AppHeader />

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
          onVegToggle={handleVegToggle}
          initialQuery={searchQuery}
          initialVegOnly={vegOnly}
        />

        {/* Category List */}
        <YStack px={60} gap={10} mt={20}>
          {loading ? <CategoryShimmerLoader /> : <CategoryRail categories={categories} />}
          <XStack width={'100%'} justify="center" items="center">
            <DateSelectionRail></DateSelectionRail>
          </XStack>
          {/* Food List by Category */}
          {loading ? (
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
                Thursday's Menu
              </Text>
              {foodItemsByCategory.map((category) => (
                <FoodListingRail
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
  )
}
