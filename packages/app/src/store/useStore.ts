import { create } from 'zustand'
import {
  apiAddFoodItemToCart,
  apiGetCart,
  apiGetCartTotalAmount,
  apiUpdateCartItemQuantity,
  apiGetCartReccomendations,
} from 'app/services/CartService'
import { apiGetCategory, apiGetFoodItemsByCategory } from 'app/services/FoodService'
import { ICartItem, ICart } from 'app/types/cart'
import { IFoodItem } from 'app/types/foodItem'
import { IListResponse, IResponse } from 'app/types/common'
import { IFoodCategory } from 'app/types/category'
import { apiGetFoodItems } from 'app/services/FoodService'

type CartState = {
  count: number
  cart: ICart
  cartLoading: boolean
  cartTotalAmount: number
  cartRecommendations: IListResponse<IFoodItem>
}

type CartActions = {
  increment: () => void
  decrement: () => void
  reset: () => void
  fetchCart: () => Promise<void>
  addToCart: (item:any) => Promise<void>
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
}

type FoodState = {
  foodItemsByCategory: any[]
  foodItemsLoading: boolean
}

type FoodActions = {
  fetchFoodItemsByCategory: (search?: string, vegOnly?: boolean) => Promise<void>
}

export const useStore = create<CartState & CartActions>((set, get) => ({
  count: 0,
  cart: {} as ICart,
  cartLoading: false,
  cartTotalAmount: 0,
  cartRecommendations: {} as IListResponse<IFoodItem>,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  foodItemsByCategory: [],
  foodItemsLoading: false,
  reset: () => set({ count: 0 }),
  categories: null,
  categoriesLoading: false,
  foodItems: [],
  foodItemsByCategoryLoading: false,
  fetchCart: async () => {
    set({ cartLoading: true })
    try {
      const res = await apiGetCart<IResponse<ICart>>()
      const totalAmount = res.data.days.reduce((total, day) =>
    total + day.items.reduce((dayTotal, item) => dayTotal + (item.food.price * item.quantity), 0), 0
  )
      set({ cart: res.data, cartTotalAmount: Number(totalAmount.toFixed(2)) })
    } catch (e) {
      // Optionally handle error
    } finally {
      set({ cartLoading: false })
    }
  },
  addToCart: async (item) => {
    console.log(item)
    set({ cartLoading: true })
    try {
      const data =await apiAddFoodItemToCart(item)
      console.log(data)
      await get().fetchCart()
      await get().fetchFoodItemsByCategory()
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
      const res = await apiGetCartReccomendations<IResponse<any[]>>({ page, limit })
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
      const res = await apiGetFoodItemsByCategory<IResponse<IListResponse<IFoodItem & { days: ICartItem[] }>>>({
        search,
        vegOnly,
      })
      set({ foodItemsByCategory: res.data.items ?? [] })
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
}))

