import { create } from 'zustand'
import {
  apiAddFoodItemToCart,
  apiGetCart,
  apiGetCartTotalAmount,
  apiUpdateCartItemQuantity,
  apiGetCartReccomendations,
} from 'app/services/CartService'
import {
  apiGetCategory,
  apiGetFoodItemsByCategory,
  apiGetWeeklyMenu,
  apiSaveWeeklyMenu,
} from 'app/services/FoodService'
import { ICartItem, ICart } from 'app/types/cart'
import { IFoodItem } from 'app/types/foodItem'
import { IListResponse, IResponse } from 'app/types/common'
import { IFoodCategory } from 'app/types/category'
import { apiGetFoodItems } from 'app/services/FoodService'

type DayKey = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'

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

type CartState = {
  count: number
  cart: ICart
  cartLoading: boolean
  cartTotalAmount: number
  cartRecommendations: IListResponse<IFoodItem>
  weeklyMenu: {}
  weeklyMenuLoading: boolean
  selectedWeekDay: DayKey
  weeklyMenuUnCategorized: {}
}

type CartActions = {
  increment: () => void
  decrement: () => void
  reset: () => void
  fetchCart: (token?: string) => Promise<void>
  addToCart: (item: any) => Promise<void>
  fetchCartTotalAmount: () => Promise<void>
  updateCartItemQuantity: (data: any) => Promise<void>
  fetchCartRecommendations: (page?: number, limit?: number) => Promise<void>
  fetchFoodItemsByCategory: (search?: string, vegOnly?: boolean) => Promise<void>
  foodItemsLoading: boolean
  foodItemsByCategory: any[]
  categories: IListResponse<IFoodCategory> | null
  categoriesLoading: boolean
  fetchCategories: () => Promise<void>
  fetchFoodItems: (params: any) => Promise<void>
  foodItems: IFoodItem[]
  vegOnly: boolean
  successOrderId:string
  handleVegOnlyToggle: (vegOnly: boolean) => void
  setSuccessOrderId:(successOrderId:string)=>void
  fetchWeeklyMenu: () => Promise<void>
  saveWeeklyMenu: (weeklyMenuData: Record<DayKey, string[]>) => Promise<void>
  setSelectedWeekDay: (day: DayKey | 'all-days') => void
}

type FoodState = {
  foodItemsByCategory: any[]
  foodItemsLoading: boolean
}

type FoodActions = {
  fetchFoodItemsByCategory: (search?: string, vegOnly?: boolean) => Promise<void>
}
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const now = new Date()

let dayIndex = now.getDay()

// Check if it's after 1 PM
if (now.getHours() >= 13) {
  dayIndex = (dayIndex + 1) % 7 // Move to tomorrow, wrap around if Sunday
}

const weekDay = days[dayIndex]

