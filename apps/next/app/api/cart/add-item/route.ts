import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Cart from 'models/Cart'
import CartItem from 'models/CartItem'
import mongoose from 'mongoose'
import { verifyAuth } from 'lib/verifyJwt'
import CartDay from 'models/CartDay'

export async function POST(req: NextRequest) {
  const authResult = await verifyAuth(req)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id } = authResult.user
  let session: mongoose.ClientSession | null = null

  try {
    const { days, foodItemId, quantity = 1 } = await req.json()

    if (!id || !days || !Array.isArray(days) || !foodItemId) {
      return NextResponse.json(
        { error: 'userId, days[], and foodItemId are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    session = await mongoose.startSession()
    session.startTransaction()

    const cart = await Cart.findOne({ user: id }).populate('days')
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    const createdItems = []

    // Process each day
    for (const { day_name, date } of days) {
      const cartDay = await CartDay.findOne({ cart: cart._id, day: day_name })

      if (!cartDay) {
        console.warn(`CartDay for ${day_name} not found!`)
        continue
      }

      // Create CartItem for this day
      const newItem = await CartItem.create(
        [
          {
            food: foodItemId,
            quantity,
            day: cartDay._id,
          },
        ],
        { session }
      )

      // Update date if provided
      if (date) cartDay.date = new Date(date)

      // Add item to day
      cartDay.items.push(newItem[0])
      await cartDay.save({ session })

      createdItems.push(newItem[0])
    }

    await session.commitTransaction()
    session.endSession()

    return NextResponse.json(
      { message: 'Item added to selected days', data: createdItems },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add to cart error:', error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 })
  }
}
