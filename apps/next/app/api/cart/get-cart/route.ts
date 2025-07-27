import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Cart from 'models/Cart'
import { verifyAuth } from 'lib/verifyJwt'
import CartItem from 'models/CartItem'
import FoodItem from 'models/FoodItem'

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id } = authResult.user

  try {
    await connectToDatabase()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cart = await Cart.findOne({ user: id }).populate({
      path: 'days',
      match: { date: { $gte: today } },
      populate: {
        path: 'items',
        model: CartItem,
        populate: {
          path: 'food',
          model: FoodItem, // if you want details of food
        },
      },
    })

    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    return NextResponse.json({ message: 'Cart fetched successfully', data: cart }, { status: 201 })
  } catch (error) {
    console.error('Failed to fetch cart', error)
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}
