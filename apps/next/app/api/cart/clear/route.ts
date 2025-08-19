import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { connectToDatabase } from 'lib/db'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import Cart from 'models/Cart'
import CartDay from 'models/CartDay'
import CartItem from 'models/CartItem'

export async function POST(req: NextRequest) {
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

  let session: mongoose.ClientSession | null = null

  try {
    await connectToDatabase()
    session = await mongoose.startSession()
    session.startTransaction()

    const cart = await Cart.findOne({ user: id }).populate('days')

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 })
    }

    const cartDayIds = cart.days.map((day: any) => day._id)

    // Delete all cart items for the user's cart days
    await CartItem.deleteMany({ day: { $in: cartDayIds } }, { session })

    // Reset days' items and values
    for (const cartDay of cart.days) {
      cartDay.items = []
      cartDay.cart_value = 0
      await cartDay.save({ session })
    }

    await session.commitTransaction()
    session.endSession()

    return NextResponse.json({ message: 'Cart cleared successfully' }, { status: 200 })
  } catch (error) {
    console.error('Error clearing cart:', error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
  }
}
