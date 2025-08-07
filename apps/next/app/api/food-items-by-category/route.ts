import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import FoodCategory from 'models/FoodCategory'
import FoodItem from 'models/FoodItem'
import { IFoodCategory } from 'app/types/category'

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    // Get all categories
    const categories = await FoodCategory.find().sort({ createdAt: -1 })

    // Get all food items with populated category information
    const foodItems = await FoodItem.find({ available: true })
      .populate('category')
      .sort({ createdAt: -1 })

    // Organize food items by category
    const categoriesWithFoodItems = categories.map((category) => {
      const categoryFoodItems = foodItems.filter((foodItem) =>
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
