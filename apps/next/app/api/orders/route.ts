import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import DeliveryBoy from 'models/DeliveryBoy'
import Review from 'models/Review'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import mongoose from 'mongoose'
import User from 'models/User'

// Define interfaces for better type safety
interface OrderItem {
  day: string
  deliveryDate: string
  products: {
    name: string
    quantity: number
    price: number
  }[]
  dayTotal: number
}

interface OrderDocument {
  _id: mongoose.Types.ObjectId
  orderId: string
  user: mongoose.Types.ObjectId
  date: Date
  items: OrderItem[]
  totalPaid: number
  status: string
  restaurant: {
    name: string
    location: string
  }
  deliveryAddress: any
  paymentMethod: string
  platformFee: number
  deliveryFee: number
  discount: {
    amount: number
    code: string
  }
  taxes: number
  createdAt?: Date
  updatedAt?: Date
}

interface ReviewDocument {
  _id: mongoose.Types.ObjectId
  order: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId
  rating: number
  reviewText: string
  selectedItems: string[]
  createdAt: Date
}

// --- GET all orders with simple pagination ---
// Fixed GET endpoint - replace your existing GET function
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let userId: string | null = null
  if (token) {
    try {
      const user = decodeAccessToken(token)
      userId = user.id
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }
  }

  let id: string
  if (!userId) {
    const authResult = await verifyAuth(req)
    if (authResult instanceof NextResponse) return authResult
    id = authResult.user.id
  } else {
    id = userId
  }

  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const skip = (page - 1) * limit

    // Fetch orders with deliveryBoy and user populated
    const orders = await Order.find({ user: id, status:"confirmed",paymentStatus:"paid" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate({
        path: 'user',
        model: User,
      })
      .lean()

    const total = await Order.countDocuments({ user: id })
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

    // Get reviews for fetched orders
    const orderIds = orders.map((o) => o._id)
    const reviews = await Review.find({ order: { $in: orderIds }, user: id }).lean()
    const reviewMap = reviews.reduce(
      (acc, review) => {
        acc[review.order.toString()] = review
        return acc
      },
      {} as Record<string, (typeof reviews)[0]>
    )

    // Format orders
    const formattedOrders = orders.map((order: any) => {
      const hasReview = !!reviewMap[order?._id.toString()]
      const reviewData = reviewMap[order?._id.toString()]

      const formattedItems = (order.items || []).map((dayItem: any) => ({
        day: dayItem.day,
        deliveryDate: new Date(dayItem.deliveryDate).toISOString().split('T')[0],
        products: (dayItem.items || []).map((productItem: any) => ({
          name: productItem.food?.name || 'Unknown',
          quantity: productItem.quantity,
          price: productItem.price,
        })),
        dayTotal: `$${(dayItem.dayTotal || 0).toFixed(2)}`,
      }))

      return {
        id: order.orderId || 'N/A',
        _id: order._id?.toString(),
        date: order.createdAt
          ? new Date(order.createdAt).toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          : 'Invalid Date',
        items: formattedItems,
        totalPaid: `$${(order.totalPaid || 0).toFixed(2)}`,
        status: order.status,
        hasReview,
        reviewData: hasReview
          ? {
              rating: reviewData.rating,
              reviewText: reviewData.reviewText,
              selectedItems: reviewData.selectedItems,
              timestamp: reviewData.createdAt,
            }
          : null,
        restaurant: {
          name: 'Nikfoods',
          location: 'San Francisco',
        },
        deliveryAddress: order?.address, // Now contains complete address copy
        deliveryBoy: order.deliveryBoy
          ? {
              name: order.deliveryBoy.name,
              phone: order.deliveryBoy.phone,
              email: order.deliveryBoy.email,
              vehicleNumber: order.deliveryBoy.vehicleNumber,
            }
          : null,
        paymentMethod: order.paymentMethod || 'Not specified',
        platformFee: `$${(order.platformFee || 0).toFixed(2)}`,
        deliveryFee: `$${(order.deliveryFee || 0).toFixed(2)}`,
        discount: {
          amount: `$${(order.discount?.amount || 0).toFixed(2)}`,
          code: order.discount?.code || '',
        },
        taxes: `$${(order.taxes || 0).toFixed(2)}`,
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
    console.error('Error fetching orders:', error)
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
// --- POST create new order ---
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let userId: string | null = null
  if (token) {
    try {
      const user = decodeAccessToken(token)
      userId = user.id
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 404 })
    }
  }

  let id: string
  if (!userId) {
    const authResult = await verifyAuth(req)

    if (authResult instanceof NextResponse) {
      return authResult
    }

    id = authResult.user.id
  } else {
    id = userId
  }

  try {
    await connectToDatabase()

    const body = await req.json()
    const {
      items,
      deliveryAddress,
      paymentMethod,
    }: {
      items: OrderItem[]
      deliveryAddress?: string
      paymentMethod?: string
    } = body
    console.log('Delivery Address:', deliveryAddress)
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Items are required and must be a non-empty array',
        },
        { status: 400 }
      )
    }

    // Calculate totals
    const itemTotal = items.reduce((sum: number, item: OrderItem) => sum + item.dayTotal, 0)
    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = itemTotal > 100 ? 10.0 : 5.0 // More reasonable discount
    const taxes = itemTotal * 0.1
    const totalPaid = itemTotal + platformFee + deliveryFee - discountAmount + taxes

    const newOrder = new Order({
      user: id,
      address: deliveryAddress || '',
      items,
      totalPaid,
      platformFee,
      deliveryFee,
      discount: {
        amount: discountAmount,
        code: 'TRYNEW',
      },
      taxes,
      status: 'pending', // Start with pending status
    })

    const savedOrder = await newOrder.save()

    return NextResponse.json(
      {
        success: true,
        data: {
          id: savedOrder.orderId,
          _id: savedOrder._id.toString(),
          totalPaid: `$${savedOrder.totalPaid.toFixed(2)}`,
          status: savedOrder.status,
          date: savedOrder.date,
        },
        message: 'Order created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
