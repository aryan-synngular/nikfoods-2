import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import UpdateOrder from 'models/UpdateOrder'
import { verifyAuth } from 'lib/verifyJwt'

export async function GET(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    // Auth validation
    const authResult = await verifyAuth(req)
    if (authResult instanceof NextResponse) return authResult
    const userId = authResult.user.id

    await connectToDatabase()

    const { orderId } = params
    const { searchParams } = new URL(req.url)
    const orderType = searchParams.get('orderType') // 'NEW' or 'UPDATE'
    const updatingOrderId = searchParams.get('updatingOrderId') // For UPDATE type


    let orderData = null

    if (orderType === 'UPDATE' && updatingOrderId) {
      // Check updating order status
      const updatingOrder = await UpdateOrder.findById(updatingOrderId)
      if (!updatingOrder) {
        return NextResponse.json({ error: 'Updating order not found' }, { status: 404 })
      }

      // Verify ownership through original order
      const originalOrder = await Order.findById(updatingOrder.originalOrderId)
      if (!originalOrder || String(originalOrder.user) !== String(userId)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }

      orderData = {
        orderId: updatingOrder._id.toString(),
        paymentStatus: updatingOrder.paymentStatus,
        orderStatus: updatingOrder.status,
        stripePaymentIntentId: updatingOrder.stripePaymentIntentId,
        orderType: 'UPDATE',
      }
    } else {
      // Check regular order status
      const order = await Order.findOne({ orderId: '#' + orderId, user: userId })
      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      orderData = {
        orderId: order.orderId,
        paymentStatus: order.paymentStatus,
        orderStatus: order.status,
        stripePaymentIntentId: order.stripePaymentIntentId,
        orderType: 'NEW',
      }
    }

    return NextResponse.json({
      success: true,
      data: orderData,
    })
  } catch (error: any) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check payment status',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
