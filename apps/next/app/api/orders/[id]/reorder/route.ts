import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth } from 'lib/verifyJwt'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req)
  if (auth instanceof NextResponse) return auth

  await connectToDatabase()
  const oldOrder = await Order.findById(params.id)
  if (!oldOrder) {
    return NextResponse.json({ success: false, error: 'Original order not found' }, { status: 404 })
  }

  const newOrder = new Order({
    user: oldOrder.user,
    address: oldOrder.address,
    items: oldOrder.items,
    totalPaid: oldOrder.totalPaid,
    platformFee: oldOrder.platformFee,
    deliveryFee: oldOrder.deliveryFee,
    discount: oldOrder.discount,
    taxes: oldOrder.taxes,
    paymentMethod: oldOrder.paymentMethod,
    status: 'pending',
  })

  await newOrder.save()

  return NextResponse.json({
    success: true,
    message: 'Reorder placed successfully',
    data: { id: newOrder.orderId, _id: newOrder._id },
  })
}
