import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth } from 'lib/verifyJwt'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req)
  if (auth instanceof NextResponse) return auth

  const { id: orderId } = params
  await connectToDatabase()

  const order = await Order.findById(orderId)
  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    return NextResponse.json(
      { success: false, error: 'Cannot cancel at this stage' },
      { status: 400 }
    )
  }

  order.status = 'cancelled'
  await order.save()

  return NextResponse.json({ success: true, message: 'Order cancelled successfully' })
}
