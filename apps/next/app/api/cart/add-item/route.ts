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
  console.log('User ID:', id)
  let session: mongoose.ClientSession | null = null

  try {
    const { removed, edited, added, foodItemId } = await req.json()
console.log('Request body:', { removed, edited, added, foodItemId })
    if (!id || !foodItemId) {
      return NextResponse.json(
        { error: 'userId and foodItemId are required' },
        { status: 400 }
      )
    }

    await connectToDatabase()
    session = await mongoose.startSession()
    session.startTransaction()

    const cart = await Cart.findOne({ user: id }).populate('days')
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

    const results = {
      removed: [],
      edited: [],
      added: [],
    }

    // 1. Remove items
    if (Array.isArray(removed)) {
      for (const cartItemId of removed) {
        const cartItem = await CartItem.findById(cartItemId)
        if (cartItem) {
          // Remove from CartDay.items
          await CartDay.updateOne(
            { _id: cartItem.day },
            { $pull: { items: cartItem._id } },
            { session }
          )
          // Remove CartItem
          await CartItem.deleteOne({ _id: cartItemId }, { session })
          results.removed.push(cartItemId)
        }
      }
    }

    // 2. Edit items
    if (Array.isArray(edited)) {
      for (const { cartItemId, quantity } of edited) {
        const cartItem = await CartItem.findById(cartItemId)
        if (cartItem) {
          cartItem.quantity = quantity
          await cartItem.save({ session })
          results.edited.push({ cartItemId, quantity })
        }
      }
    }

    // 3. Add new items
    if (Array.isArray(added)) {
      for (const { day_name, date, quantity } of added) {
        let cartDay = await CartDay.findOne({ cart: cart._id, day: day_name })
        if (!cartDay) {
          // Create CartDay if not exists
          cartDay = await CartDay.create(
            [
              {
                cart: cart._id,
                day: day_name,
                date: date ? new Date(date) : undefined,
                items: [],
              },
            ],
            { session }
          )
          console.log('Created new CartDay:', date)
          console.log('Created new CartDay:', cartDay)
          cartDay = Array.isArray(cartDay) ? cartDay[0] : cartDay
          cart.days.push(cartDay._id)
          await cart.save({ session })
        } else if (date) {
          console.log('Created new CartDay:', date)
          console.log('Created new CartDay:', cartDay)
          cartDay.date = new Date(date)
        }

        // Create CartItem for this day
        const newItem = await CartItem.create(
          [
            {
              food: foodItemId,
              quantity,
              day: cartDay._id,
              cart: cart._id,
              user: id,
            },
          ],
          { session }
        )

        cartDay.items.push(newItem[0])
        await cartDay.save({ session })
 console.log('New item added:', newItem[0])
        results.added.push(newItem[0])
      }
    }

    await session.commitTransaction()
    session.endSession()
console.log('Cart updated successfully:', results)
    return NextResponse.json(
      { message: 'Cart updated', data: results },
      { status: 201 }
    )
  } catch (error) {
    console.error('Add to cart error:', error)
    if (session) {
      await session.abortTransaction()
      session.endSession()
    }
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 })
  }
}
