import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import CartItem from 'models/CartItem'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest) {
  const authResult = await verifyAuth(req)

  if (authResult instanceof NextResponse) {
    return authResult
  }

  const { id } = authResult.user

  try {
    const { cartItemId, change } = await req.json()
    // `change` is expected to be +1 or -1

    if (!cartItemId || ![1, -1].includes(change)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    await connectToDatabase()

    // Find the cart item for this user and foodId
    const item = await CartItem.findById(cartItemId)

    if (!item) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
    }

    // Update quantity
    const newQuantity = item.quantity + change
    if (newQuantity < 1) {
      // If quantity is 0 or negative, remove the item
      return NextResponse.json({ error: 'Quantity cannot be less then 1' }, { status: 400 })
    } else {
      item.quantity = newQuantity
      await item.save()
      return NextResponse.json({ data: item, message: 'Qunatity Updated Successfully' })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 400 })
  }
}
