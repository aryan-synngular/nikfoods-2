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
} from 'tamagui'
import { Plus, ChevronDown, Search, Calendar, Save, X, Trash2 } from '@tamagui/lucide-icons'
import {
  apiGetCategory,
  apiGetFoodItems,
  apiGetWeeklyMenu,
  apiSaveWeeklyMenu,
} from 'app/services/FoodService'
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
}

interface WeeklyMenuData {
  _id?: string
  monday: string[]
  tuesday: string[]
  wednesday: string[]
  thursday: string[]
  friday: string[]
  saturday: string[]
  weekStartDate?: Date
  active?: boolean
}

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

const DAYS: { key: DayKey; label: string; color: string; bgColor: string }[] = [
  { key: 'monday', label: 'Monday', color: '#DC2626', bgColor: '#FEF2F2' },
  { key: 'tuesday', label: 'Tuesday', color: '#EA580C', bgColor: '#FFF7ED' },
  { key: 'wednesday', label: 'Wednesday', color: '#D97706', bgColor: '#FFFBEB' },
  { key: 'thursday', label: 'Thursday', color: '#059669', bgColor: '#F0FDF4' },
  { key: 'friday', label: 'Friday', color: '#0284C7', bgColor: '#F0F9FF' },
  { key: 'saturday', label: 'Saturday', color: '#7C3AED', bgColor: '#FAF5FF' },
]

