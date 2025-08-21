import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import Stripe from 'stripe'
import { serverEnv } from '../../../../data/env/server'
import FoodItem from 'models/FoodItem'
import Cart from 'models/Cart'

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  // Auth validation
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let userId: string | null = null
  if (token) {
    try {
      const user = decodeAccessToken(token)
      userId = user.id
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
  } else {
    const authResult = await verifyAuth(req)
    if (authResult instanceof NextResponse) return authResult
    userId = authResult.user.id
  }

  try {
    await connectToDatabase()

    const body = await req.json()
    const { deliveryAddress, currency = 'usd' } = body

    // 1. Fetch user's cart and validate it exists
    const userCart = await Cart.findOne({ user: userId }).populate({
      path: 'days.items.food',
      model: FoodItem,
    })

    if (!userCart || !userCart.days || userCart.days.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart is empty or not found' },
        { status: 400 }
      )
    }

    // 2. Server-side validation: Check stock, recalculate prices, validate items
    const validatedItems = []
    let totalSubtotal = 0

    for (const day of userCart.days) {
      if (day.items.length === 0) continue

      const dayItems = []
      let dayTotal = 0

      for (const cartItem of day.items) {
        const foodItem = cartItem.food
        if (!foodItem) {
          return NextResponse.json(
            { success: false, error: `Food item not found: ${cartItem.food}` },
            { status: 400 }
          )
        }

        // Validate stock
        if (foodItem.stock < cartItem.quantity) {
          return NextResponse.json(
            {
              success: false,
              error: `Insufficient stock for ${foodItem.name}. Available: ${foodItem.stock}, Requested: ${cartItem.quantity}`,
            },
            { status: 400 }
          )
        }

        // Use server-side price (never trust frontend)
        const itemTotal = foodItem.price * cartItem.quantity
        dayTotal += itemTotal

        dayItems.push({
          food: foodItem._id,
          quantity: cartItem.quantity,
          price: foodItem.price, // Server-side price
        })
      }

      if (dayItems.length > 0) {
        validatedItems.push({
          day: day.day,
          deliveryDate: day.date,
          items: dayItems,
          dayTotal,
        })
        totalSubtotal += dayTotal
      }
    }

    if (validatedItems.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid items in cart' }, { status: 400 })
    }

    // 3. Calculate totals server-side (never trust frontend)
    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = totalSubtotal > 100 ? 10.0 : 5.0
    const taxes = totalSubtotal * 0.1
    const totalAmount = totalSubtotal + platformFee + deliveryFee - discountAmount + taxes

    // 4. Create order with pending status
    const newOrder = new Order({
      user: userId,
      address: deliveryAddress,
      items: validatedItems,
      totalPaid: totalAmount,
      currency,
      status: 'pending',
      paymentStatus: 'unpaid',
      paymentMethod: 'Credit Card',
      platformFee,
      deliveryFee,
      discount: {
        amount: discountAmount,
        code: 'TRYNEW',
      },
      taxes,
    })

    const savedOrder = await newOrder.save()

    // 5. Create Stripe PaymentIntent
    if (!serverEnv.STRIPE_SECRET_KEY) {
      return NextResponse.json({ success: false, error: 'Stripe not configured' }, { status: 500 })
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100), // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderId: savedOrder.orderId,
        userId: userId,
      },
      description: `Order ${savedOrder.orderId} - NikFoods`,
    })

    // 6. Update order with Stripe PaymentIntent ID
    savedOrder.stripePaymentIntentId = paymentIntent.id
    await savedOrder.save()

    return NextResponse.json({
      success: true,
      data: {
        orderId: savedOrder.orderId,
        _id: savedOrder._id.toString(),
        totalAmount: totalAmount.toFixed(2),
        currency,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
      message: 'Order created successfully',
    })
  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}
