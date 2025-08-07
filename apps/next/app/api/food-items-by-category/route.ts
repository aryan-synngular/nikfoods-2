import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import FoodCategory from 'models/FoodCategory'
import FoodItem from 'models/FoodItem'
import CartItem from 'models/CartItem' // Add this import
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

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const vegOnly = searchParams.get('vegOnly') === 'true'

    // Get all categories
    const categories = await FoodCategory.find().sort({ createdAt: 1 })

    // Build food items query with search and veg filter
    let foodItemsQuery: any = { available: true }

    if (search) {
      foodItemsQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    if (vegOnly) {
      foodItemsQuery.veg = true
    }

    // Get all food items with populated category information
    const foodItems = await FoodItem.find(foodItemsQuery)
      .populate('category')
      .sort({ createdAt: -1 })

    // For each food item, find related cart items for this user and populate 'day'
    const foodItemsWithCart = await Promise.all(
      foodItems.map(async (item) => {
        // Populate 'day' (not 'CartDay') in CartItem
        const cartItems = await CartItem.find({
          user: id,
          food: item._id,
        }).populate('day')

        // Filter logic for today's cart items
        const filteredCartItems = cartItems.filter(cartItem => {
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
          days: filteredCartItems.map(cartItem => cartItem.toObject()),
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
            item.description.length > 40 ? item.description.slice(0, 37) + '...' : item.description,
          price: item.price,
          category: item.category,
          veg: item.veg,
          available: item.available,
          public_id: item.public_id,
          url: item.url,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          days: item.days, // <-- Add the days field here
        })),
      }
    })

    // Filter out categories that have no food items (optional)
    const categoriesWithFood = categoriesWithFoodItems.filter(
      (category) => category.foodItems.length > 0
    )

    return NextResponse.json({
      data: {
        items: categoriesWithFood,
        page: 0,
        total: categoriesWithFood.length,
        pageSize: 0,
      },
      message: 'Food items organized by category fetched successfully',
    })
  } catch (error) {
    console.error('Error fetching food items by category:', error)
    return NextResponse.json({ error: 'Failed to fetch food items by category' }, { status: 500 })
  }
}
