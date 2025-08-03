// Directory: /app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth } from 'lib/verifyJwt'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await verifyAuth(req)
  if (auth instanceof NextResponse) return auth

  const body = await req.json()
  const { status }: { status: string } = body

  const validStatuses = ['confirmed', 'preparing', 'dispatched', 'delivered']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
  }

  await connectToDatabase()
  const order = await Order.findById(params.id)
  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  order.status = status
  await order.save()

  return NextResponse.json({ success: true, message: 'Order status updated', data: { status } })
}
