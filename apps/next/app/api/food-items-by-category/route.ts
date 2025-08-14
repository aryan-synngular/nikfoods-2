import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import FoodCategory from 'models/FoodCategory'
import CartItem from 'models/CartItem'
import WeeklyMenu from 'models/WeeklyMenu'
import { IFoodCategory } from 'app/types/category'
import { verifyAuth } from 'lib/verifyJwt'

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id } = authResult.user

  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const vegOnly = searchParams.get('vegOnly') === 'true'

    const foodItemsQuery: any = {}
    if (search.trim()) {
      foodItemsQuery.$or = [{ name: { $regex: search, $options: 'i' } }]
    }
    if (vegOnly) {
      foodItemsQuery.veg = true
    }

    const categories = await FoodCategory.find().sort({ createdAt: 1 })
    const menu = await WeeklyMenu.findOne({ active: true })
      .populate({ path: 'monday', match: foodItemsQuery })
      .populate({ path: 'tuesday', match: foodItemsQuery })
      .populate({ path: 'wednesday', match: foodItemsQuery })
      .populate({ path: 'thursday', match: foodItemsQuery })
      .populate({ path: 'friday', match: foodItemsQuery })
      .populate({ path: 'saturday', match: foodItemsQuery })

    if (!menu) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
    }

    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const now = new Date()
    const todayIndex = now.getDay() === 0 ? 7 : now.getDay() // Sun=7, Mon=1...

    // ✅ Filter only valid upcoming days
    const validDays = daysOfWeek.filter((dayName, idx) => {
      const dayIndex = idx + 1 // Mon=1 ... Sat=6
      if (dayIndex < todayIndex) return false
      if (dayIndex === todayIndex && now.getHours() >= 13) return false
      return true
    })

    // ✅ Build only valid daysWithFood
    const daysWithFoodItems = await Promise.all(
      validDays.map(async (dayName) => {
        const dayFoodItems = menu[dayName] || []

        // Process each food item
        const foodItemsWithCart = await Promise.all(
          dayFoodItems.map(async (item: any) => {
            const cartItems = await CartItem.find({
              user: id,
              food: item._id,
            }).populate('day')

            // Filter cart items for today’s restriction
            const filteredCartItems = cartItems.filter((cartItem) => {
              if (cartItem.day?.date) {
                const cartDayDate = new Date(cartItem.day.date)
                const isToday =
                  cartDayDate.getFullYear() === now.getFullYear() &&
                  cartDayDate.getMonth() === now.getMonth() &&
                  cartDayDate.getDate() === now.getDate()

                if (isToday) return now.getHours() < 13
              }
              return true
            })

            return {
              ...item.toObject(),
              days: filteredCartItems.map((c) => c.toObject()),
            }
          })
        )

        // Organize by category
        const categoriesWithFoodItems = categories.map((category) => {
          const categoryFoodItems = foodItemsWithCart.filter((foodItem) =>
            foodItem.category.some(
              (cat: IFoodCategory) => cat._id.toString() === category._id.toString()
            )
          )

          return {
            _id: category._id,
            name: category.name,
            description: category.description,
            url: category.url,
            public_id: category.public_id,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            foodItems: categoryFoodItems.map((item) => ({
              _id: item._id,
              name: item.name,
              description:
                item.description.length > 40
                  ? item.description.slice(0, 37) + '...'
                  : item.description,
              price: item.price,
              category: item.category,
              veg: item.veg,
              available: item.available,
              public_id: item.public_id,
              url: item.url,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
              days: item.days,
            })),
          }
        })

        const categoriesWithFood = categoriesWithFoodItems.filter(
          (category) => category.foodItems.length > 0
        )

        return {
          day: dayName,
          displayName: dayName.charAt(0).toUpperCase() + dayName.slice(1),
          foodItems: categoriesWithFood,
        }
      })
    )

    // ✅ Remove empty days from response
    const daysWithFood = daysWithFoodItems.filter(
      (day) => day.foodItems.length > 0 && validDays.includes(day.day)
    )

    return NextResponse.json({
      data: {
        items: daysWithFood,
        total: daysWithFood.length,
        type: 'weekly-menu',
      },
      message: 'Weekly menu food items fetched successfully',
    })
  } catch (error) {
    console.error('Error fetching food items by category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch food items by category' },
      { status: 500 }
    )
  }
}