export const useStore = create<CartState & CartActions>((set, get) => ({
  count: 0,
  cart: {} as ICart,
  cartLoading: false,
  vegOnly: false,
  cartTotalAmount: 0,
  successOrderId:"",
  cartRecommendations: {} as IListResponse<IFoodItem>,
  weeklyMenu: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  },
  weeklyMenuUnCategorized: {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
  },
  weeklyMenuLoading: false,
  selectedWeekDay: weekDay as DayKey,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  foodItemsByCategory: [],
  foodItemsLoading: false,
  reset: () => set({ count: 0 }),
  categories: null,
  categoriesLoading: false,
  foodItems: [],
  foodItemsByCategoryLoading: false,
  fetchCart: async (tokenArg?: string) => {
    set({ cartLoading: true })
    try {
      const res = await apiGetCart<IResponse<ICart>>(tokenArg)
      const totalAmount = res.data.days.reduce(
        (total, day) =>
          total +
          day.items.reduce((dayTotal, item) => dayTotal + item.food.price * item.quantity, 0),
        0
      )
      set({ cart: res.data, cartTotalAmount: Number(totalAmount.toFixed(2)) })
    } catch (e: any) {
      if (e?.error === 'Invalid token') {
        try {
          const res = await apiGetCart<IResponse<ICart>>()
          const totalAmount = res.data.days.reduce(
            (total, day) =>
              total +
              day.items.reduce((dayTotal, item) => dayTotal + item.food.price * item.quantity, 0),
            0
          )
          set({ cart: res.data, cartTotalAmount: Number(totalAmount.toFixed(2)) })
        } catch (e2) {
          // Optionally handle error
        }
      }
      // Optionally handle error
    } finally {
      set({ cartLoading: false })
    }
  },
  addToCart: async (item) => {
    console.log(item)
    set({ cartLoading: true })
    try {
      const data = await apiAddFoodItemToCart(item)
      console.log(data)
      await get().fetchCart()
      await get().fetchFoodItemsByCategory()

      // Add notification when item is added to cart
      const { addNotification } = require('./useNotificationStore').useNotificationStore.getState()
      addNotification({
        type: 'cart',
        title: 'Item added to cart',
        message: `${item.foodName || 'Food item'} has been added to your cart`,
        priority: 'medium',
        read: false,
        actionType: 'navigate',
        actionUrl: '/cart',
      })
    } catch (e) {
      console.log(e)
      // Optionally handle error
    } finally {
      set({ cartLoading: false })
    }
  },
  fetchCartTotalAmount: async () => {
    set({ cartLoading: true })
    try {
      const res = await apiGetCartTotalAmount<IResponse<{ totalAmount: number }>>()
      set({ cartTotalAmount: res.data.totalAmount })
    } catch (e) {
      // Optionally handle error
    } finally {
      set({ cartLoading: false })
    }
  },
  updateCartItemQuantity: async (data) => {
    set({ cartLoading: true })
    try {
      await apiUpdateCartItemQuantity(data)
      await get().fetchCart()
      await get().fetchFoodItemsByCategory()
    } catch (e) {
      // Optionally handle error
    } finally {
      set({ cartLoading: false })
    }
  },
  fetchCartRecommendations: async (page = 1, limit = 5) => {
    set({ cartLoading: true })
    try {
      const res = await apiGetCartReccomendations<IResponse<IListResponse<IFoodItem>>>({
        page,
        limit,
      })
      set({ cartRecommendations: res.data })
    } catch (e) {
      // Optionally handle error
    } finally {
      set({ cartLoading: false })
    }
  },
  fetchFoodItemsByCategory: async (search = '', vegOnly = false) => {
    set({ foodItemsLoading: true })
    try {
      const res = await apiGetFoodItemsByCategory<
        IResponse<IListResponse<IFoodItem & { days: ICartItem[] }>>
      >({
        search,
        vegOnly,
      })
      console.log(res.data)
      set({ weeklyMenu: res.data.items ?? [] })
      const day = get().selectedWeekDay
      console.log(res.data.items.filter((item) => item?.displayName === day)[0]?.foodItems)
      set({
        foodItemsByCategory: res.data.items.filter((item) => item?.displayName === day)[0]
          ?.foodItems,
      })
    } catch (err) {
      set({ foodItemsByCategory: [] })
    } finally {
      set({ foodItemsLoading: false })
    }
  },

  fetchCategories: async () => {
    set({ categoriesLoading: true })
    try {
      const res = await apiGetCategory<IResponse<IListResponse<IFoodCategory>>>()
      set({ categories: res.data ?? null })
    } catch (err) {
      set({ categories: null })
    } finally {
      set({ categoriesLoading: false })
    }
  },
  fetchFoodItems: async (params) => {
    set({ foodItemsLoading: true })
    try {
      const res = await apiGetFoodItems<IResponse<IListResponse<IFoodItem>>>(params)
      set({ foodItems: res.data?.items ?? [] })
    } catch (err) {
      set({ foodItems: [] })
    } finally {
      set({ foodItemsLoading: false })
    }
  },
  handleVegOnlyToggle: (vegOnly: boolean) => {
    console.log('Toggling vegOnly:', vegOnly)
    set({ vegOnly: vegOnly })
  },
  setSuccessOrderId: (successOrderId: string) => {
    console.log('successOrderId:', successOrderId)
    set({ successOrderId })
  },
  fetchWeeklyMenu: async () => {
    set({ weeklyMenuLoading: true })
    try {
      const res = await apiGetWeeklyMenu<IResponse<WeeklyMenuData>>()
      const menu = res.data
      console.log(menu)
      if (menu) {
        set({ weeklyMenuUnCategorized: menu })
      }
    } catch (err) {
      console.error('Error fetching weekly menu:', err)
      set({
        weeklyMenu: {
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
        },
      })
    } finally {
      set({ weeklyMenuLoading: false })
    }
  },
  saveWeeklyMenu: async (weeklyMenuData: Record<DayKey, string[]>) => {
    set({ weeklyMenuLoading: true })
    try {
      await apiSaveWeeklyMenu<IResponse<WeeklyMenuData>>(weeklyMenuData)
      // set({ weeklyMenu: weeklyMenuData })

      // Add notification when weekly menu is saved
      const { addNotification } = require('./useNotificationStore').useNotificationStore.getState()
      addNotification({
        type: 'system',
        title: 'Weekly menu saved',
        message: 'Weekly menu has been saved successfully',
        priority: 'medium',
        read: false,
        actionType: 'none',
      })
    } catch (err) {
      console.error('Error saving weekly menu:', err)
      throw err
    } finally {
      set({ weeklyMenuLoading: false })
    }
  },
  setSelectedWeekDay: (day: DayKey) => {
    set({ selectedWeekDay: day })
    console.log(get().weeklyMenu.filter((item) => item.displayName === day)[0]?.foodItems)
    set({
      foodItemsByCategory:
        get().weeklyMenu.filter((item) => item.displayName === day)[0]?.foodItems ?? [],
    })
  },
}))
