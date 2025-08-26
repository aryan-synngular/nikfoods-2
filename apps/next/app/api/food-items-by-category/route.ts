import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import FoodCategory from 'models/FoodCategory'
import FoodItem from 'models/FoodItem'
import CartItem from 'models/CartItem'
import WeeklyMenu from 'models/WeeklyMenu'
import AllDaysAvailable from 'models/AllDaysAvailable'
import { IFoodCategory } from 'app/types/category'
import { verifyAuth } from 'lib/verifyJwt'

function getStartOfCurrentWeekMonday(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay() // 0 (Sun) - 6 (Sat)
  // We need Monday as start (1). If Sunday (0), go back 6 days; else go back day-1 days
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function filterAvailableWeekDays(weekDays: string[]): string[] {
  const now = new Date()
  const currentDay = now.getDay() // 0 (Sun) - 6 (Sat)
  const currentHour = now.getHours()
  
  // Map day names to day numbers (0-6)
  const dayNameToNumber: Record<string, number> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  }
  
  return weekDays.filter(dayName => {
    const dayNumber = dayNameToNumber[dayName.toLowerCase()]
    if (dayNumber === undefined) return false
    
    // If it's a future day, include it
    if (dayNumber > currentDay) return true
    
    // If it's the current day, only include if before 1 PM
    if (dayNumber === currentDay) return currentHour < 13
    
    // Past days are excluded
    return false
  })
}

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) {
    return authResult
  }
  const { id } = authResult.user
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const vegOnly = searchParams.get('vegOnly') === 'true'
    // const useWeeklyMenu = searchParams.get('weeklyMenu') === 'true'
    const foodItemsQuery = {} as any
    if (search.trim()) {
      foodItemsQuery.$or = [{ name: { $regex: search, $options: 'i' } }]
    }

    if (vegOnly) {
      foodItemsQuery.veg = true
    }
    const categories = await FoodCategory.find().sort({ createdAt: 1 })
    if (true) {
      // Fetch WeeklyMenu logic
      let menu = await WeeklyMenu.findOne({ active: true })
        .populate({
          path: 'monday',
          match: foodItemsQuery,
        })
        .populate({
          path: 'tuesday',
          match: foodItemsQuery,
        })
        .populate({
          path: 'wednesday',
          match: foodItemsQuery,
        })
        .populate({
          path: 'thursday',
          match: foodItemsQuery,
        })
        .populate({
          path: 'friday',
          match: foodItemsQuery,
        })
        .populate({
          path: 'saturday',
          match: foodItemsQuery,
        })

      if (!menu) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
      }

      // Days of the week
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

      // Build availability map for each FoodItem across the week's menu
      const availableDaysByFoodId = daysOfWeek.reduce(
        (acc, dayName) => {
          const dayItems = (menu as any)[dayName] || []
          for (const fi of dayItems) {
            const key = fi?._id?.toString?.() ?? String(fi)
            if (!acc[key]) acc[key] = []
            acc[key].push(dayName)
          }
          return acc
        },
        {} as Record<string, string[]>
      )

      // Fetch All-Days-Available configuration
      const allDaysDoc = await AllDaysAvailable.findOne()
      const allDaysIdsByCategory: Record<string, string[]> = {}
      const allDaysIdSet = new Set<string>()
      if (allDaysDoc?.foodItems?.length) {
        for (const entry of allDaysDoc.foodItems as any[]) {
          const catId = entry?.category?._id?.toString?.()
          if (!catId) continue
          const ids = (entry.foodItems || [])
            .map((fi: any) => fi?._id?.toString?.())
            .filter(Boolean)
          allDaysIdsByCategory[catId] = ids as string[]
          ;(ids as string[]).forEach((id) => allDaysIdSet.add(id))
        }
      }

      // Process each day's food items
      const daysWithFoodItems = await Promise.all(
        daysOfWeek.map(async (dayName) => {
          const dayFoodItems = menu[dayName] || []

          // Filter food items based on search and veg filters
          const foodItemsWithCart = await Promise.all(
            dayFoodItems.map(async (item: any) => {
              // Populate 'day' (not 'CartDay') in CartItem
              const cartItems = await CartItem.find({
                user: id,
                food: item._id,
              }).populate('day')

              // Filter logic for today's cart items
              const filteredCartItems = cartItems.filter((cartItem) => {
                if (cartItem.day && cartItem.day.date) {
                  const cartDayDate = new Date(cartItem.day.date)
                  const now = new Date()
                  // Check if cartDayDate is today
                  const isToday =
                    cartDayDate.getFullYear() === now.getFullYear() &&
                    cartDayDate.getMonth() === now.getMonth() &&
                    cartDayDate.getDate() === now.getDate()
                  if (isToday) {
                    // Only include if current time is before 1pm
                    return now.getHours() < 13
                  }
                }
                return true // Include all other cartItems
              })

              return {
                ...item.toObject(),
                days: filteredCartItems.map((cartItem) => cartItem.toObject()),
              }
            })
          )

          // Organize food items by category
          const categoriesWithFoodItems = categories.map((category) => {
            const categoryFoodItems = foodItemsWithCart.filter((foodItem) =>
              foodItem.category.some(
                (cat: IFoodCategory) => cat._id.toString() === category._id.toString()
              )
            )

            // Include all-days items for this category that are not already in weekly list
            const weeklyIds = new Set<string>(
              categoryFoodItems.map((it: any) => it?._id?.toString?.()).filter(Boolean)
            )
            const extraAllDayIds = (allDaysIdsByCategory[category._id.toString()] || []).filter(
              (fid) => !weeklyIds.has(fid)
            )

            const extraDocsPromise = extraAllDayIds.length
              ? FoodItem.find({ _id: { $in: extraAllDayIds } })
              : Promise.resolve([])

            return {
              _id: category._id,
              name: category.name,
              description: category.description,
              url: category.url,
              public_id: category.public_id,
              createdAt: category.createdAt,
              updatedAt: category.updatedAt,
              // Attach a promise so we can resolve after map
              foodItems: Promise.all([extraDocsPromise]).then(async ([extraDocs]: any[]) => {
                const extraWithCart = await Promise.all(
                  (extraDocs as any[]).map(async (item: any) => {
                    const cartItems = await CartItem.find({ user: id, food: item._id }).populate('day')
                    const filteredCartItems = cartItems.filter((cartItem) => {
                      if (cartItem.day && cartItem.day.date) {
                        const cartDayDate = new Date(cartItem.day.date)
                        const now = new Date()
                        const isToday =
                          cartDayDate.getFullYear() === now.getFullYear() &&
                          cartDayDate.getMonth() === now.getMonth() &&
                          cartDayDate.getDate() === now.getDate()
                        if (isToday) {
                          return now.getHours() < 13
                        }
                      }
                      return true
                    })
                    return { ...item.toObject(), days: filteredCartItems.map((ci) => ci.toObject()) }
                  })
                )

                const merged = [...categoryFoodItems, ...extraWithCart]
                // Deduplicate by id (All-days overrides if clash)
                const byId = new Map<string, any>()
                for (const it of merged) {
                  const key = it?._id?.toString?.()
                  if (!key) continue
                  byId.set(key, it)
                }

                return Array.from(byId.values()).map((item: any) => ({
                  _id: item._id,
                  name: item.name,
                  description: item.description,
                  price: item.price,
                  category: item.category,
                  veg: item.veg,
                  available: item.available,
                  public_id: item.public_id,
                  url: item.url,
                  createdAt: item.createdAt,
                  updatedAt: item.updatedAt,
                  days: item.days,
                  availableWeekDays: filterAvailableWeekDays(
                    allDaysIdSet.has(item._id.toString())
                      ? daysOfWeek
                      : availableDaysByFoodId[item._id.toString()] || []
                  ),
                }))
              }),
            }
          })

          // Resolve foodItems promises and filter empty categories
          const categoriesWithResolvedFood = await Promise.all(
            categoriesWithFoodItems.map(async (cat: any) => ({
              ...cat,
              foodItems: await (cat.foodItems as Promise<any[]>),
            }))
          )

          // Filter out categories that have no food items (optional)
          const categoriesWithFood = categoriesWithResolvedFood.filter((category) => category.foodItems.length > 0)
          return {
            day: dayName,
            displayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            foodItems: categoriesWithFood,
          }
        })
      )

      // Filter out days that have no food items (optional)
      const daysWithFood = daysWithFoodItems.filter((day) => day.foodItems.length > 0)

      return NextResponse.json({
        data: {
          items: daysWithFood,
          page: 0,
          total: daysWithFood.length,
          pageSize: 0,
          weekStartDate: menu.weekStartDate,
          type: 'weekly-menu',
        },
        message: 'Weekly menu food items fetched successfully',
      })
    }
  } catch (error) {
    console.error('Error fetching food items by category:', error)
    return NextResponse.json({ error: 'Failed to fetch food items by category' }, { status: 500 })
  }
}
