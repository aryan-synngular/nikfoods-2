import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import { verifyAuth } from 'lib/verifyJwt'
import UpdateOrder from 'models/UpdateOrder'
import Order from 'models/Orders'
import FoodItem from 'models/FoodItem'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  // ✅ Auth
  const authResult = await verifyAuth(req)
  if (authResult instanceof NextResponse) return authResult
  const { id: userId } = authResult.user

  try {
    await connectToDatabase()

    const { updatingOrderId, currency = 'usd' } = await req.json()

    if (!updatingOrderId) {
      return NextResponse.json(
        { success: false, error: 'updatingOrderId is required' },
        { status: 400 }
      )
    }

    // Fetch updating order and populate original order
    const updatingOrder = await UpdateOrder.findById(updatingOrderId).populate({
      path: 'originalOrderId',
      model: Order,
    })

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

    // Calculate total amount dynamically from updating order items
    const days = updatingOrder.items || []
    if (!days || days.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No items in updating order' },
        { status: 400 }
      )
    }

    // Calculate subtotal by fetching food prices dynamically
    let subtotal = 0
    for (const day of days) {
      for (const item of day.items) {
        const food = await FoodItem.findById(item.food)
        if (food && food.price) {
          subtotal += food.price * item.quantity
        }
      }
    }

    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = subtotal > 100 ? 10.0 : 5.0
    const taxes = subtotal * 0.1
    const totalAmount = subtotal + platformFee + deliveryFee - discountAmount + taxes

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: {
        updatingOrderId: updatingOrder._id.toString(),
        orderId: originalOrder._id.toString(),
        userId,
        orderType:"UPDATE"
      },
      description: `Order Update ${updatingOrder._id} - NikFoods`,
    })

    return NextResponse.json({
      success: true,
      data: {
        orderId: updatingOrder._id.toString(),
        originalOrderId: originalOrder.orderId.toString(),
        totalAmount: totalAmount.toFixed(2),
        currency,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      message: 'Secure updating order created successfully',
    })
  } catch (error: any) {
    console.error('Error creating secure updating order:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create secure updating order' },
      { status: 500 }
    )
  }
}
