'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  YStack,
  XStack,
  Input,
  Select,
  Text,
  Switch,
  ScrollView,
  Button,
  Dialog,
  AlertDialog,
  Image,
  Circle,
  Square,
  PortalProvider,
} from 'tamagui'
import { ArrowLeft, ArrowRight, Dot, Pencil, Plus, Trash } from '@tamagui/lucide-icons'
import EditFoodItemForm from './EditFoodItemForm'
import { useSearchParams } from 'next/navigation'
import { ICategory } from 'app/admin/food-category/components/EditFoodCategory'
import Selectable from '@my/ui/src/Selectable'
import { IFoodItem, IFoodItemsResponse } from 'app/types/foodItem'
import { IListResponse, IResponse, ISelectOption } from 'app/types/common'
import { apiGetCategory, apiGetFoodItems } from 'app/services/FoodService'
import { IFoodCategory } from 'app/types/category'
import { FoodItemsSkeleton } from './FoodItemsSkeleton'
import { useToast } from '@my/ui/src/useToast'

export default function FoodItems() {
  const { showMessage } = useToast()
  const searchParams = useSearchParams()
  const categoryFromQuery = searchParams?.get('category')
  const categoryIdFromQuery = searchParams?.get('categoryId')
  console.log(categoryFromQuery)
  console.log(categoryIdFromQuery)
  const [categories, setCategories] = useState<ISelectOption[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categoryIdFromQuery ?? 'all')
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const [editItem, setEditItem] = useState<any>(null)
  const [deleteItemId, setDeleteItemId] = useState<string>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<any>(null)

  const [items, setItems] = useState<IListResponse<IFoodItem>>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 2,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [page, setPage] = useState(1)
  // const [limit, setLimit] = useState(10);
  const limit = 7
  const getFoodItems = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiGetFoodItems<IResponse<IListResponse<IFoodItem>>>({
        category: selectedCategory,
        search,
        page,
        limit,
      })

      setItems(response.data)
    } catch (error) {
      setError('Failed to fetch food items')
      showMessage('Failed to load food items', 'error')
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, page, categoryIdFromQuery])
  const getModifiedCategories = (items: any[]) => {
    return (items || []).map((cat) => ({
      label: cat.name?.trim() ?? '',
      value: cat._id,
    }))
  }
  const getCategories = useCallback(async () => {
    try {
      const response = await apiGetCategory<IResponse<IListResponse<IFoodCategory>>>()
      const newData = getModifiedCategories(response.data.items)
      console.log(newData)
      setCategories(newData)
    } catch (error) {
      setError('Failed to fetch food items')
      showMessage('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    getCategories()
  }, [getCategories])
  useEffect(() => {
    getFoodItems()
  }, [getFoodItems])

  const deleteFoodItem = useCallback(async () => {
    try {
      if (!deleteItemId) return
      setLoading(true)
      const response = await fetch(`/api/food-item?id=${deleteItemId}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      console.log(data)
      await getFoodItems()
      showMessage('Food item deleted successfully', 'success')
    } catch (error) {
      setError('Failed to fetch food items')
      showMessage('Failed to delete food item', 'error')
    } finally {
      setLoading(false)
    }
  }, [deleteItemId])

  // Show category name in header if present
  let headerCategoryName = ''
  if (categoryFromQuery && categoryFromQuery !== '') {
    headerCategoryName = categoryFromQuery
  }
  // If categoryId is present, use categoryFromQuery as the name (or fetch name if needed)
  if (categoryIdFromQuery && categoryFromQuery) {
    headerCategoryName = categoryFromQuery
  }

  // Show skeleton while loading
  if (loading) {
    return <FoodItemsSkeleton showCategorySelect={!categoryIdFromQuery} />
  }

  return (
    <YStack space="$5" p="$4">
      <Text fontWeight="bold" fontSize={20}>
        Food Items{headerCategoryName ? ` - ${headerCategoryName}` : ''}
      </Text>

      <XStack justify="space-between" mb="$3" gap={16}>
        <XStack gap={32}>
          <Input
            placeholder="Search food items..."
            value={search}
            onChangeText={(v) => {
              setSearch(v)
              getFoodItems()
            }}
            borderColor="#4F8CFF"
            bg="#F6FAFF"
          />
          {/* Hide SelectableFoodCategory if categoryId is present */}
          {!categoryIdFromQuery && (
            <Selectable
              selectBoxWidth={300}
              title=""
              placeholder="Select Food Category..."
              value={selectedCategory}
              options={[{ value: 'all', label: 'all' }, ...categories]}
              onValueChange={(category) => {
                console.log(category)
                setSelectedCategory(category)
              }}
            ></Selectable>
          )}
        </XStack>
        <Button
          size="$3"
          color="white"
          hoverStyle={{ bg: '#4F8CFF' }}
          bg={'#4F8CFF'}
          p={12}
          icon={Plus}
          onPress={() => {
            setEditDialogOpen(true)
            setEditItem(null)
          }}
        >
          Add Food Item
        </Button>
      </XStack>
      {/* <ScrollView  horizontal height={"75vh"}  > */}
      <YStack
        minW={1490}
        bg="#fff"
        height={'64vh'}
        style={{
          overflow: 'auto',
          borderRadius: '12px',
        }}
        shadowColor="#4F8CFF22"
        shadowOpacity={0.08}
      >
        {/* Table Header */}
        <XStack
          bg="#E6F0FF"
          p={12}
          justify={'space-between'}
          borderTopLeftRadius={12}
          borderTopRightRadius={12}
        >
          <Text width={80} fontWeight="700" color="#4F8CFF">
            Image
          </Text>
          <Text width={180} fontWeight="700" color="#4F8CFF">
            Name
          </Text>
          <Text width={250} fontWeight="700" color="#4F8CFF">
            Description
          </Text>
          <Text width={90} fontWeight="700" color="#4F8CFF">
            Price (₹)
          </Text>
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Category
          </Text>
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Veg/Non-Veg
          </Text>
          <Text width={120} fontWeight="700" color="#4F8CFF">
            Available
          </Text>
          <Text width={180} fontWeight="700" color="#4F8CFF">
            Actions
          </Text>
        </XStack>
        {/* Table Body */}
        {items?.items?.map((item, idx) => (
          <XStack
            justify={'space-between'}
            key={idx}
            p={12}
            bg={idx % 2 === 0 ? '#F6FAFF' : '#FFF'}
            items="center"
            borderBottomWidth={1}
            borderColor="#F0F0F0"
          >
            <XStack
              style={{
                borderRadius: '40px',
                overflow: 'hidden',
                width: 80,
                height: 80,
              }}
            >
              <Image
                source={{
                  uri: item.url
                    ? item.url
                    : 'https://images.unsplash.com/photo-1527751171053-6ac5ec50000b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBwZXRpemVyc3xlbnwwfHwwfHx8MA%3D%3D',
                }}
                alt="nikfoods logo"
                width={'100%'}
                height={'100%'}
              />
            </XStack>
            <Text width={180} fontWeight="600">
              {item.name}
            </Text>
            <Text width={250} color="#555">
              {item.description}
            </Text>
            <Text width={60} color="#222">
              ₹{item.price}
            </Text>
            <YStack width={150} gap={'$1'}>
              {Array.isArray(item.category) &&
                item.category.map((category) => (
                  <XStack
                    key={category?._id}
                    style={{ borderRadius: '100px' }}
                    bg={'$green4'}
                    p={'$1'}
                    items={'center'}
                    justify={'flex-start'}
                  >
                    <Dot color="$green8"></Dot>
                    <Text color="$green8" fontWeight="700">
                      {category?.name}
                    </Text>
                  </XStack>
                ))}
            </YStack>
            <Text width={120} fontWeight="700" color={item.veg ? '#00B894' : '#FF7675'}>
              {item.veg ? 'Veg' : 'Non-Veg'}
            </Text>

            <Text width={120} color={item.available ? '#5FD068' : '#FF7675'} fontWeight="700">
              {item.available ? 'Available' : 'Unavailable'}
            </Text>
            <XStack width={180} items="center" gap={4}>
              <Button
                size="$2"
                chromeless
                icon={Pencil}
                onPress={() => {
                  setEditItem(item)
                  setEditDialogOpen(true)
                }}
              >
                Edit
              </Button>
              <Button
                size="$2"
                chromeless
                icon={Trash}
                onPress={() => {
                  setDeleteItemId(item?._id)
                  setDeleteDialogOpen(true)
                }}
              >
                Delete
              </Button>
            </XStack>
          </XStack>
        ))}
      </YStack>
      {/* </ScrollView> */}

      {/* Page Navigation */}
      <XStack justify="flex-end" items={'center'} mt="$4" gap="$3">
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowLeft}
          disabled={page === 1 || loading}
          onPress={() => setPage((prev) => Math.max(prev - 1, 1))}
        ></Button>
        <Text fontWeight="700" color="#4F8CFF" items="center">
          Page {page} of {Math.ceil(items?.total / Number(limit))}
        </Text>
        <Button
          size="$3"
          bg="#E6F0FF"
          color="#4F8CFF"
          icon={ArrowRight}
          disabled={page >= Math.ceil(items?.total / Number(limit)) || loading}
          onPress={() => setPage((prev) => prev + 1)}
        ></Button>
      </XStack>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ background: 'rgba(0,0,0,0.3)' }} />
          <Dialog.Content
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              width: 540,
              maxWidth: '90vw',
            }}
          >
            <PortalProvider>
              <EditFoodItemForm
                initialData={{
                  ...editItem,
                  ...(editItem && {
                    category: editItem?.category.map((cat: ICategory) => cat._id),
                  }),
                }}
                categories={categories}
                onSuccess={() => {
                  setEditDialogOpen(false)
                  getFoodItems()
                  showMessage(
                    editItem ? 'Food item updated successfully' : 'Food item created successfully',
                    'success'
                  )
                }}
                onCancel={() => setEditDialogOpen(false)}
              />
            </PortalProvider>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay
            key="overlay"
            animation="quick"
            opacity={0.5}
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
          <AlertDialog.Content
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ y: 10, opacity: 0, scale: 0.95 }}
            style={{
              background: '#FFF4E4',
              borderRadius: 12,
              borderColor: '#FF9F0D33',
              borderWidth: 1,
              padding: 24,
              width: 440,
              maxWidth: '90vw',
              shadowColor: '#FF9F0D44',
              shadowRadius: 10,
              shadowOpacity: 0.2,
            }}
          >
            <AlertDialog.Title fontSize="$6" fontWeight="700" color="#FF9F0D" mb="$2">
              Confirm Deletion
            </AlertDialog.Title>

            <AlertDialog.Description mb="$4" color="#333" fontSize="$4">
              Are you sure you want to delete this food item? This action cannot be undone.
            </AlertDialog.Description>

            <XStack gap="$3" justify="flex-end">
              <AlertDialog.Cancel asChild>
                <Button
                  size="$3"
                  bg="#FFF4E4"
                  borderColor="#FF9F0D"
                  borderWidth={1}
                  color="#FF9F0D"
                  hoverStyle={{
                    bg: '#FF9F0D11',
                    borderColor: '#FF9F0D',
                  }}
                  pressStyle={{
                    bg: '#FF9F0D22',
                  }}
                >
                  Cancel
                </Button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <Button
                  size="$3"
                  bg="#FF9F0D"
                  color="white"
                  hoverStyle={{
                    bg: '#E68F0C',
                  }}
                  pressStyle={{
                    bg: '#D17F0B',
                  }}
                  onPress={() => {
                    setDeleteDialogOpen(false)
                    deleteFoodItem()
                  }}
                >
                  Delete
                </Button>
              </AlertDialog.Action>
            </XStack>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog>
    </YStack>
  )
}
