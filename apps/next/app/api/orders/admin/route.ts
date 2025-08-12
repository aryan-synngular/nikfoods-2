import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import Review from 'models/Review'
import { verifyAuth } from 'lib/verifyJwt'
import { ROLE } from 'app/constants/app.constant'

export async function GET(req: NextRequest) {
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult

  const { role } = authResult.user
  if (role !== ROLE.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const status = searchParams.get('status') || undefined
    const skip = (page - 1) * limit

    const filter: any = {}
    if (status && status !== 'all') {
      filter.status = status
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate({ path: 'user', select: 'name email' })
      .populate({ path: 'items.items.food', select: 'name price' })
      .lean()

    const total = await Order.countDocuments(filter)
    const totalPages = Math.ceil(total / limit)

    if (!orders || orders.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          items: [],
          page,
          pageSize: limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
        message: 'No orders found',
      })
    }

    const orderIds = orders.map((o) => o._id)
    const reviews = await Review.find({ order: { $in: orderIds } }).lean()
    const orderIdToReviewCount = reviews.reduce((acc: Record<string, number>, r: any) => {
      const key = r.order?.toString?.() || ''
      if (!key) return acc
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const formattedOrders = orders.map((order: any) => {
      const formattedItems = (order.items || []).map((dayItem: any) => ({
        day: dayItem.day,
        deliveryDate: new Date(dayItem.deliveryDate).toISOString().split('T')[0],
        products: (dayItem.items || []).map((productItem: any) => ({
          name: typeof productItem.food === 'object' ? productItem?.food?.name : 'Unknown',
          quantity: productItem.quantity,
          price: productItem.price,
        })),
        dayTotal: Number(dayItem.dayTotal || 0),
      }))

      return {
        id: order.orderId || 'N/A',
        _id: order._id?.toString(),
        createdAt: order.createdAt,
        user: order.user
          ? {
              id: order.user._id?.toString?.(),
              name: order?.user?.name,
              email: order.user.email,
            }
          : null,
        items: formattedItems,
        totalPaid: Number(order.totalPaid || 0),
        status: order.status,
        paymentMethod: order.paymentMethod || 'Not specified',
        platformFee: Number(order.platformFee || 0),
        deliveryFee: Number(order.deliveryFee || 0),
        discount: {
          amount: Number(order.discount?.amount || 0),
          code: order.discount?.code || '',
        },
        taxes: Number(order.taxes || 0),
        reviews: orderIdToReviewCount[order._id.toString()] || 0,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        items: formattedOrders,
        page,
        pageSize: limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      message: 'Orders fetched successfully',
    })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