export default function WeeklyPlannerPage() {
  const { showMessage } = useToast()
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [allItems, setAllItems] = useState<FoodItem[]>([])
  console.log(allItems)
  const [weeklyMenu, setWeeklyMenu] = useState<Record<DayKey, string[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState('')

  const totalSelectedItems = useMemo(() => {
    return Object.values(weeklyMenu).reduce((total, dayItems) => total + dayItems.length, 0)
  }, [weeklyMenu])

  const getItemCountForDay = (dayKey: DayKey) => {
    return weeklyMenu[dayKey]?.length || 0
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      setError('')
      try {
        const [catRes, itemsRes, menuRes] = await Promise.all([
          apiGetCategory<IResponse<IListResponse<IFoodCategory>>>(),
          apiGetFoodItems<IResponse<IListResponse<IFoodItem>>>({
            search: '',
            category: 'all',
            page: 1,
            limit: 10000,
          }),
          apiGetWeeklyMenu<IResponse<WeeklyMenuData>>(),
        ])

        const fetchedCategories = (catRes?.data?.items ?? []).filter(
          (cat: any) => cat.name != 'Plan Weekly Meal'
        )
        setCategories(fetchedCategories)
        const fetchedItems = itemsRes?.data?.items ?? []
        setAllItems(fetchedItems)

        const menu = menuRes?.data
        if (menu) {
          const next: Record<DayKey, string[]> = {
            monday: (menu.monday ?? []).map((i: any) => (typeof i === 'string' ? i : i._id)),
            tuesday: (menu.tuesday ?? []).map((i: any) => (typeof i === 'string' ? i : i._id)),
            wednesday: (menu.wednesday ?? []).map((i: any) => (typeof i === 'string' ? i : i._id)),
            thursday: (menu.thursday ?? []).map((i: any) => (typeof i === 'string' ? i : i._id)),
            friday: (menu.friday ?? []).map((i: any) => (typeof i === 'string' ? i : i._id)),
            saturday: (menu.saturday ?? []).map((i: any) => (typeof i === 'string' ? i : i._id)),
          }
          setWeeklyMenu(next)
        }
      } catch (err) {
        setError('Failed to load weekly menu data')
        showMessage('Failed to load weekly menu data', 'error')
        console.error('Error loading weekly menu:', err)
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

      await apiSaveWeeklyMenu<IResponse<WeeklyMenuData>>(weeklyMenu)

      setSaveSuccess(true)
      showMessage('Weekly menu saved successfully', 'success')
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      setError('Failed to save weekly menu')
      showMessage('Failed to save weekly menu', 'error')
      console.error('Error saving weekly menu:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <YStack items="center" justify="center" flex={1} gap="$4">
        <Spinner size="large" color="#3B82F6" />
        <Text color="#6B7280">Loading weekly menu...</Text>
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
        bg="#667eea" // Simplified from gradient
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
                Weekly Menu Planner
              </Text>
            </XStack>
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
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Menu'}
          </Button>
        </XStack>
      </Card>

      {/* Error Message */}
      {error && (
        <Card bg="#FEF2F2" p="$3" borderColor="#EF4444" borderWidth={1} style={{ borderRadius: 8 }}>
          <Text color="#EF4444" fontSize={14}>
            {error}
          </Text>
        </Card>
      )}

      {/* Colorful Days Accordion */}
      <Accordion type="multiple" gap="$3">
        {DAYS.map(({ key, label, color, bgColor }) => {
          const itemCount = getItemCountForDay(key)
          return (
            <Accordion.Item value={key} key={key}>
              <Accordion.Trigger
                bg={bgColor as any}
                px="$4"
                py="$3"
                justify="space-between"
                items="center"
                style={{ borderRadius: 8, borderColor: color, borderWidth: 2 }}
                hoverStyle={{ bg: bgColor as any, opacity: 0.8 }}
              >
                <XStack items="center" justify="space-between" flex={1}>
                  <YStack>
                    <Text fontSize={16} fontWeight="600" color={color as any}>
                      {label}
                    </Text>
                    <Text fontSize={12} color="#6B7280">
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </Text>
                  </YStack>

                  <ChevronDown size={20} color={color as any} />
                </XStack>
              </Accordion.Trigger>
              <Accordion.Content>
                <Card
                  p="$4"
                  bg="white"
                  style={{ borderRadius: '0 0 8px 8px', borderColor: color }}
                  borderWidth={2}
                  borderTopWidth={0}
                >
                  <YStack gap="$4">
                    {categories.map((cat) => (
                      <DayCategoryRow
                        key={cat._id}
                        category={cat}
                        dayKey={key}
                        weeklyMenu={weeklyMenu}
                        setWeeklyMenu={setWeeklyMenu}
                        allItems={allItems}
                        dayColor={color}
                      />
                    ))}
                  </YStack>
                </Card>
              </Accordion.Content>
            </Accordion.Item>
          )
        })}
      </Accordion>
    </YStack>
  )
}

function DayCategoryRow({
  category,
  dayKey,
  weeklyMenu,
  setWeeklyMenu,
  allItems,
  dayColor,
}: {
  category: FoodCategory
  dayKey: DayKey
  weeklyMenu: Record<DayKey, string[]>
  setWeeklyMenu: React.Dispatch<React.SetStateAction<Record<DayKey, string[]>>>
  allItems: FoodItem[]
  dayColor: string
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allItems.filter((it) => {
      const categories = (it.category as any[]).map((c: any) =>
        typeof c === 'string' ? c : c?._id
      )
      const inCategory = categories.includes(category._id)
      const nameMatches = q.length === 0 || it.name.toLowerCase().includes(q)
      return inCategory && nameMatches && it.available
    })
  }, [allItems, category._id, query])
  console.log(filteredItems)
  const selectedForDay = useMemo(() => {
    return weeklyMenu[dayKey]
  }, [weeklyMenu, dayKey])

  const selectedForDayThisCategory = useMemo(() => {
    const set = new Set(selectedForDay)
    return filteredItems.filter((fi) => set.has(fi._id))
  }, [filteredItems, selectedForDay])
  console.log(selectedForDayThisCategory)
  function addItem(id: string) {
    setWeeklyMenu((prev) => {
      const existing = new Set(prev[dayKey])
      existing.add(id)
      return { ...prev, [dayKey]: Array.from(existing) }
    })
    setQuery('')
    setOpen(false)
  }

  function removeItem(id: string) {
    setWeeklyMenu((prev) => {
      return { ...prev, [dayKey]: prev[dayKey].filter((x) => x !== id) }
    })
  }

  const categoryImage =
    category.url ||
    'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&auto=format&fit=crop&q=60'

  return (
    <YStack
      gap="$3"
      p="$3"
      bg="#FAFBFC"
      style={{ borderRadius: 8, borderLeft: `2px solid ${dayColor}` }}
    >
      {/* Category Header */}
      <XStack items="center" gap="$3">
        <Image
          source={{ uri: categoryImage }}
          width={36}
          height={36}
          style={{ borderRadius: 8, objectFit: 'cover', border: `2px solid ${dayColor}` }}
        />
        <YStack flex={1}>
          <Text fontSize={14} fontWeight="600" color="#111827">
            {category.name}
          </Text>
          <Text fontSize={12} color="#6B7280">
            {selectedForDayThisCategory.length} selected
          </Text>
        </YStack>
        {selectedForDayThisCategory.length > 0 && (
          <Badge bg={dayColor} color="white">
            {selectedForDayThisCategory.length}
          </Badge>
        )}
      </XStack>

      {/* Search */}
      <XStack gap="$2" items="center">
        <Input
          placeholder={`Search ${category.name.toLowerCase()}...`}
          value={query}
          onChangeText={(t) => {
            setQuery(t)
            setOpen(t.length > 0)
          }}
          borderColor={dayColor as any}
          borderWidth={2}
          bg="white"
          style={{ borderRadius: 6 }}
          fontSize={14}
          flex={1}
          py="$2"
        />
        {query && (
          <Button
            size="$2"
            chromeless
            icon={X}
            onPress={() => {
              setQuery('')
              setOpen(false)
            }}
            color="#6B7280"
            hoverStyle={{ bg: '#F3F4F6' }}
          />
        )}
      </XStack>

      {/* Suggestions Dropdown */}
      {open && query.length > 0 && (
        <Card
          p="$2"
          bg="white"
          style={{ borderRadius: 6, borderTop: `3px solid ${dayColor}` }}
          borderWidth={1}
          borderColor="#E5E7EB"
          shadowColor={dayColor as any}
          shadowRadius={6}
          shadowOpacity={0.15}
        >
          <ScrollView height={200}>
            <YStack gap="$1">
              {filteredItems.slice(0, 8).map((item) => (
                <XStack
                  key={item._id}
                  items="center"
                  justify="space-between"
                  p="$2"
                  hoverStyle={{ bg: '#F8FAFC' }}
                  style={{ borderRadius: 4 }}
                >
                  <XStack items="center" gap="$2" flex={1}>
                    <Image
                      source={{
                        uri: item.url,
                      }}
                      width={32}
                      height={32}
                      style={{ borderRadius: 6, objectFit: 'cover' }}
                    />
                    <YStack flex={1}>
                      <Text fontSize={13} fontWeight="500" color="#111827">
                        {item.name}
                      </Text>
                      <XStack items="center" gap="$1">
                        <Circle size={6} bg={item.veg ? '#10B981' : '#EF4444'} />
                        <Text fontSize={11} color="#6B7280">
                          {item.veg ? 'Veg' : 'Non-Veg'}
                        </Text>
                      </XStack>
                    </YStack>
                  </XStack>
                  <Button
                    size="$2"
                    icon={Plus}
                    bg={dayColor as any}
                    color="white"
                    onPress={() => addItem(item._id)}
                    style={{ borderRadius: 4 }}
                    hoverStyle={{ opacity: 0.8 }}
                  >
                    Add
                  </Button>
                </XStack>
              ))}
              {filteredItems.length === 0 && (
                <Text color="#9CA3AF" py="$3" style={{ textAlign: 'center' }} fontSize={13}>
                  No items found
                </Text>
              )}
            </YStack>
          </ScrollView>
        </Card>
      )}

      {/* Selected Items */}
      {selectedForDayThisCategory.length > 0 && (
        <YStack gap="$2">
          {selectedForDayThisCategory.map((item) => (
            <XStack
              key={item._id}
              items="center"
              justify="space-between"
              p="$2"
              bg="white"
              style={{ borderRadius: 6, borderLeft: `3px solid ${dayColor}` }}
              borderWidth={1}
              borderColor="#E5E7EB"
              shadowColor="#000000"
              shadowRadius={1}
              shadowOpacity={0.05}
            >
              <XStack items="center" gap="$2" flex={1}>
                <Image
                  source={{
                    uri:
                      item.url ||
                      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=300&auto=format&fit=crop&q=60',
                  }}
                  width={36}
                  height={36}
                  style={{ borderRadius: 6, objectFit: 'cover' }}
                />
                <YStack flex={1}>
                  <Text fontSize={13} fontWeight="500" color="#111827">
                    {item.name}
                  </Text>
                  <XStack items="center" gap="$1">
                    <Circle size={6} bg={item.veg ? '#10B981' : '#EF4444'} />
                    <Text fontSize={11} color="#6B7280">
                      {item.veg ? 'Vegetarian' : 'Non-Vegetarian'}
                    </Text>
                  </XStack>
                </YStack>
              </XStack>
              <Button
                size="$2"
                icon={Trash2}
                bg="#FEE2E2"
                color="#DC2626"
                onPress={() => removeItem(item._id)}
                style={{ borderRadius: 4 }}
                hoverStyle={{ bg: '#FECACA' }}
              >
                Remove
              </Button>
            </XStack>
          ))}
        </YStack>
      )}

      {selectedForDayThisCategory.length === 0 && (
        <YStack
          p="$3"
          bg="white"
          style={{ borderRadius: 6, borderLeft: `3px solid ${dayColor}` }}
          borderWidth={1}
          borderColor="#E5E7EB"
          borderStyle="dashed"
        >
          <Text color="#9CA3AF" fontSize={13} style={{ textAlign: 'center' }}>
            No items selected
          </Text>
        </YStack>
      )}
    </YStack>
  )
}
