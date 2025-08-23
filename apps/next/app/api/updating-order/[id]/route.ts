import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import UpdateOrder from 'models/UpdateOrder'
import Order from 'models/Orders'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { id: userId } = authResult.user

  try {
    await connectToDatabase()

    const { id } = params

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid updating order id' },
        { status: 400 }
      )
    }

    // Fetch updating order and populate its original order
    const updatingOrder = await UpdateOrder.findById(id).populate({
      path: 'originalOrderId',
      model: Order,
    })
console.log("---updatingOrder")
console.log(updatingOrder)
    if (!updatingOrder) {
      return NextResponse.json(
        { success: false, error: 'Updating order not found' },
        { status: 404 }
      )
    }

    // Ownership check through original order's user
    const originalOrder: any = updatingOrder.originalOrderId
    if (!originalOrder || String(originalOrder.user) !== String(userId)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 })
    }
    

    return NextResponse.json({
      success: true,
      data: {
        updatingOrder,
        originalOrder, // convenience alias; same as updatingOrder.originalOrderId
      },
    })
  } catch (error) {
    console.error('Get updating order error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch updating order' },
      { status: 500 }
    )
  }
}
