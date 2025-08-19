import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Cart from 'models/Cart'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import mongoose from 'mongoose'
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let userId: string | null = null
  if (token) {
    try {
      const user = decodeAccessToken(token)
      userId = user.id
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }
  }

  let id: string
  if (!userId) {
    const authResult = await verifyAuth(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    id = authResult.user.id
  } else {
    id = userId
  }

  try {
    await connectToDatabase()
    const cart = await Cart.findOne({ user: id }).populate({
      path: 'days',
      populate: {
        path: 'items',
        model: 'CartItem',
        populate: {
          path: 'food',
          model: 'FoodItem', // if you want details of food
        },
      },
    })
    console.log(cart)
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    const totalAmount = () => {
      if (!cart?.days || cart.days.length === 0) return 0

      return cart.days.reduce((dayAcc: number, day: any) => {
        const dayTotal =
          day?.items?.reduce((itemAcc: number, item: any) => {
            const price = item.food?.price || 0
            return itemAcc + price * (item.quantity || 1)
          }, 0) || 0
        return dayAcc + dayTotal
      }, 0)
    }

    return NextResponse.json(
      { message: 'Cart total amount', data: { total: totalAmount() } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to get total', error)
    return NextResponse.json({ error: 'Failed to get total' }, { status: 500 })
  }
}
