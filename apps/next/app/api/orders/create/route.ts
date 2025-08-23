// app/api/orders/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from 'lib/db'
import Order from 'models/Orders'
import { verifyAuth, decodeAccessToken } from 'lib/verifyJwt'
import Stripe from 'stripe'
import { serverEnv } from '../../../../data/env/server'
import FoodItem from 'models/FoodItem'
import Cart from 'models/Cart'
import Address from 'models/Address'
import CartItem from 'models/CartItem'

const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  // ✅ Auth
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  let userId: string | null = null
  if (token) {
    try {
      const user = decodeAccessToken(token)
      userId = user.id
    } catch {
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

    // ✅ Fetch user cart
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const userCart = await Cart.findOne({ user: userId }).populate({
      path: 'days',
      match: { date: { $gte: today } },
      populate: {
        path: 'items',
        model: CartItem,
        populate: {
          path: 'food',
          model: FoodItem,
        },
      },
    })

    if (!userCart || !userCart.days?.length) {
      return NextResponse.json({ success: false, error: 'Cart empty' }, { status: 400 })
    }

    // ✅ Fetch delivery address
    const addressDetails = await Address.findById(deliveryAddress)
    if (!addressDetails) {
      return NextResponse.json({ success: false, error: 'Delivery address not found' }, { status: 400 })
    }

    // ✅ Recalc items + totals
    const validatedItems: any[] = []
    let totalSubtotal = 0

    for (const day of userCart.days) {
      const dayItems = []
      let dayTotal = 0

      for (const cartItem of day.items) {
        const foodItem = cartItem.food
        if (!foodItem) continue
        const itemTotal = foodItem.price * cartItem.quantity
        dayTotal += itemTotal

        dayItems.push({
          food: {
            _id: foodItem._id,
            name: foodItem.name,
            price: foodItem.price,
            category: foodItem.category,
            veg: foodItem.veg,
            available: foodItem.available,
            url: foodItem.url,
          },
          quantity: cartItem.quantity,
          price: foodItem.price,
        })
      }

      if (dayItems.length) {
        validatedItems.push({
          day: day.day,
          deliveryDate: day.date,
          items: dayItems,
          dayTotal,
        })
        totalSubtotal += dayTotal
      }
    }

    if (!validatedItems.length) {
      return NextResponse.json({ success: false, error: 'No valid items in cart' }, { status: 400 })
    }

    const platformFee = 1.0
    const deliveryFee = 10.0
    const discountAmount = totalSubtotal > 100 ? 10.0 : 5.0
    const taxes = totalSubtotal * 0.1
    const totalAmount = totalSubtotal + platformFee + deliveryFee - discountAmount + taxes

    // ✅ STEP 1: Check existing pending order for this user
    let order = await Order.findOne({ user: userId, status: 'pending', paymentStatus: 'unpaid' })
    if (order) {
      const intent=await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)
      console.log(intent)
      
      console.log("EXISTING ORDER")
      console.log(order)
      // --- Update order snapshot + totals ---
      order.items = validatedItems
      order.totalPaid = totalAmount
      order.platformFee = platformFee
      order.deliveryFee = deliveryFee
      order.discount = { amount: discountAmount, code: 'TRYNEW' }
      order.taxes = taxes
      order.address = addressDetails

      await order.save()
if (['requires_payment_method', 'requires_confirmation', 'requires_action', 'processing'].includes(intent.status)) {
  console.log("INTENT PENDING")
    await stripe.paymentIntents.update(order.stripePaymentIntentId, {
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: { orderId: order.orderId, userId,orderType:"NEW" },
      description: `Order ${order.orderId} - NikFoods`,
    })
  } 
  // --- CASE 2: Intent already finished, create a new one ---
  else {
  console.log("INTENT NEW")

    const newIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency,
      metadata: { orderId: order.orderId, userId,orderType:"NEW" },
      description: `Order ${order.orderId} - NikFoods`,
    })
    order.stripePaymentIntentId = newIntent.id
  }

    } else {

      console.log("New ORDER")
      console.log(order)
      // ✅ STEP 2: No pending order → create new
      order = new Order({
        user: userId,
        address: addressDetails,
        items: validatedItems,
        totalPaid: totalAmount,
        currency,
        status: 'pending',
        paymentStatus: 'unpaid',
        paymentMethod: 'Credit Card',
        platformFee,
        deliveryFee,
        discount: { amount: discountAmount, code: 'TRYNEW' },
        taxes,
      })

      await order.save()

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(totalAmount * 100),
        currency,
        // automatic_payment_methods: { enabled: true },
        metadata: { orderId: order.orderId, userId,orderType:"NEW" },
        description: `Order ${order.orderId} - NikFoods`,
      })

      order.stripePaymentIntentId = paymentIntent.id
      await order.save()
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        _id: order._id.toString(),
        totalAmount: totalAmount.toFixed(2),
        currency,
        clientSecret: order.stripePaymentIntentId
          ? (await stripe.paymentIntents.retrieve(order.stripePaymentIntentId)).client_secret
          : null,
        paymentIntentId: order.stripePaymentIntentId,
      },
      message:'Order created successfully',
    })
  } catch (error: any) {
    console.error('Error creating/updating order:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
