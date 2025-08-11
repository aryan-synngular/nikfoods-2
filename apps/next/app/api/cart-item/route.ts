import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import CartDay from 'models/CartDay'
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
    console.log('New Quantity:', newQuantity)
    if (newQuantity < 1) {
      console.log('Removing item due to non-positive quantity')
       // Remove from CartDay.items
                await CartDay.updateOne(
                  { _id: item.day },
                  { $pull: { items: item._id } },
                 
                )
                // Remove CartItem
                await CartItem.deleteOne({ _id: item._id })
      // If quantity is 0 or negative, remove the item
      await CartItem.deleteOne({ _id: item._id  })
      return NextResponse.json({ data: null, message: 'Cart Item deleted Successfully' })

    } else {
      item.quantity = newQuantity
      await item.save()
      return NextResponse.json({ data: item, message: 'Quantity Updated Successfully' })
    }
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 400 })
  }
}
