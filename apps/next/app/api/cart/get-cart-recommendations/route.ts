import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import FoodItem from 'models/FoodItem'
import mongoose from 'mongoose'
import FoodCategory from 'models/FoodCategory'
import { verifyAuth } from 'lib/verifyJwt'
import CartItem from 'models/CartItem'

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id } = authResult.user
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 10
    const dessert = await FoodCategory.findOne({ name: 'Dessert' })
    if (!dessert) {
      return NextResponse.json({ error: 'Dessert not found' }, { status: 400 })
    }

    const filter = {
      category: dessert._id,
    }

    const totalItems = await FoodItem.countDocuments(filter)

    const foodItems = await FoodItem.find(filter)
      .skip((page - 1) * limit)
      .limit(2)

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

    return NextResponse.json({
      data: {
        items:foodItemsWithCart,
        total: totalItems,
        page,
        pageSize: limit,
      },
      message: 'Recommendations fetched successfully',
    })
  } catch (error) {
    console.error('Error fetching Recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch Recommendations' }, { status: 500 })
  }
}
