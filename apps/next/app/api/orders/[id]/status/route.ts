// Directory: /app/api/orders/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth } from 'lib/verifyJwt'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Admin authentication
    const authResult = await verifyAuth(req)
    if (authResult instanceof NextResponse) return authResult

    // TODO: Add admin role check here
    // const user = authResult.user
    // if (user.role !== 'admin') {
    //   return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    // }

    await connectToDatabase()

    const { id } = params
    const body = await req.json()
    const { status } = body

    // Validate status
    const validStatuses = [
      'pending',
      'confirmed',
      'preparing',
      'out_for_delivery',
      'delivered',
      'cancelled',
    ]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
    }

    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
    }

    // Update order status
    order.status = status
    await order.save()

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        updatedAt: order.updatedAt,
      },
      message: 'Order status updated successfully',
    })
  } catch (error: any) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update order status',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
