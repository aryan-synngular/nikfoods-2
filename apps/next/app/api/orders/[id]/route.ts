import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth } from 'lib/verifyJwt'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Auth validation
    const authResult = await verifyAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult.user.id

    await connectToDatabase()

    const { id } = params
    console.log('Getting order details for id:', id, 'userId:', userId)

    // Find the order and verify it belongs to the user
    const order = await Order.findOne({ orderId: `#${id}`, user: userId })
    console.log('Order found:', order ? 'Yes' : 'No')

    if (!order) {
      console.log('Order not found for id:', id, 'userId:', userId)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const response = {
      success: true,
      data: {
        orderId: order.orderId,
        _id: order._id,
        user: order.user,
        address: order.address,
        items: order.items,
        totalPaid: order.totalPaid,
        currency: order.currency,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        platformFee: order.platformFee,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        taxes: order.taxes,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      },
    }

    console.log('Returning order details:', response)
    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Error getting order details:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get order details',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
